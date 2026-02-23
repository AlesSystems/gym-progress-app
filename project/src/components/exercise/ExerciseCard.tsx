import Link from "next/link";
import ExerciseBadge from "./ExerciseBadge";
import MuscleTagList from "./MuscleTagList";
import type { ExerciseType, MovementCategory } from "@/lib/validations/exercise";

export interface ExerciseCardProps {
  id: string;
  name: string;
  slug: string;
  type: ExerciseType;
  movementCategory: MovementCategory;
  primaryMuscle: string;
  secondaryMuscles?: string[];
  isSystemExercise: boolean;
  description?: string | null;
}

export default function ExerciseCard({
  name,
  slug,
  type,
  movementCategory,
  primaryMuscle,
  secondaryMuscles = [],
  isSystemExercise,
  description,
}: ExerciseCardProps) {
  return (
    <Link
      href={`/exercises/${slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {name}
        </h3>
        {!isSystemExercise && (
          <span className="shrink-0 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
            Custom
          </span>
        )}
      </div>

      {/* Badges */}
      <ExerciseBadge type={type} category={movementCategory} />

      {/* Muscles */}
      <MuscleTagList
        primaryMuscle={primaryMuscle}
        secondaryMuscles={secondaryMuscles.slice(0, 3)}
      />

      {/* Description snippet */}
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
