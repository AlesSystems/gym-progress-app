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
      className="group relative flex flex-col gap-4 rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight truncate">
          {name}
        </h3>
        {!isSystemExercise && (
          <span className="shrink-0 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-500">
            Custom
          </span>
        )}
      </div>

      <div className="space-y-4 relative z-10">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <ExerciseBadge type={type} category={movementCategory} />
        </div>

        {/* Muscles */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Target Muscles</p>
          <MuscleTagList
            primaryMuscle={primaryMuscle}
            secondaryMuscles={secondaryMuscles.slice(0, 3)}
          />
        </div>

        {/* Description snippet */}
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 italic border-l-2 border-primary/20 pl-3">
            {description}
          </p>
        )}
      </div>

      {/* View indicator */}
      <div className="mt-auto pt-2 flex items-center justify-end">
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          View Details →
        </span>
      </div>
    </Link>
  );
}
