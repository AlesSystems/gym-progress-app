"use client";

import { memo, useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react";
import SetRow, { SetData } from "./SetRow";
import PreviousBestHint from "./PreviousBestHint";
import { useTimerStore } from "@/store/timer";

export interface SessionExercise {
  id: string;
  exerciseName: string;
  exerciseId: string;
  restSeconds?: number | null;
  notes?: string | null;
  sets: SetData[];
}

interface ExerciseAccordionProps {
  exercise: SessionExercise;
  sessionId: string;
  previousBest?: { weight?: number | null; weightUnit?: string | null; reps?: number | null; rpe?: number | null } | null;
  onExerciseRemove: (exId: string) => void;
  onExerciseUpdate: (exId: string, sets: SetData[]) => void;
}

function ExerciseAccordion({
  exercise,
  sessionId,
  previousBest,
  onExerciseRemove,
  onExerciseUpdate,
}: ExerciseAccordionProps) {
  const [open, setOpen] = useState(true);
  const [sets, setSets] = useState<SetData[]>(exercise.sets);
  const [adding, setAdding] = useState(false);
  const timerStart = useTimerStore((s) => s.start);

  const handleSetUpdate = useCallback((setId: string, updates: Partial<SetData>) => {
    setSets((prev) => {
      const updated = prev.map((s) => (s.id === setId ? { ...s, ...updates } : s));
      onExerciseUpdate(exercise.id, updated);
      return updated;
    });
  }, [exercise.id, onExerciseUpdate]);

  const handleSetDelete = useCallback((setId: string) => {
    setSets((prev) => {
      const updated = prev.filter((s) => s.id !== setId);
      onExerciseUpdate(exercise.id, updated);
      return updated;
    });
  }, [exercise.id, onExerciseUpdate]);

  const handleAddSet = useCallback(async () => {
    setAdding(true);
    try {
      const last = sets[sets.length - 1];
      const body: Record<string, unknown> = { isWarmup: false };
      if (last) {
        if (last.weight !== null && last.weight !== undefined) body.weight = last.weight;
        if (last.weightUnit) body.weightUnit = last.weightUnit;
        if (last.reps !== null && last.reps !== undefined) body.reps = last.reps;
        if (last.rpe !== null && last.rpe !== undefined) body.rpe = last.rpe;
      }
      const res = await fetch(`/api/sessions/${sessionId}/exercises/${exercise.id}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        const newSet: SetData = json.data;
        setSets((prev) => {
          const updated = [...prev, newSet];
          onExerciseUpdate(exercise.id, updated);
          return updated;
        });
        timerStart(exercise.restSeconds ?? 90);
      }
    } finally {
      setAdding(false);
    }
  }, [sets, sessionId, exercise.id, exercise.restSeconds, onExerciseUpdate, timerStart]);

  const handleRemoveExercise = useCallback(async () => {
    if (!confirm(`Remove ${exercise.exerciseName} and all its sets?`)) return;
    await fetch(`/api/sessions/${sessionId}/exercises/${exercise.id}`, { method: "DELETE" });
    onExerciseRemove(exercise.id);
  }, [exercise.id, exercise.exerciseName, sessionId, onExerciseRemove]);

  return (
    <div className="rounded-3xl border border-border bg-card/30 overflow-hidden backdrop-blur-sm transition-[border-color,background-color] hover:border-primary/20 hover:bg-card/40 shadow-sm">
      {/* Header with glassmorphism */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-secondary/20 border-b border-border/50">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 text-left group"
        >
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <Dumbbell className="h-4 w-4 md:h-[18px] md:w-[18px]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-bold text-foreground truncate">{exercise.exerciseName}</h3>
            <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{sets.length} sets logged</span>
          </div>
          <div className="ml-2 text-muted-foreground/50 group-hover:text-primary transition-colors">
            {open ? <ChevronUp className="h-[18px] w-[18px] md:h-5 md:w-5" /> : <ChevronDown className="h-[18px] w-[18px] md:h-5 md:w-5" />}
          </div>
        </button>
        <button
          onClick={handleRemoveExercise}
          className="shrink-0 ml-2 md:ml-4 h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center text-muted-foreground/40 hover:bg-destructive/10 hover:text-destructive transition-all"
          aria-label={`Remove ${exercise.exerciseName}`}
        >
          <Trash2 className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </button>
      </div>

      {open && (
        <div className="px-3 md:px-6 py-4 md:py-6 space-y-4">
          {previousBest && (
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-2 md:p-3 flex items-center gap-2 md:gap-3">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
              </div>
              <PreviousBestHint
                weight={previousBest.weight}
                weightUnit={previousBest.weightUnit}
                reps={previousBest.reps}
                rpe={previousBest.rpe}
              />
            </div>
          )}

          {/* Column headers with better typography */}
          <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4 text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.15em] opacity-60">
            <span className="w-6 md:w-8 shrink-0 text-center">#</span>
            <span className="w-7 md:w-8 shrink-0 text-center">W</span>
            <span className="w-16 md:w-20 text-center">Weight</span>
            <span className="w-1 md:w-2 shrink-0" />
            <span className="w-12 md:w-16 text-center">Reps</span>
            <span className="w-12 md:w-16 text-center">RPE</span>
            <span className="flex-1 shrink-0" />
          </div>

          <div className="space-y-3">
            {sets.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border/50 bg-secondary/10 p-10 text-center">
                <p className="text-sm font-medium text-muted-foreground">No sets recorded yet.</p>
              </div>
            ) : (
              sets.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  sessionId={sessionId}
                  exerciseId={exercise.id}
                  onUpdate={handleSetUpdate}
                  onDelete={handleSetDelete}
                />
              ))
            )}
          </div>

          <button
            onClick={handleAddSet}
            disabled={adding}
            className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-border/50 bg-secondary/5 px-4 py-4 text-sm font-bold text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all w-full justify-center disabled:opacity-50 group"
          >
            {adding ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Adding Set…
              </span>
            ) : (
              <>
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                Add New Set
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper icons for the header update
import { Dumbbell, Trophy } from "lucide-react";

export default memo(ExerciseAccordion);
