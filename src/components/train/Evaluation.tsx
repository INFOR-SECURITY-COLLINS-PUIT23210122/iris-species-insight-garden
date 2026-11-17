// Test-set evaluation: confusion matrix and per-class precision / recall / F1.
import { SpeciesDot } from "@/components/iris/Panel";
import type { ClassReport } from "@/lib/iris/metrics";
import { SPECIES, SPECIES_COLORS } from "@/lib/iris/types";

export function ConfusionMatrix({ matrix }: { matrix: number[][] }) {
  const max = Math.max(...matrix.flat(), 1);
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto border-separate border-spacing-1.5 text-sm">
        <thead>
          <tr>
            <th className="text-left text-[11px] font-normal text-muted-foreground">
              actual ↓ / predicted →
            </th>
            {SPECIES.map((s) => (
              <th key={s} className="px-2 pb-1 text-xs font-medium capitalize">
                <span className="flex items-center justify-center gap-1.5">
                  <SpeciesDot color={SPECIES_COLORS[s]} className="size-2" />
                  {s}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={SPECIES[i]}>
              <th className="pr-2 text-right text-xs font-medium capitalize">
                <span className="flex items-center justify-end gap-1.5">
                  <SpeciesDot color={SPECIES_COLORS[SPECIES[i]!]} className="size-2" />
                  {SPECIES[i]}
                </span>
              </th>
              {row.map((v, j) => {
                const diag = i === j;
                const intensity = v / max;
                return (
                  <td
                    key={j}
                    className="tabular size-16 rounded-lg text-center text-lg font-medium sm:size-20"
                    style={{
                      backgroundColor: v
                        ? `color-mix(in oklab, ${diag ? "var(--success)" : "var(--destructive)"} ${Math.round(18 + intensity * 62)}%, transparent)`
                        : "var(--muted)",
                      color: v && intensity > 0.55 ? "var(--primary-foreground)" : "var(--foreground)",
                    }}
                    aria-label={`${v} ${SPECIES[i]} predicted as ${SPECIES[j]}`}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ClassReportTable({ report }: { report: ClassReport[] }) {
  const f = (n: number) => n.toFixed(2);
  const totalSupport = report.reduce((a, r) => a + r.support, 0);
  const macro = (k: "precision" | "recall" | "f1") => report.reduce((a, r) => a + r[k], 0) / report.length;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="py-2 font-medium">Class</th>
            <th className="py-2 text-right font-medium">Precision</th>
            <th className="py-2 text-right font-medium">Recall</th>
            <th className="py-2 text-right font-medium">F1</th>
            <th className="py-2 text-right font-medium">Support</th>
          </tr>
        </thead>
        <tbody>
          {report.map((r, i) => (
            <tr key={SPECIES[i]} className="border-b">
              <td className="py-2 capitalize">
                <span className="flex items-center gap-2">
                  <SpeciesDot color={SPECIES_COLORS[SPECIES[i]!]} />
                  {SPECIES[i]}
                </span>
              </td>
              <td className="tabular py-2 text-right">{r.support ? f(r.precision) : "—"}</td>
              <td className="tabular py-2 text-right">{r.support ? f(r.recall) : "—"}</td>
              <td className="tabular py-2 text-right">{r.support ? f(r.f1) : "—"}</td>
              <td className="tabular py-2 text-right text-muted-foreground">{r.support}</td>
            </tr>
          ))}
          <tr className="text-muted-foreground">
            <td className="py-2 text-xs">Macro avg</td>
            <td className="tabular py-2 text-right">{f(macro("precision"))}</td>
            <td className="tabular py-2 text-right">{f(macro("recall"))}</td>
            <td className="tabular py-2 text-right">{f(macro("f1"))}</td>
            <td className="tabular py-2 text-right">{totalSupport}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function MetricTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="eyebrow">{label}</p>
      <p className="tabular mt-1 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
