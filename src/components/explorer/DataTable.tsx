// Paginated, filterable table of all samples.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Panel, SpeciesDot } from "@/components/iris/Panel";
import { Button } from "@/components/ui/button";
import { FEATURES, FEATURE_LABELS, SPECIES, SPECIES_COLORS, type IrisSample, type Species } from "@/lib/iris/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export function DataTable({ data }: { data: IrisSample[] }) {
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<Species | "all">("all");

  const rows = useMemo(
    () => data.map((d, i) => ({ ...d, id: i + 1 })).filter((d) => filter === "all" || d.species === filter),
    [data, filter],
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <Panel
      title="Data table"
      description={`${rows.length} rows`}
      action={
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by species">
          {(["all", ...SPECIES] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilter(s);
                setPage(0);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs capitalize transition-colors",
                filter === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
              aria-pressed={filter === s}
            >
              {s !== "all" && <SpeciesDot color={SPECIES_COLORS[s]} className="size-2" />}
              {s}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">#</th>
              {FEATURES.map((f) => (
                <th key={f} className="px-2 py-2 text-right font-medium whitespace-nowrap">
                  {FEATURE_LABELS[f]}
                </th>
              ))}
              <th className="py-2 pl-4 font-medium">Species</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="tabular py-2 pr-3 text-muted-foreground">{r.id}</td>
                {FEATURES.map((f) => (
                  <td key={f} className="tabular px-2 py-2 text-right">
                    {r[f].toFixed(1)}
                  </td>
                ))}
                <td className="py-2 pl-4">
                  <span className="flex items-center gap-2 capitalize">
                    <SpeciesDot color={SPECIES_COLORS[r.species]} />
                    {r.species}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular">
          Page {current + 1} of {pages}
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="size-8" onClick={() => setPage(current - 1)} disabled={current === 0} aria-label="Previous page">
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => setPage(current + 1)} disabled={current >= pages - 1} aria-label="Next page">
            <ChevronRight />
          </Button>
        </div>
      </div>
    </Panel>
  );
}
