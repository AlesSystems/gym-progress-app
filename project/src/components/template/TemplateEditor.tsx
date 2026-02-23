"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import ExerciseRow, { type TemplateExercise } from "./ExerciseRow";
import ExerciseSearchDrawer from "./ExerciseSearchDrawer";
import VisibilityToggle from "./VisibilityToggle";
import { Plus, Save, X } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  type: string;
  movementCategory: string;
  primaryMuscle: string;
  defaultReps?: number | null;
  defaultWeight?: number | null;
  defaultUnit?: string | null;
}

interface TemplateEditorProps {
  templateId?: string;
  initialName?: string;
  initialDescription?: string;
  initialExercises?: TemplateExercise[];
  initialVisibility?: "private" | "friends";
}

export default function TemplateEditor({
  templateId,
  initialName = "",
  initialDescription = "",
  initialExercises = [],
  initialVisibility = "private",
}: TemplateEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [exercises, setExercises] = useState<TemplateExercise[]>(initialExercises);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = exercises.findIndex((e) => e.id === active.id);
      const newIndex = exercises.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(exercises, oldIndex, newIndex).map((ex, idx) => ({
        ...ex,
        orderIndex: idx,
      }));
      setExercises(reordered);

      if (templateId) {
        try {
          await fetch(`/api/templates/${templateId}/exercises/reorder`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reordered.map((ex) => ({ id: ex.id, orderIndex: ex.orderIndex }))),
          });
        } catch {
          // rollback on error
          setExercises(exercises);
        }
      }
    },
    [exercises, templateId]
  );

  const handleExerciseChange = useCallback((id: string, field: string, value: unknown) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }, []);

  const handleRemoveExercise = useCallback(
    async (id: string) => {
      setExercises((prev) => prev.filter((ex) => ex.id !== id).map((ex, idx) => ({ ...ex, orderIndex: idx })));

      if (templateId) {
        await fetch(`/api/templates/${templateId}/exercises/${id}`, { method: "DELETE" });
      }
    },
    [templateId]
  );

  const handleAddExercise = useCallback(
    async (exercise: Exercise) => {
      if (exercises.length >= 30) {
        setError("Templates can have at most 30 exercises.");
        return;
      }

      const payload = {
        exerciseId: exercise.id,
        sets: 3,
        reps: exercise.defaultReps ? String(exercise.defaultReps) : "8-12",
        targetWeight: exercise.defaultWeight ? Number(exercise.defaultWeight) : undefined,
        targetWeightUnit: exercise.defaultUnit ?? undefined,
      };

      if (templateId) {
        const res = await fetch(`/api/templates/${templateId}/exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setExercises((prev) => [...prev, json.data]);
        }
      } else {
        // Unsaved template — add optimistically with a temp id
        const tempId = `temp-${Date.now()}`;
        setExercises((prev) => [
          ...prev,
          {
            id: tempId,
            orderIndex: prev.length,
            sets: payload.sets,
            reps: payload.reps,
            targetWeight: payload.targetWeight ?? null,
            targetWeightUnit: payload.targetWeightUnit ?? null,
            restSeconds: null,
            tempoNotes: null,
            notes: null,
            exercise: {
              id: exercise.id,
              name: exercise.name,
              type: exercise.type,
              movementCategory: exercise.movementCategory,
              primaryMuscle: exercise.primaryMuscle,
            },
          },
        ]);
      }
    },
    [exercises.length, templateId]
  );

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      let tid = templateId;

      if (!tid) {
        // Create template
        const res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message ?? "Failed to create template.");
        tid = json.data.id;

        // Save all exercises
        for (const ex of exercises) {
          await fetch(`/api/templates/${tid}/exercises`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exerciseId: ex.exercise.id,
              sets: ex.sets,
              reps: ex.reps,
              targetWeight: ex.targetWeight ?? undefined,
              targetWeightUnit: ex.targetWeightUnit ?? undefined,
              restSeconds: ex.restSeconds ?? undefined,
              tempoNotes: ex.tempoNotes ?? undefined,
              notes: ex.notes ?? undefined,
            }),
          });
        }
      } else {
        // Update metadata
        await fetch(`/api/templates/${tid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
        });

        // Update each exercise config
        for (const ex of exercises) {
          if (!ex.id.startsWith("temp-")) {
            await fetch(`/api/templates/${tid}/exercises/${ex.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sets: ex.sets,
                reps: ex.reps,
                targetWeight: ex.targetWeight,
                targetWeightUnit: ex.targetWeightUnit,
                restSeconds: ex.restSeconds,
                tempoNotes: ex.tempoNotes,
                notes: ex.notes,
              }),
            });
          }
        }
      }

      router.push("/templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header fields */}
      <div className="space-y-3 mb-6">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Template Name *</label>
          <input
            type="text"
            value={name}
            maxLength={100}
            placeholder="e.g. Push Day A"
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
          <textarea
            value={description}
            maxLength={500}
            rows={2}
            placeholder="Optional description"
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
        {templateId && (
          <VisibilityToggle templateId={templateId} initialVisibility={initialVisibility} />
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Exercise list */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Exercises <span className="text-gray-400 font-normal">({exercises.length}/30)</span>
          </h2>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            <Plus size={14} /> Add Exercise
          </button>
        </div>

        {exercises.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-400">No exercises yet. Click &quot;Add Exercise&quot; to get started.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {exercises.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    item={ex}
                    onChange={handleExerciseChange}
                    onRemove={handleRemoveExercise}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          onClick={() => router.push("/templates")}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <X size={14} /> Discard
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          <Save size={14} /> {saving ? "Saving…" : "Save Template"}
        </button>
      </div>

      <ExerciseSearchDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdd={(ex) => {
          handleAddExercise(ex);
        }}
      />
    </div>
  );
}
