// Themed tooltip shared by all Recharts charts.
import type { TooltipProps } from "recharts";

type Props = TooltipProps<number, string> & { valueFormatter?: (v: number) => string };

export function ChartTooltip({ active, payload, label, valueFormatter }: Props) {
  if (!active || !payload?.length) return null;
  const fmt = valueFormatter ?? ((v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(3)));
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {label !== undefined && label !== "" && <p className="mb-1 font-medium">{label}</p>}
      <ul className="space-y-0.5">
        {payload.map((p, i) => (
          <li key={`${p.name}-${i}`} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: (p.color ?? p.payload?.fill ?? "var(--primary)") as string }}
            />
            <span className="capitalize text-muted-foreground">{p.name}</span>
            <span className="tabular ml-auto pl-3">{typeof p.value === "number" ? fmt(p.value) : p.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
