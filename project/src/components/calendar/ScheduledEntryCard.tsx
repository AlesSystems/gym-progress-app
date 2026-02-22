"use client";

import { Play, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarScheduledWorkout } from "@/types/calendar";

interface ScheduledEntryCardProps {
  entry: CalendarScheduledWorkout;
  onStartWorkout: (entry: CalendarScheduledWorkout) => void;
  onEdit: (entry: CalendarScheduledWorkout) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  planned: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-100 text-indigo-700",
    border: "border-indigo-200 bg-indigo-50",
    label: "Planned",
  },
  completed: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200 bg-emerald-50",
    label: "Done",
  },
  missed: {
    dot: "bg-gray-300",
    badge: "bg-gray-100 text-gray-500",
    border: "border-gray-200 bg-gray-50",
    label: "Missed",
  },
};

export default function ScheduledEntryCard({ entry, onStartWorkout, onEdit, onDelete }: ScheduledEntryCardProps) {
  const cfg = statusConfig[entry.status];

  return (
    <div className={cn("rounded-xl border p-3 flex flex-col gap-2", cfg.border)}>
      <div className="flex items-start gap-2">
        <span className={cn("mt-1 w-2 h-2 rounded-full shrink-0", cfg.dot)} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">
            {entry.title ?? "Workout"}
          </p>
          {entry.notes && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 flex items-start gap-1">
              <StickyNote size={10} className="mt-0.5 shrink-0" />
              {entry.notes}
            </p>
          )}
        </div>
        <span className={cn("text-[10px] font-medium rounded-full px-2 py-0.5 shrink-0", cfg.badge)}>
          {cfg.label}
        </span>
      </div>

      {entry.status !== "completed" && (
        <div className="flex items-center gap-2 pl-4">
          {entry.status === "planned" && (
            <button
              onClick={() => onStartWorkout(entry)}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <Play size={11} />
              Start Workout
            </button>
          )}
          <button
            onClick={() => onEdit(entry)}
            className="text-xs text-gray-500 hover:text-indigo-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-white"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
