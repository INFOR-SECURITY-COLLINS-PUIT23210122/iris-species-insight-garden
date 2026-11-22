// List of recent saved predictions so they can be compared side by side.
import { History, Trash2 } from "lucide-react";

import { Panel, SpeciesDot } from "@/components/iris/Panel";
import { Button } from "@/components/ui/button";
import type { PredictionRecord } from "@/lib/iris/history";
import { FEATURES, SPECIES, SPECIES_COLORS } from "@/lib/iris/types";

const SHORT = { sepalLength: "SL", sepalWidth: "SW", petalLength: "PL", petalWidth: "PW" } as const;

export function PredictionHistory({ items, onClear }: { items: PredictionRecord[]; onClear: () => void }) {
  return (
    <Panel
      title="Recent predictions"
      description={items.length ? `${items.length} saved on this device · SL/SW/PL/PW in cm` : "Each prediction you make is saved here."}
      action={
        items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <Trash2 /> Clear
          </Button>
        )
      }
    >
      {items.length === 0 ? (
        <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <History className="size-4 shrink-0" /> No predictions yet.
        </p>
      ) : (
        <ul className="divide-y">
          {items.map((r) => {
            const i = SPECIES.indexOf(r.species);
            return (
              <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium capitalize">
                    <SpeciesDot color={SPECIES_COLORS[r.species]} />
                    <span className="truncate">{r.species}</span>
                    <span className="tabular text-xs font-normal text-muted-foreground">
                      {((r.probs[i] ?? 0) * 100).toFixed(0)}%
                    </span>
                  </p>
                  <p className="tabular mt-0.5 truncate text-xs text-muted-foreground">
                    {FEATURES.map((f) => `${SHORT[f]} ${r.input[f].toFixed(1)}`).join(" · ")}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p className="tabular">{new Date(r.at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</p>
                  <p className="truncate">{r.modelLabel}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
