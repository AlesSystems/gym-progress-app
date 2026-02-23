"use client";

import { Trophy, TrendingUp } from "lucide-react";

interface PRRecord {
  exercise: string;
  weight: number;
  unit: string;
  reps: number | null;
  e1rm: number;
  achievedAt: string;
}

interface Props {
  records: PRRecord[];
}

export default function PersonalRecords({ records }: Props) {
  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Trophy className="h-8 w-8 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/50 italic">No personal records yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {records.map((r, i) => (
        <div
          key={r.exercise}
          className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 border border-border/40 px-4 py-3 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                i === 0
                  ? "bg-yellow-500/20 text-yellow-400"
                  : i === 1
                  ? "bg-slate-400/20 text-slate-300"
                  : i === 2
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{r.exercise}</p>
              <p className="text-[10px] text-muted-foreground">{r.achievedAt}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {r.weight} {r.unit}
              {r.reps ? ` × ${r.reps}` : ""}
            </p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">
                {r.e1rm.toFixed(1)} {r.unit} e1RM
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
