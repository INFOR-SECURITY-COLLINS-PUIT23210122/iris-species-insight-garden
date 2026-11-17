// Scatter plot of any two features, coloured by species.
import { useState } from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Panel } from "@/components/iris/Panel";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FEATURES, FEATURE_LABELS, SPECIES, SPECIES_COLORS, type Feature, type IrisSample } from "@/lib/iris/types";
import { ChartTooltip } from "@/components/iris/ChartTooltip";

function FeatureSelect({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: Feature;
  onChange: (f: Feature) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as Feature)}>
        <SelectTrigger id={id} className="h-8 w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FEATURES.map((f) => (
            <SelectItem key={f} value={f}>
              {FEATURE_LABELS[f]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function ScatterPlot({ data }: { data: IrisSample[] }) {
  const [x, setX] = useState<Feature>("petalLength");
  const [y, setY] = useState<Feature>("petalWidth");

  return (
    <Panel
      title="Feature scatter plot"
      description="Pick any two measurements to see how well they separate the species."
      action={
        <div className="flex flex-wrap gap-3">
          <FeatureSelect id="x-feature" label="X" value={x} onChange={setX} />
          <FeatureSelect id="y-feature" label="Y" value={y} onChange={setY} />
        </div>
      }
    >
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 16, bottom: 24, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey={x}
              name={FEATURE_LABELS[x]}
              domain={["dataMin - 0.3", "dataMax + 0.3"]}
              tickFormatter={(v: number) => v.toFixed(1)}
              stroke="var(--muted-foreground)"
              fontSize={12}
              label={{ value: `${FEATURE_LABELS[x]} (cm)`, position: "insideBottom", offset: -14, fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey={y}
              name={FEATURE_LABELS[y]}
              domain={["dataMin - 0.3", "dataMax + 0.3"]}
              tickFormatter={(v: number) => v.toFixed(1)}
              stroke="var(--muted-foreground)"
              fontSize={12}
              width={44}
              label={{ value: `${FEATURE_LABELS[y]} (cm)`, angle: -90, position: "insideLeft", fill: "var(--muted-foreground)", fontSize: 12, dy: 50 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "var(--border)" }} />
            <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }} />
            {SPECIES.map((s) => (
              <Scatter
                key={s}
                name={s}
                data={data.filter((d) => d.species === s)}
                fill={SPECIES_COLORS[s]}
                fillOpacity={0.8}
                isAnimationActive={false}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
