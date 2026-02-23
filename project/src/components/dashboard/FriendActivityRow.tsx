import { Dumbbell } from "lucide-react";

interface FriendActivityRowProps {
  displayName: string;
  sessionName: string | null;
  completedAt: string;
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3600000);
  if (h < 24) return h <= 1 ? "1h ago" : `${h}h ago`;
  const d = Math.floor(diffMs / 86400000);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function FriendActivityRow({ displayName, sessionName, completedAt }: FriendActivityRowProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors">
      <div className="h-7 w-7 shrink-0 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent-foreground">
        {initials(displayName)}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground">{displayName}</span>
        {sessionName && (
          <span className="text-xs text-muted-foreground"> · {sessionName}</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Dumbbell size={10} />
        {formatRelative(completedAt)}
      </div>
    </div>
  );
}
