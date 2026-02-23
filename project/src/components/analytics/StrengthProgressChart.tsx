"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface E1RMPoint {
  date: string;
  [exerciseName: string]: number | string;
}

interface Props {
  data: E1RMPoint[];
  exercises: string[];
  unit: string;
}

const COLORS = ["#a78bfa", "#34d399", "#fb923c", "#f472b6", "#38bdf8"];

const CustomTooltip = ({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  unit: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm min-w-[160px]">
      <p className="font-semibold text-foreground mb-2 text-xs text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">{p.name}</span>
          </div>
          <span className="font-bold text-foreground text-xs">
            {p.value.toFixed(1)} {unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function StrengthProgressChart({ data, exercises, unit }: Props) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  if (!data.length || !exercises.length) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground/40 text-sm italic">
        No strength data yet
      </div>
    );
  }

  const toggle = (name: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {/* Custom legend */}
      <div className="flex flex-wrap gap-2">
        {exercises.map((ex, i) => (
          <button
            key={ex}
            onClick={() => toggle(ex)}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border transition-all ${
              hidden.has(ex)
                ? "border-border/30 text-muted-foreground/40 bg-transparent"
                : "border-border text-foreground bg-card/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            {ex.length > 18 ? ex.slice(0, 16) + "…" : ex}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {exercises.map((ex, i) => (
              <linearGradient key={ex} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
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
            unit={` ${unit}`}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {exercises.map((ex, i) =>
            hidden.has(ex) ? null : (
              <Area
                key={ex}
                type="monotone"
                dataKey={ex}
                name={ex}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2.5}
                fill={`url(#grad-${i})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                connectNulls
              />
            )
          )}
          <Legend content={() => null} />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest">
        Epley formula · Click legend to toggle exercises
      </p>
    </div>
  );
}
