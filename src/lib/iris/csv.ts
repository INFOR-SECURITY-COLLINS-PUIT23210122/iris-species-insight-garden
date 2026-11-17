// Parses and validates a user-uploaded CSV with the four Iris measurements + species.
import { FEATURES, SPECIES, type Feature, type IrisSample, type Species } from "./types";

export const MIN_ROWS = 15;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

export class CsvError extends Error {
  constructor(
    message: string,
    public details: string[] = [],
  ) {
    super(message);
    this.name = "CsvError";
  }
}

/** Normalises a header like "Sepal.Length (cm)" or "sepal_length" to "sepallength". */
const norm = (h: string) =>
  h
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/cm/g, "")
    .replace(/[^a-z]/g, "");

const HEADER_KEYS: Record<string, Feature | "species"> = {
  sepallength: "sepalLength",
  sepalwidth: "sepalWidth",
  petallength: "petalLength",
  petalwidth: "petalWidth",
  species: "species",
  variety: "species",
  class: "species",
  target: "species",
};

/** Accepts "setosa", "Iris-setosa", "Iris setosa" etc. */
export function parseSpecies(value: string): Species | null {
  const v = value.trim().toLowerCase().replace(/^iris[-_\s.]?/, "");
  return (SPECIES as readonly string[]).includes(v) ? (v as Species) : null;
}

function splitLine(line: string): string[] {
  // Simple CSV split supporting double-quoted fields.
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if ((ch === "," || ch === ";") && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseIrisCsv(text: string): IrisSample[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) throw new CsvError("The file is empty or only has a header row.");

  const header = splitLine(lines[0]!).map(norm);
  const colIndex = new Map<Feature | "species", number>();
  header.forEach((h, i) => {
    const key = HEADER_KEYS[h];
    if (key && !colIndex.has(key)) colIndex.set(key, i);
  });

  const missing = [...FEATURES, "species" as const].filter((k) => !colIndex.has(k));
  if (missing.length) {
    throw new CsvError(
      `Missing column(s): ${missing.join(", ")}.`,
      [
        "Expected headers: sepal_length, sepal_width, petal_length, petal_width, species",
        `Found: ${splitLine(lines[0]!).join(", ")}`,
      ],
    );
  }

  const rows: IrisSample[] = [];
  const errors: string[] = [];
  lines.slice(1).forEach((line, i) => {
    const rowNo = i + 2;
    const cells = splitLine(line);
    const sample: Partial<IrisSample> = {};
    for (const f of FEATURES) {
      const cell = cells[colIndex.get(f)!] ?? "";
      const n = Number(cell);
      if (cell === "" || !Number.isFinite(n)) {
        errors.push(`Row ${rowNo}: "${cell}" is not a number for ${f}.`);
        return;
      }
      if (n <= 0 || n > 30) {
        errors.push(`Row ${rowNo}: ${f} = ${n} cm is outside the plausible range (0–30 cm).`);
        return;
      }
      sample[f] = n;
    }
    const sp = parseSpecies(cells[colIndex.get("species")!] ?? "");
    if (!sp) {
      errors.push(
        `Row ${rowNo}: unknown species "${cells[colIndex.get("species")!] ?? ""}" (use setosa, versicolor or virginica).`,
      );
      return;
    }
    sample.species = sp;
    rows.push(sample as IrisSample);
  });

  if (errors.length) {
    throw new CsvError(
      `${errors.length} row${errors.length > 1 ? "s" : ""} could not be read.`,
      errors.slice(0, 6).concat(errors.length > 6 ? [`…and ${errors.length - 6} more`] : []),
    );
  }
  if (rows.length < MIN_ROWS) {
    throw new CsvError(`Need at least ${MIN_ROWS} rows to train and test; found ${rows.length}.`);
  }
  const present = new Set(rows.map((r) => r.species));
  if (present.size < 2) {
    throw new CsvError("The data must contain at least two different species.");
  }
  return rows;
}
