import { cn } from "@/lib/utils";
import type { ExerciseType, MovementCategory } from "@/lib/validations/exercise";

const typeColors: Record<ExerciseType, string> = {
  compound: "bg-indigo-100 text-indigo-800 border-indigo-200",
  isolation: "bg-purple-100 text-purple-800 border-purple-200",
};

const categoryColors: Record<MovementCategory, string> = {
  push:    "bg-orange-100 text-orange-800 border-orange-200",
  pull:    "bg-blue-100  text-blue-800  border-blue-200",
  legs:    "bg-green-100 text-green-800 border-green-200",
  core:    "bg-yellow-100 text-yellow-800 border-yellow-200",
  cardio:  "bg-red-100   text-red-800   border-red-200",
  other:   "bg-gray-100  text-gray-800  border-gray-200",
};

interface ExerciseBadgeProps {
  type?: ExerciseType;
  category?: MovementCategory;
  className?: string;
}

export default function ExerciseBadge({ type, category, className }: ExerciseBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {type && (
        <span
          className={cn(
            "inline-block rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
            typeColors[type]
          )}
        >
          {type}
        </span>
      )}
      {category && (
        <span
          className={cn(
            "inline-block rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
            categoryColors[category]
          )}
        >
          {category}
        </span>
      )}
    </span>
  );
}
