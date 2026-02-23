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
} from "recharts";

interface FrequencyData {
  label: string;
  count: number;
  fullLabel: string;
}

interface Props {
  data: FrequencyData[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: FrequencyData }[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground">{d.fullLabel}</p>
      <p className="text-emerald-400 font-medium mt-0.5">
        {d.count} workout{d.count !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export default function FrequencyChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground/40 text-sm italic">
        No frequency data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count === max ? "url(#greenGradient)" : "rgba(52,211,153,0.3)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest">
        Sessions per week · Last 12 weeks
      </p>
    </div>
  );
}
