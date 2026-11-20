// Per-feature summary statistics plus class-count bars.
import { Panel, SpeciesDot } from "@/components/iris/Panel";
import { classCounts, summarize } from "@/lib/iris/stats";
import { FEATURE_LABELS, SPECIES, SPECIES_COLORS, type IrisSample } from "@/lib/iris/types";

const fmt = (n: number) => n.toFixed(2);
const HEADINGS = ["Mean", "Std", "Min", "Median", "Max"] as const;

export function SummaryStats({ data }: { data: IrisSample[] }) {
  const stats = summarize(data);
  return (
    <Panel title="Summary statistics" description="All measurements in centimetres.">
      {/* Phones: one card per measurement so nothing has to be scrolled sideways. */}
      <ul className="grid gap-3 sm:hidden">
        {stats.map((s) => (
          <li key={s.feature} className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium">{FEATURE_LABELS[s.feature]}</p>
            <dl className="mt-2 grid grid-cols-5 gap-1">
              {HEADINGS.map((h, i) => (
                <div key={h} className="rounded-md bg-background/70 px-1 py-1.5 text-center">
                  <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">{h}</dt>
                  <dd className="tabular text-sm">{fmt([s.mean, s.std, s.min, s.median, s.max][i] ?? 0)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {/* Tablet/desktop: the statistics table. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Feature</th>
              {HEADINGS.map((h) => (
                <th key={h} className="px-2 py-2 text-right font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stats.map((s) => (
              <tr key={s.feature} className="border-b last:border-0">
                <td className="py-2 pr-4">{FEATURE_LABELS[s.feature]}</td>
                {[s.mean, s.std, s.min, s.median, s.max].map((v, i) => (
                  <td key={i} className="tabular px-2 py-2 text-right">
                    {fmt(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function ClassCounts({ data }: { data: IrisSample[] }) {
  const counts = classCounts(data);
  const max = Math.max(...Object.values(counts), 1);
  return (
    <Panel title="Class counts" description={`${data.length} samples in total.`}>
      <ul className="space-y-4">
        {SPECIES.map((s) => (
          <li key={s}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 capitalize">
                <SpeciesDot color={SPECIES_COLORS[s]} />
                {s}
              </span>
              <span className="tabular text-muted-foreground">
                {counts[s]} · {data.length ? ((counts[s] / data.length) * 100).toFixed(0) : 0}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(counts[s] / max) * 100}%`, backgroundColor: SPECIES_COLORS[s] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
