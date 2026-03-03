"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ActiveSessionBanner() {
  const [activeSession, setActiveSession] = useState<{
    id: string;
    name: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setActiveSession(json.data);
      })
      .catch(() => {});
  }, []);

  if (!activeSession) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-500">
              Session in progress
            </p>
            <p className="text-xs text-amber-500/70">
              {activeSession.name ?? "Workout"}
            </p>
          </div>
        </div>
        <Link
          href="/sessions/active"
          className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 shrink-0"
        >
          Resume →
        </Link>
      </div>
    </div>
  );
}
