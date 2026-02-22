"use client";

import { useState } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
            <p className="text-sm text-gray-500 mt-0.5">{sessions.length} completed workouts</p>
          </div>
          <Link
            href="/sessions/start"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            + New Session
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500 text-sm">No completed sessions yet.</p>
            <Link href="/sessions/start" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline">
              Start your first workout →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} {...s} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
