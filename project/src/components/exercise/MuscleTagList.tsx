interface MuscleTagListProps {
  primaryMuscle: string;
  secondaryMuscles?: string[];
}

export default function MuscleTagList({ primaryMuscle, secondaryMuscles = [] }: MuscleTagListProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
        {primaryMuscle}
      </span>
      {secondaryMuscles.map((m) => (
        <span
          key={m}
          className="rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs text-gray-600"
        >
          {m}
        </span>
      ))}
    </div>
  );
}
