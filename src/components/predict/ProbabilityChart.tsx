// Horizontal bar chart of predicted probability per species.
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { SPECIES, SPECIES_COLORS } from "@/lib/iris/types";

export function ProbabilityChart({ probs }: { probs: number[] }) {
  const data = SPECIES.map((s, i) => ({ species: s, p: probs[i] ?? 0 }));
  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }}>
          <XAxis type="number" domain={[0, 1]} hide />
          <YAxis
            type="category"
            dataKey="species"
            width={84}
            tickLine={false}
            axisLine={false}
            stroke="var(--foreground)"
            fontSize={13}
            tickFormatter={(s: string) => s.charAt(0).toUpperCase() + s.slice(1)}
          />
          <Bar dataKey="p" radius={6} background={{ fill: "var(--muted)", radius: 6 }}>
            {data.map((d) => (
              <Cell key={d.species} fill={SPECIES_COLORS[d.species]} />
            ))}
            <LabelList
              dataKey="p"
              position="right"
              formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
              style={{ fill: "var(--foreground)", fontSize: 12, fontFamily: "var(--font-mono)" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
