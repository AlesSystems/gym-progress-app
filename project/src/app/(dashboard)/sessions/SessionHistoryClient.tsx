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
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Sessions</h1>
        <Link
          href="/sessions/start"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Play size={14} />
          New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-12 gap-3">
          <Dumbbell size={32} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No completed sessions yet.</p>
          <Link href="/sessions/start" className="text-sm font-medium text-primary hover:underline">
            Start your first workout →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((s) => (
            <SessionCard key={s.id} {...s} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
