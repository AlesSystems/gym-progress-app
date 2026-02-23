import Link from "next/link";
import { Clock, Dumbbell, Flame } from "lucide-react";

interface RecentSessionRowProps {
  id: string;
  name: string | null;
  durationMinutes: number | null;
  exerciseCount: number;
  totalVolume: number;
  totalVolumeUnit: string | null;
  startedAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function RecentSessionRow({
  id,
  name,
  durationMinutes,
  exerciseCount,
  totalVolume,
  totalVolumeUnit,
  startedAt,
}: RecentSessionRowProps) {
  return (
    <Link
      href={`/sessions/${id}`}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors"
    >
      <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
        <Dumbbell size={14} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{name ?? "Workout"}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {durationMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} />
              {durationMinutes}m
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame size={10} />
            {totalVolume > 0 ? `${totalVolume.toLocaleString()} ${totalVolumeUnit ?? ""}`.trim() : `${exerciseCount} ex`}
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{formatDate(startedAt)}</span>
    </Link>
  );
}
