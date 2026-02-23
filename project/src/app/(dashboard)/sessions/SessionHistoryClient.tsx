"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Dumbbell } from "lucide-react";
import SessionCard, { SessionCardProps } from "@/components/session/SessionCard";

interface SessionHistoryClientProps {
  initialSessions: SessionCardProps[];
}

export default function SessionHistoryClient({ initialSessions }: SessionHistoryClientProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialSessions.length === 20);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/sessions?status=completed&page=${nextPage}&limit=20`);
      const json = await res.json();
      if (json.success) {
        const newSessions: SessionCardProps[] = json.data.sessions;
        setSessions((prev) => [...prev, ...newSessions]);
        setPage(nextPage);
        setHasMore(newSessions.length === 20);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-5xl w-full mx-auto">
      {/* Header with modern typography */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Workout History</h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium">Relive your past gains and progress</p>
        </div>
        <Link
          href="/sessions/start"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 w-full md:w-auto"
        >
          <Play size={20} strokeWidth={3} />
          Start New Workout
        </Link>
      </header>

      {/* Sessions list with glassmorphism cards */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-10 md:p-20 gap-6 backdrop-blur-sm text-center animate-in fade-in zoom-in duration-500">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30">
            <History size={32} md:size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-base md:text-lg font-medium text-muted-foreground italic">No completed sessions yet.</p>
            <Link href="/sessions/start" className="inline-flex text-sm font-bold text-primary hover:underline">
              Start your first workout now →
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {sessions.map((s) => (
            <SessionCard key={s.id} {...s} />
          ))}
        </div>
      )}

      {/* Modern Load More button */}
      {hasMore && (
        <div className="text-center pt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="h-12 px-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                Loading…
              </span>
            ) : "Load More Activity"}
          </button>
        </div>
      )}
    </div>
  );
}

// Helper icons
import { History } from "lucide-react";
