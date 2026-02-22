"use client";

import { X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import CompletedSessionCard from "./CompletedSessionCard";
import ScheduledEntryCard from "./ScheduledEntryCard";
import type { CalendarDayData, CalendarScheduledWorkout } from "@/types/calendar";

interface DayDetailSheetProps {
  date: Date;
  dayData: CalendarDayData | undefined;
  onClose: () => void;
  onAddPlan: (date: Date) => void;
  onEditEntry: (entry: CalendarScheduledWorkout) => void;
  onRefresh: () => void;
}

export default function DayDetailSheet({
  date,
  dayData,
  onClose,
  onAddPlan,
  onEditEntry,
  onRefresh,
}: DayDetailSheetProps) {
  const router = useRouter();
  const toast = useToast();

  const formatDayHeading = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const sessions = dayData?.completedSessions ?? [];
  const scheduled = dayData?.scheduledWorkouts ?? [];
  const isEmpty = sessions.length === 0 && scheduled.length === 0;

  const handleStartWorkout = async (entry: CalendarScheduledWorkout) => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: entry.templateId ?? undefined,
          scheduledWorkoutId: entry.id,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to start session.");
        return;
      }
      toast.success("Session started! Let's crush it! 💪");
      onRefresh();
      router.push(`/sessions/active`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scheduled/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to delete.");
        return;
      }
      toast.success("Scheduled workout removed. 🗑️");
      onRefresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-white shadow-2xl max-h-[80vh]">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">{formatDayHeading(date)}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""},&nbsp;
              {scheduled.length} plan{scheduled.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <span className="text-4xl mb-3">🗓️</span>
              <p className="text-sm font-medium text-gray-700">Nothing planned yet</p>
              <p className="text-xs text-gray-400 mt-1">Add a plan to schedule your workout!</p>
            </div>
          )}

          {sessions.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Completed Sessions
              </h3>
              <div className="space-y-2">
                {sessions.map((s) => (
                  <CompletedSessionCard key={s.id} session={s} />
                ))}
              </div>
            </section>
          )}

          {scheduled.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Scheduled Workouts
              </h3>
              <div className="space-y-2">
                {scheduled.map((sw) => (
                  <ScheduledEntryCard
                    key={sw.id}
                    entry={sw}
                    onStartWorkout={handleStartWorkout}
                    onEdit={onEditEntry}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => onAddPlan(date)}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition-all shadow-md shadow-indigo-200"
          >
            <Plus size={16} />
            Add Plan
          </button>
        </div>
      </div>
    </>
  );
}
