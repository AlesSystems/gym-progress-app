"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DurationPoint {
  date: string;
  duration: number;
  name: string;
}

interface Props {
  data: DurationPoint[];
  avg: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: DurationPoint }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const h = Math.floor(d.duration / 60);
  const m = d.duration % 60;
  const formatted = h > 0 ? `${h}h ${m}m` : `${m} min`;
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground">{d.name || label}</p>
      <p className="text-cyan-400 font-medium">{formatted}</p>
    </div>
  );
};

export default function DurationTrendChart({ data, avg }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground/40 text-sm italic">
        No duration data yet
      </div>
    );
  }

  const avgH = Math.floor(avg / 60);
  const avgM = Math.round(avg % 60);
  const avgLabel = avgH > 0 ? `${avgH}h ${avgM}m avg` : `${avgM} min avg`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2 px-1">
        <span className="text-2xl font-bold text-foreground tabular-nums">{avgLabel}</span>
        <span className="text-xs text-muted-foreground">per session</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            unit=" m"
            domain={["auto", "auto"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avg}
            stroke="rgba(34,211,238,0.3)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <Line
            type="monotone"
            dataKey="duration"
            stroke="url(#cyanGlow)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#22d3ee", strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#22d3ee" }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest">
        Session duration trend · Last 20 sessions
      </p>
    </div>
  );
}
