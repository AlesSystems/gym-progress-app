import { Trophy } from "lucide-react";

interface PRRowProps {
  exerciseName: string;
  weight: number;
  unit: string;
  achievedAt: string;
}

export default function PRRow({ exerciseName, weight, unit, achievedAt }: PRRowProps) {
  const date = new Date(achievedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors">
      <Trophy size={14} className="text-primary shrink-0" />
      <span className="flex-1 text-sm text-foreground truncate">{exerciseName}</span>
      <span className="text-sm font-semibold tabular-nums text-foreground">{weight} {unit}</span>
      <span className="text-xs text-muted-foreground shrink-0 w-14 text-right">{date}</span>
    </div>
  );
}
