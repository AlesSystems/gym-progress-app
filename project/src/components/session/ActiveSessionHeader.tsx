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
    <div className="bg-indigo-600 px-4 py-4 text-white">
      <p className="text-xs opacity-75 uppercase tracking-wide">Active Session</p>
      <h1 className="mt-0.5 text-lg font-bold truncate">{name ?? "Workout"}</h1>
      <p className="text-2xl font-mono font-semibold mt-1">{formatElapsed(elapsed)}</p>
    </div>
  );
}
