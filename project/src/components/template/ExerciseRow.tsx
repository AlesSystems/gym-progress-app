"use client";

import { GripVertical, X } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RepSchemeInput from "./RepSchemeInput";
import RestTimePicker from "./RestTimePicker";
import TempoInput from "./TempoInput";

export interface TemplateExercise {
  id: string;
  orderIndex: number;
  sets: number;
  reps: string;
  targetWeight: number | null;
  targetWeightUnit: string | null;
  restSeconds: number | null;
  tempoNotes: string | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    type: string;
    movementCategory: string;
    primaryMuscle: string;
  };
}

interface ExerciseRowProps {
  item: TemplateExercise;
  onChange: (id: string, field: string, value: unknown) => void;
  onRemove: (id: string) => void;
}

export default function ExerciseRow({ item, onChange, onRemove }: ExerciseRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-4 rounded-2xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 ${
        isDragging ? "shadow-2xl ring-2 ring-primary/20 scale-[1.02] z-50 bg-card/80" : ""
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="mt-1.5 cursor-grab text-muted-foreground/40 hover:text-primary active:cursor-grabbing shrink-0 transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical size={20} />
      </div>

      <div className="flex-1 min-w-0">
        {/* Exercise header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-base font-bold text-foreground truncate">{item.exercise.name}</h4>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{item.exercise.primaryMuscle}</span>
          </div>
          
          <button
            onClick={() => onRemove(item.id)}
            className="shrink-0 rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive transition-all"
            aria-label="Remove exercise"
          >
            <X size={16} />
          </button>
        </div>

        {/* Config grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Sets */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">Sets</label>
            <input
              type="number"
              min={1}
              max={20}
              value={item.sets}
              onChange={(e) => onChange(item.id, "sets", parseInt(e.target.value, 10) || 1)}
              className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>

          {/* Reps */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">Reps</label>
            <RepSchemeInput
              value={item.reps}
              onChange={(v) => onChange(item.id, "reps", v)}
            />
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">Target Weight</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min={0}
                max={9999}
                step={0.5}
                value={item.targetWeight ?? ""}
                placeholder="–"
                onChange={(e) =>
                  onChange(item.id, "targetWeight", e.target.value ? parseFloat(e.target.value) : null)
                }
                className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              />
              <select
                value={item.targetWeightUnit ?? "kg"}
                onChange={(e) => onChange(item.id, "targetWeightUnit", e.target.value)}
                className="h-10 rounded-xl border border-border bg-background/50 px-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          {/* Rest */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">Rest</label>
            <RestTimePicker
              value={item.restSeconds ?? null}
              onChange={(v) => onChange(item.id, "restSeconds", v)}
            />
          </div>
        </div>

        {/* Tempo + Notes */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">Tempo</label>
            <TempoInput
              value={item.tempoNotes ?? ""}
              onChange={(v) => onChange(item.id, "tempoNotes", v || null)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter px-1">Notes</label>
            <input
              type="text"
              value={item.notes ?? ""}
              maxLength={500}
              placeholder="Optional notes"
              onChange={(e) => onChange(item.id, "notes", e.target.value || null)}
              className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
