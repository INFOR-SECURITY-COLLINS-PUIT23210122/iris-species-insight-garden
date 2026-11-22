// Paginated, filterable table of all samples: one table that fits phone widths.
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Panel, SpeciesDot } from "@/components/iris/Panel";
import { Button } from "@/components/ui/button";
import { FEATURES, FEATURE_LABELS, SPECIES, SPECIES_COLORS, type Feature, type IrisSample, type Species } from "@/lib/iris/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

// Short column names so all four measurements fit side by side on a phone.
const SHORT_LABELS: Record<Feature, string> = {
  sepalLength: "SL",
  sepalWidth: "SW",
  petalLength: "PL",
  petalWidth: "PW",
};

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
      {/* One table for every screen: fixed columns and short headers on phones, so all
          six columns (including petal width and species) fit without sideways scrolling. */}
      <table className="w-full table-fixed text-xs sm:table-auto sm:text-sm">
        <thead>
          <tr className="border-b text-left text-[10px] text-muted-foreground uppercase sm:text-xs sm:normal-case">
            <th className="w-7 py-2 pr-1 font-medium sm:w-auto sm:pr-3">#</th>
            {FEATURES.map((f) => (
              <th key={f} className="px-1 py-2 text-right font-medium sm:px-2 sm:whitespace-nowrap">
                <span className="sm:hidden">{SHORT_LABELS[f]}</span>
                <span className="hidden sm:inline">{FEATURE_LABELS[f]}</span>
              </th>
            ))}
            <th className="w-[30%] py-2 pl-2 font-medium sm:w-auto sm:pl-4">Species</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="tabular py-2 pr-1 text-muted-foreground sm:pr-3">{r.id}</td>
              {FEATURES.map((f) => (
                <td key={f} className="tabular px-1 py-2 text-right sm:px-2">
                  {r[f].toFixed(1)}
                </td>
              ))}
              <td className="py-2 pl-2 sm:pl-4">
                <span className="flex min-w-0 items-center gap-1.5 capitalize sm:gap-2">
                  <SpeciesDot color={SPECIES_COLORS[r.species]} className="shrink-0" />
                  <span className="truncate">{r.species}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
