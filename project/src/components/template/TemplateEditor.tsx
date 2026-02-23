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
    if (exercises.length === 0) {
      setError("Add at least one exercise before saving.");
      return;
    }
    const missingWeight = exercises.find(
      (ex) => ex.targetWeight === null || ex.targetWeight === undefined
    );
    if (missingWeight) {
      setError(`Please set a target weight for "${missingWeight.exercise.name}" before saving.`);
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
    <div className="px-6 py-8">
      {/* Header fields */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2 px-1">
              Template Name *
            </label>
            <input
              type="text"
              value={name}
              maxLength={100}
              placeholder="e.g. Push Day A"
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-xl border border-border bg-background/50 backdrop-blur-md px-4 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest block mb-2 px-1">
              Description
            </label>
            <textarea
              value={description}
              maxLength={500}
              rows={3}
              placeholder="Optional notes about this routine..."
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/50 backdrop-blur-md px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          {templateId && (
            <div className="rounded-2xl border border-border bg-secondary/20 p-4">
              <VisibilityToggle templateId={templateId} initialVisibility={initialVisibility} />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-destructive/10 border border-destructive/20 px-5 py-3 text-sm text-destructive flex items-center gap-3">
          <X size={18} />
          {error}
        </div>
      )}

      {/* Exercise list */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Exercises 
            <span className="text-sm font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
              {exercises.length}/30
            </span>
          </h2>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={18} strokeWidth={2.5} /> Add Exercise
          </button>
        </div>

        {exercises.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border/50 bg-secondary/10 p-12 text-center group hover:border-primary/30 transition-colors">
            <div className="h-16 w-16 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No exercises yet. Build your routine now.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
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

      {/* Action buttons with glassmorphism */}
      <div className="flex items-center justify-end gap-4 border-t border-border pt-8 mt-4">
        <button
          onClick={() => router.push("/templates")}
          className="h-12 flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-12 flex items-center gap-2 rounded-xl bg-primary px-8 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/25"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Saving…
            </span>
          ) : (
            <>
              <Save size={18} />
              Save Template
            </>
          )}
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
