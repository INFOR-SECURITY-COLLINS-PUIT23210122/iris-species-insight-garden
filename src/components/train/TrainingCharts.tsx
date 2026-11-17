// Learning curves: loss + accuracy per epoch (neural net) or accuracy vs k (KNN).
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/iris/ChartTooltip";
import type { EpochLog } from "@/lib/iris/mlp";
import type { KSweepPoint } from "@/lib/iris/train";

const axis = { stroke: "var(--muted-foreground)", fontSize: 12 };
const pct = (v: number) => `${Math.round(v * 100)}%`;

export function LossChart({ history }: { history: EpochLog[] }) {
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="epoch" {...axis} />
          <YAxis {...axis} tickFormatter={(v: number) => v.toFixed(2)} />
          <Tooltip content={<ChartTooltip />} labelFormatter={(l) => `Epoch ${l}`} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="loss" name="Training loss" stroke="var(--chart-4)" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AccuracyChart({ history }: { history: EpochLog[] }) {
  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="epoch" {...axis} />
          <YAxis {...axis} domain={[0, 1]} tickFormatter={pct} />
          <Tooltip content={<ChartTooltip valueFormatter={pct} />} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="trainAccuracy" name="Train accuracy" stroke="var(--chart-4)" strokeWidth={2} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="testAccuracy" name="Test accuracy" stroke="var(--chart-5)" strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function KSweepChart({ data, k }: { data: KSweepPoint[]; k: number }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="k" {...axis} />
          <YAxis {...axis} domain={[0.5, 1]} tickFormatter={pct} />
          <Tooltip content={<ChartTooltip valueFormatter={pct} />} labelFormatter={(l) => `k = ${l}`} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <ReferenceLine x={k} stroke="var(--primary)" strokeDasharray="4 4" label={{ value: `your k`, fill: "var(--primary)", fontSize: 11, position: "top" }} />
          <Line type="monotone" dataKey="trainAccuracy" name="Train accuracy" stroke="var(--chart-4)" strokeWidth={2} isAnimationActive={false} />
          <Line type="monotone" dataKey="testAccuracy" name="Test accuracy" stroke="var(--chart-5)" strokeWidth={2} strokeDasharray="5 3" isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
