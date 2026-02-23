"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface MuscleData {
  muscle: string;
  volume: number;
  pct: number;
}

interface Props {
  data: MuscleData[];
  unit: string;
}

const CustomTooltip = ({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { payload: MuscleData }[];
  unit: string;
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const vol = d.volume >= 1000 ? `${(d.volume / 1000).toFixed(1)}k` : d.volume.toLocaleString();
  return (
    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-sm px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-foreground capitalize">{d.muscle}</p>
      <p className="text-orange-400 font-medium">
        {vol} {unit}
      </p>
      <p className="text-muted-foreground text-xs">{d.pct}% of total</p>
    </div>
  );
};

export default function MuscleGroupChart({ data, unit }: Props) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground/40 text-sm italic">
        No muscle data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#fb923c" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="muscle"
            tick={{ fontSize: 10, fill: "#fff", fontWeight: 600 }}
            tickFormatter={(val: string) =>
              val.length > 10 ? val.slice(0, 9) + "…" : val
            }
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "#fff" }}
            axisLine={false}
            tickCount={4}
          />
          <Radar
            name="Volume"
            dataKey="pct"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#radarGradient)"
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-muted-foreground/50 text-center uppercase tracking-widest">
        Volume distribution by muscle group
      </p>
    </div>
  );
}
