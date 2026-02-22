"use client";

import { useState } from "react";
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

export default function ExerciseAccordion({
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

  const handleSetUpdate = (setId: string, updates: Partial<SetData>) => {
    const updated = sets.map((s) => (s.id === setId ? { ...s, ...updates } : s));
    setSets(updated);
    onExerciseUpdate(exercise.id, updated);
  };

  const handleSetDelete = (setId: string) => {
    const updated = sets.filter((s) => s.id !== setId);
    setSets(updated);
    onExerciseUpdate(exercise.id, updated);
  };

  const handleAddSet = async () => {
    setAdding(true);
    try {
      // Pre-fill from last set
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
        const updated = [...sets, newSet];
        setSets(updated);
        onExerciseUpdate(exercise.id, updated);
        // Auto-start rest timer
        timerStart(exercise.restSeconds ?? 90);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveExercise = async () => {
    if (!confirm(`Remove ${exercise.exerciseName} and all its sets?`)) return;
    await fetch(`/api/sessions/${sessionId}/exercises/${exercise.id}`, { method: "DELETE" });
    onExerciseRemove(exercise.id);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <span className="text-sm font-semibold text-gray-900 truncate">{exercise.exerciseName}</span>
          {open ? <ChevronUp size={16} className="shrink-0 text-gray-400" /> : <ChevronDown size={16} className="shrink-0 text-gray-400" />}
        </button>
        <button
          onClick={handleRemoveExercise}
          className="shrink-0 ml-2 rounded p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`Remove ${exercise.exerciseName}`}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {open && (
        <div className="px-4 py-3 space-y-2">
          {previousBest && (
            <PreviousBestHint
              weight={previousBest.weight}
              weightUnit={previousBest.weightUnit}
              reps={previousBest.reps}
              rpe={previousBest.rpe}
            />
          )}

          {/* Column headers */}
          <div className="flex items-center gap-2 px-3 text-xs text-gray-400 font-medium">
            <span className="w-5 shrink-0">#</span>
            <span className="w-7 shrink-0">W</span>
            <span className="w-16 text-center">Weight</span>
            <span className="w-6 shrink-0" />
            <span className="w-14 text-center">Reps</span>
            <span className="w-14 text-center">RPE</span>
          </div>

          {sets.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No sets yet. Add your first set!</p>
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

          <button
            onClick={handleAddSet}
            disabled={adding}
            className="flex items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors w-full justify-center disabled:opacity-50"
          >
            <Plus size={12} />
            {adding ? "Adding…" : "Add Set"}
          </button>
        </div>
      )}
    </div>
  );
}
