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
      className="flex items-center gap-4 rounded-lg px-4 py-3 bg-card/40 border border-border/50 hover:bg-card/60 hover:border-primary/20 transition-all duration-300 backdrop-blur-sm group shadow-sm"
    >
      <div className="h-9 w-9 shrink-0 rounded-md bg-secondary/60 flex items-center justify-center border border-border/40 group-hover:text-primary transition-colors">
        <Dumbbell size={16} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate tracking-tight group-hover:text-primary transition-colors">{name ?? "Workout"}</p>
        <div className="flex items-center gap-3 mt-1">
          {durationMinutes && (
            <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              <Clock size={10} strokeWidth={3} />
              {durationMinutes}m
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            <Flame size={10} strokeWidth={3} />
            {totalVolume > 0 ? `${totalVolume.toLocaleString()} ${totalVolumeUnit ?? ""}`.trim() : `${exerciseCount} ex`}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{formatDate(startedAt)}</span>
      </div>
    </Link>
  );
}
