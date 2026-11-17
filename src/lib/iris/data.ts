// Loads the bundled Iris dataset (150 samples) from a local CSV file,
// parsed with the same validator used for user uploads.
import irisCsv from "@/data/iris.csv?raw";
import { parseIrisCsv } from "./csv";
import type { IrisSample } from "./types";

export const DEFAULT_DATASET_NAME = "Fisher's Iris (built-in)";

let cached: IrisSample[] | null = null;

export function loadDefaultDataset(): IrisSample[] {
  cached ??= parseIrisCsv(irisCsv);
  return cached;
}
