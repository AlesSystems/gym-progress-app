"use client";

import { useEffect, useState } from "react";

interface ActiveSessionHeaderProps {
  name: string | null;
  startedAt: string | Date;
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ActiveSessionHeader({ name, startedAt }: ActiveSessionHeaderProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const update = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div className="sticky top-0 z-40 w-full overflow-hidden bg-background/80 backdrop-blur-xl border-b border-border shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 -z-10" />
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Active Session</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-foreground truncate tracking-tight">{name ?? "Current Workout"}</h1>
        </div>
        
        <div className="shrink-0 flex flex-col items-end">
          <div className="rounded-2xl bg-secondary/50 border border-border px-4 py-2 flex items-center gap-3 backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-2xl font-black font-mono text-foreground tabular-nums tracking-tighter">
              {formatElapsed(elapsed)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
