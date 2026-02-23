interface MuscleTagListProps {
  primaryMuscle: string;
  secondaryMuscles?: string[];
}

export default function MuscleTagList({ primaryMuscle, secondaryMuscles = [] }: MuscleTagListProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
        {primaryMuscle}
      </span>
      {secondaryMuscles.map((m) => (
        <span
          key={m}
          className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
