"use client";

import Link from "next/link";
import { Clock, BarChart2 } from "lucide-react";
import type { CalendarCompletedSession } from "@/types/calendar";

interface CompletedSessionCardProps {
  session: CalendarCompletedSession;
}

export default function CompletedSessionCard({ session }: CompletedSessionCardProps) {
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex flex-col gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 hover:border-emerald-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
        <span className="text-xs font-semibold text-emerald-800 truncate">
          {session.name ?? "Workout"}
        </span>
        <span className="ml-auto text-[10px] font-medium text-emerald-600 bg-emerald-100 rounded-full px-2 py-0.5">
          Completed
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-emerald-700 pl-4">
        {session.durationMinutes != null && (
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {session.durationMinutes} min
          </span>
        )}
        {session.totalVolume > 0 && (
          <span className="flex items-center gap-1">
            <BarChart2 size={11} />
            {session.totalVolume.toLocaleString()} {session.volumeUnit ?? "kg"}
          </span>
        )}
      </div>
    </Link>
  );
}
