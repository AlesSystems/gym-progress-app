import { cn } from "@/lib/utils";
import type { ExerciseType, MovementCategory } from "@/lib/validations/exercise";

const typeColors: Record<ExerciseType, string> = {
  compound: "bg-primary/10 text-primary border-primary/20",
  isolation: "bg-accent/10 text-accent-foreground border-accent/20",
};

const categoryColors: Record<MovementCategory, string> = {
  push:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  pull:    "bg-blue-500/10  text-blue-400  border-blue-500/20",
  legs:    "bg-green-500/10 text-green-400 border-green-500/20",
  core:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cardio:  "bg-red-500/10   text-red-400   border-red-500/20",
  other:   "bg-secondary  text-muted-foreground  border-border",
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
