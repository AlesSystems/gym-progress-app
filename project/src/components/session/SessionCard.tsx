"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Clock, Dumbbell, BarChart2 } from "lucide-react";

export interface SessionCardProps {
  id: string;
  name: string | null;
  status: string;
  startedAt: string | Date;
  completedAt?: string | Date | null;
  durationMinutes?: number | null;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  totalVolumeUnit?: string | null;
}

export default function SessionCard({
  id,
  name,
  startedAt,
  durationMinutes,
  exerciseCount,
  totalSets,
  totalVolume,
  totalVolumeUnit,
}: SessionCardProps) {
  return (
    <Link
      href={`/sessions/${id}`}
      className="group relative flex flex-col gap-3 md:gap-4 rounded-2xl md:rounded-[2rem] border border-border bg-card/40 p-4 md:p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="min-w-0">
          <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{formatDate(startedAt)}</p>
          <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">{name ?? "Workout Session"}</h3>
        </div>
        
        {totalVolume > 0 && (
          <div className="shrink-0 flex flex-col items-end">
            <span className="text-xs md:text-sm font-black text-foreground tabular-nums">{totalVolume.toLocaleString()} <span className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-widest">{totalVolumeUnit ?? "kg"}</span></span>
            <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Vol</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 relative z-10 pt-3 md:pt-4 border-t border-border/50">
        {durationMinutes !== null && durationMinutes !== undefined && (
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Clock size={14} md:size={16} />
            </div>
            <span className="text-[10px] md:text-xs font-bold text-muted-foreground tabular-nums truncate">{durationMinutes}<span className="text-[9px] md:text-[10px] font-medium opacity-60 lowercase ml-0.5">m</span></span>
          </div>
        )}
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <Dumbbell size={14} md:size={16} />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-muted-foreground truncate">{exerciseCount}<span className="text-[9px] md:text-[10px] font-medium opacity-60 lowercase ml-0.5">ex</span></span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
            <BarChart2 size={14} md:size={16} />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-muted-foreground tabular-nums truncate">{totalSets}<span className="text-[9px] md:text-[10px] font-medium opacity-60 lowercase ml-0.5">sets</span></span>
        </div>
      </div>

      {/* View indicator (hidden on mobile, shown on md+) */}
      <div className="hidden md:flex mt-auto pt-2 items-center justify-end">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          View Details →
        </span>
      </div>
    </Link>
  );
}
