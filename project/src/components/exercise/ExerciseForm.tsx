"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createExerciseSchema,
  EXERCISE_TYPES,
  MOVEMENT_CATEGORIES,
  WEIGHT_UNITS,
  type CreateExerciseInput,
} from "@/lib/validations/exercise";

const KNOWN_MUSCLES = [
  "Abs", "Back", "Biceps", "Brachialis", "Calves", "Chest",
  "Core", "Front Deltoids", "Full Body", "Glutes", "Hamstrings",
  "Hip Flexors", "Lats", "Lower Back", "Obliques", "Quadriceps",
  "Rear Deltoids", "Rhomboids", "Shoulders", "Side Deltoids",
  "Traps", "Triceps",
];

interface ExerciseFormProps {
  defaultValues?: Partial<CreateExerciseInput>;
  exerciseId?: string;
  mode: "create" | "edit";
}

export default function ExerciseForm({ defaultValues, exerciseId, mode }: ExerciseFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateExerciseInput>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      type: "compound",
      movementCategory: "other",
      secondaryMuscles: [],
      ...defaultValues,
    },
  });

  const secondaryMuscles = watch("secondaryMuscles") ?? [];

  const toggleSecondary = (muscle: string) => {
    const current = secondaryMuscles as string[];
    if (current.includes(muscle)) {
      setValue("secondaryMuscles", current.filter((m) => m !== muscle));
    } else if (current.length < 10) {
      setValue("secondaryMuscles", [...current, muscle]);
    }
  };

  const onSubmit = async (data: CreateExerciseInput) => {
    setServerError(null);
    const url = mode === "create" ? "/api/exercises" : `/api/exercises/${exerciseId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      setServerError(json.error?.message ?? "Something went wrong.");
      return;
    }

    router.push(`/exercises/${json.data.slug}`);
    router.refresh();
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/50";
  const labelClass = "block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 px-1";
  const errorClass = "mt-1 text-xs font-bold text-destructive px-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm font-bold text-destructive">
          {serverError}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClass}>
          Name <span className="text-destructive">*</span>
        </label>
        <input {...register("name")} id="name" type="text" className={fieldClass} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      {/* Type */}
      <div>
        <p className={labelClass}>
          Type <span className="text-destructive">*</span>
        </p>
        <div className="flex gap-4">
          {EXERCISE_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
              <input {...register("type")} type="radio" value={t} className="accent-primary" />
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </label>
          ))}
        </div>
        {errors.type && <p className={errorClass}>{errors.type.message}</p>}
      </div>

      {/* Movement Category */}
      <div>
        <label htmlFor="movementCategory" className={labelClass}>
          Movement Category <span className="text-destructive">*</span>
        </label>
        <select {...register("movementCategory")} id="movementCategory" className={fieldClass}>
          {MOVEMENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        {errors.movementCategory && <p className={errorClass}>{errors.movementCategory.message}</p>}
      </div>

      {/* Primary Muscle */}
      <div>
        <label htmlFor="primaryMuscle" className={labelClass}>
          Primary Muscle <span className="text-destructive">*</span>
        </label>
        <input
          {...register("primaryMuscle")}
          id="primaryMuscle"
          list="muscle-list"
          type="text"
          className={fieldClass}
          placeholder="e.g. Quadriceps"
        />
        <datalist id="muscle-list">
          {KNOWN_MUSCLES.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        {errors.primaryMuscle && <p className={errorClass}>{errors.primaryMuscle.message}</p>}
      </div>

      {/* Secondary Muscles */}
      <div>
        <p className={labelClass}>Secondary Muscles (optional, max 10)</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {KNOWN_MUSCLES.map((m) => {
            const active = (secondaryMuscles as string[]).includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleSecondary(m)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Default Unit */}
      <div>
        <label htmlFor="defaultUnit" className={labelClass}>
          Default Unit (optional)
        </label>
        <select {...register("defaultUnit")} id="defaultUnit" className={fieldClass}>
          <option value="">Use user preference</option>
          {WEIGHT_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Default Reps / Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="defaultReps" className={labelClass}>
            Default Reps (optional)
          </label>
          <input
            {...register("defaultReps", { valueAsNumber: true })}
            id="defaultReps"
            type="number"
            min={1}
            max={100}
            className={fieldClass}
          />
          {errors.defaultReps && <p className={errorClass}>{errors.defaultReps.message}</p>}
        </div>
        <div>
          <label htmlFor="defaultWeight" className={labelClass}>
            Default Weight (optional)
          </label>
          <input
            {...register("defaultWeight", { valueAsNumber: true })}
            id="defaultWeight"
            type="number"
            min={0}
            step={0.5}
            className={fieldClass}
          />
          {errors.defaultWeight && <p className={errorClass}>{errors.defaultWeight.message}</p>}
        </div>
      </div>

      {/* Demo URLs */}
      <div>
        <label htmlFor="demoImageUrl" className={labelClass}>
          Demo Image URL (optional)
        </label>
        <input
          {...register("demoImageUrl")}
          id="demoImageUrl"
          type="url"
          className={fieldClass}
          placeholder="https://…"
        />
        {errors.demoImageUrl && <p className={errorClass}>{errors.demoImageUrl.message}</p>}
      </div>

      <div>
        <label htmlFor="demoVideoUrl" className={labelClass}>
          Demo Video URL (optional)
        </label>
        <input
          {...register("demoVideoUrl")}
          id="demoVideoUrl"
          type="url"
          className={fieldClass}
          placeholder="https://youtube.com/…"
        />
        {errors.demoVideoUrl && <p className={errorClass}>{errors.demoVideoUrl.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>
          Description / Coaching Notes (optional)
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={4}
          className={fieldClass}
          placeholder="Form cues, progression tips…"
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
            ? "Create Exercise"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
