"use client";

import { GripVertical } from "lucide-react";
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
      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        {/* Exercise name */}
        <p className="text-sm font-semibold text-gray-900 truncate">{item.exercise.name}</p>
        <p className="text-xs text-gray-500 mb-2">{item.exercise.primaryMuscle}</p>

        {/* Config row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Sets */}
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Sets</label>
            <input
              type="number"
              min={1}
              max={20}
              value={item.sets}
              onChange={(e) => onChange(item.id, "sets", parseInt(e.target.value, 10) || 1)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Reps */}
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Reps</label>
            <RepSchemeInput
              value={item.reps}
              onChange={(v) => onChange(item.id, "reps", v)}
            />
          </div>

          {/* Weight */}
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Target Weight</label>
            <div className="flex gap-1">
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
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <select
                value={item.targetWeightUnit ?? "kg"}
                onChange={(e) => onChange(item.id, "targetWeightUnit", e.target.value)}
                className="rounded border border-gray-300 px-1 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          {/* Rest */}
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Rest</label>
            <RestTimePicker
              value={item.restSeconds ?? null}
              onChange={(v) => onChange(item.id, "restSeconds", v)}
            />
          </div>
        </div>

        {/* Tempo + Notes */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Tempo</label>
            <TempoInput
              value={item.tempoNotes ?? ""}
              onChange={(v) => onChange(item.id, "tempoNotes", v || null)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">Notes</label>
            <input
              type="text"
              value={item.notes ?? ""}
              maxLength={500}
              placeholder="Optional notes"
              onChange={(e) => onChange(item.id, "notes", e.target.value || null)}
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors mt-1"
        aria-label="Remove exercise"
      >
        ✕
      </button>
    </div>
  );
}
