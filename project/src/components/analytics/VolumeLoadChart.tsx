"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

interface WeeklyVolumeData {
  week: string;
  volume: number;
  sessions: number;
}

interface Props {
  data: WeeklyVolumeData[];
  unit: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number; payload: WeeklyVolumeData }[];
  label?: string;
  unit: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const vol = d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}k` : d.volume.toLocaleString();
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      <p className="text-blue-400 font-medium">
        {vol} {unit} total
      </p>
      <p className="text-muted-foreground text-xs mt-0.5">
        {d.sessions} session{d.sessions !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export default function VolumeLoadChart({ data, unit }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground/40 text-sm italic">
        No workout data yet
      </div>
    );
  }

  const maxVol = Math.max(...data.map((d) => d.volume), 1);
  const avg = data.reduce((s, d) => s + d.volume, 0) / data.filter((d) => d.volume > 0).length || 0;

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <ReferenceLine
            y={avg}
            stroke="rgba(99,102,241,0.4)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Bar dataKey="volume" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.volume === maxVol
                    ? "url(#blueGradientPeak)"
                    : entry.volume > avg
                    ? "url(#blueGradient)"
                    : "rgba(99,102,241,0.35)"
                }
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="blueGradientPeak" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0.8} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest">
        Dashed line = weekly average · Peak bar highlighted
      </p>
    </div>
  );
}
