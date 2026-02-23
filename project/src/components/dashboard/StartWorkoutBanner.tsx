import Link from "next/link";
import { Play, Zap } from "lucide-react";

export default function StartWorkoutBanner() {
  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-l-4 border-l-primary">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Zap size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Ready to train?</p>
          <p className="text-xs text-muted-foreground">Pick a template or start from scratch</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/sessions/start"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Play size={14} />
            Start
          </Link>
        </div>
      </div>
    </div>
  );
}
