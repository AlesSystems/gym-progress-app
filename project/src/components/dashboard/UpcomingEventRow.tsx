import Link from "next/link";
import { CalendarDays } from "lucide-react";

interface UpcomingEventRowProps {
  id: string;
  title: string | null;
  templateName: string | null;
  scheduledDate: string;
}

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  // Compare date only
  const todayStr = now.toISOString().slice(0, 10);
  const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  if (dateStr <= todayStr) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";
  const diffDays = Math.ceil((d.getTime() - now.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays <= 7) return `In ${diffDays}d`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function UpcomingEventRow({ id, title, templateName, scheduledDate }: UpcomingEventRowProps) {
  const label = title ?? templateName ?? "Workout";
  return (
    <Link
      href={`/calendar`}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary transition-colors"
    >
      <div className="h-8 w-8 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center">
        <CalendarDays size={14} className="text-accent-foreground" />
      </div>
      <p className="flex-1 text-sm font-medium text-foreground truncate">{label}</p>
      <span className="text-xs text-muted-foreground shrink-0">{formatRelative(scheduledDate)}</span>
    </Link>
  );
}
