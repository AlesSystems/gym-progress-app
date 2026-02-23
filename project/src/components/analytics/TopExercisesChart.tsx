"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

interface ExerciseData {
  name: string;
  volume: number;
  sessions: number;
}

interface Props {
  data: ExerciseData[];
  unit: string;
}

const CustomTooltip = ({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: ExerciseData }[];
  unit: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const vol = d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}k` : d.volume.toLocaleString();
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="text-pink-400 font-medium">
        {vol} {unit}
      </p>
      <p className="text-muted-foreground text-xs">{d.sessions} session{d.sessions !== 1 ? "s" : ""}</p>
    </div>
  );
};

const GRADIENT_COLORS = [
  ["#f472b6", "#ec4899"],
  ["#e879f9", "#d946ef"],
  ["#c084fc", "#a855f7"],
  ["#818cf8", "#6366f1"],
  ["#60a5fa", "#3b82f6"],
  ["#34d399", "#10b981"],
  ["#fbbf24", "#f59e0b"],
  ["#fb923c", "#f97316"],
];

export default function TopExercisesChart({ data, unit }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground/40 text-sm italic">
        No exercise data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={data.length * 36 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="25%"
        >
          <defs>
            {GRADIENT_COLORS.map(([s, e], i) => (
              <linearGradient key={i} id={`hbar-${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={s} stopOpacity={0.9} />
                <stop offset="100%" stopColor={e} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val: string) => (val.length > 16 ? val.slice(0, 14) + "…" : val)}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="volume" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={`url(#hbar-${index % GRADIENT_COLORS.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest">
        Total volume · Top exercises
      </p>
    </div>
  );
}
