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
      className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight">
          {name}
        </h3>
        {!isSystemExercise && (
          <span className="shrink-0 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
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
        <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
