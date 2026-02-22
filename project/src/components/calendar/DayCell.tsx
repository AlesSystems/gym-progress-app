"use client";

import { cn } from "@/lib/utils";
import StatusDot from "./StatusDot";
import type { CalendarDayData } from "@/types/calendar";

interface DayCellProps {
  date: Date;
  dayData: CalendarDayData | undefined;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  onClick: (date: Date) => void;
}

export default function DayCell({ date, dayData, isToday, isCurrentMonth, isSelected, onClick }: DayCellProps) {
  const hasCompleted = (dayData?.completedSessions?.length ?? 0) > 0;
  const hasPlanned = dayData?.scheduledWorkouts?.some((sw) => sw.status === "planned") ?? false;
  const hasMissed = dayData?.scheduledWorkouts?.some((sw) => sw.status === "missed") ?? false;
  const hasAny = hasCompleted || hasPlanned || hasMissed;

  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        "relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl transition-all",
        "h-14 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400",
        isCurrentMonth ? "text-gray-900" : "text-gray-300",
        isSelected && "bg-indigo-600 text-white shadow-md",
        !isSelected && isToday && "bg-indigo-50 ring-1 ring-indigo-300",
        !isSelected && !isToday && "hover:bg-gray-100"
      )}
      aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      aria-pressed={isSelected}
    >
      <span className={cn("text-sm font-medium leading-none", isSelected && "text-white")}>
        {date.getDate()}
      </span>

      {hasAny && (
        <div className="flex items-center gap-0.5 mt-1.5">
          {hasCompleted && (
            <StatusDot variant="completed" className={cn(isSelected && "bg-white")} />
          )}
          {hasPlanned && (
            <StatusDot variant="planned" className={cn(isSelected && "border-white")} />
          )}
          {hasMissed && (
            <StatusDot variant="missed" className={cn(isSelected && "bg-white/60")} />
          )}
        </div>
      )}
    </button>
  );
}
