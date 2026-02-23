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
      {/* Backdrop with enhanced blur */}
      <div
        className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet with glassmorphism */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] flex flex-col rounded-t-[3rem] bg-card/80 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)] max-h-[85vh] border-t border-border/50 animate-in slide-in-from-bottom duration-500 ease-out">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-muted/30" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-border/30 bg-secondary/10">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">{formatDayHeading(date)}</h2>
            <div className="flex items-center gap-3 mt-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {scheduled.length} plan{scheduled.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:rotate-90"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 min-h-0 custom-scrollbar">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
              <div className="h-20 w-20 bg-secondary rounded-[2rem] flex items-center justify-center text-muted-foreground/30 mb-6">
                <Calendar size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold text-foreground">Nothing planned yet</p>
                <p className="text-sm font-medium text-muted-foreground italic">Add a routine to schedule your next workout!</p>
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-60">
                Completed Sessions
              </h3>
              <div className="grid gap-3">
                {sessions.map((s) => (
                  <CompletedSessionCard key={s.id} session={s} />
                ))}
              </div>
            </section>
          )}

          {scheduled.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 opacity-60">
                Scheduled Workouts
              </h3>
              <div className="grid gap-3">
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

        {/* Footer with primary action */}
        <div className="px-8 py-6 border-t border-border/30 bg-background/50 backdrop-blur-md">
          <button
            onClick={() => onAddPlan(date)}
            className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-primary text-base font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Add New Plan
          </button>
        </div>
      </div>
    </>
  );
}

// Helper icons
import { Calendar } from "lucide-react";
