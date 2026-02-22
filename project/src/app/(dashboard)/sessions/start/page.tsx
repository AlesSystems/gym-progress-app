"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, Dumbbell } from "lucide-react";

interface TemplateSummary {
  id: string;
  name: string;
  exerciseCount: number;
}

export default function SessionStartPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [search, setSearch] = useState("");
  const [starting, setStarting] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: string; name: string | null } | null>(null);

  useEffect(() => {
    // Load templates
    fetch("/api/templates")
      .then((r) => r.json())
      .then((json) => { if (json.success) setTemplates(json.data.templates); });

    // Check for active session
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then((json) => { if (json.success) setActiveSession(json.data); });
  }, []);

  const startSession = async (templateId?: string) => {
    setStarting(true);
    try {
      const body: Record<string, unknown> = {};
      if (templateId) body.templateId = templateId;
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/sessions/active");
      } else if (res.status === 409) {
        router.push("/sessions/active");
      } else {
        alert(json.error?.message ?? "Failed to start session.");
      }
    } finally {
      setStarting(false);
    }
  };

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Start Workout</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a template or start freestyle.</p>

        {/* Active session banner */}
        {activeSession && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-800">Session in progress</p>
              <p className="text-xs text-amber-600">{activeSession.name ?? "Workout"}</p>
            </div>
            <Link
              href="/sessions/active"
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
            >
              Resume →
            </Link>
          </div>
        )}

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => startSession()}
            disabled={starting}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-indigo-400 hover:bg-indigo-50 transition-colors disabled:opacity-50"
          >
            <Dumbbell size={28} className="text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">Freestyle</span>
            <span className="text-xs text-gray-400">Start with blank template</span>
          </button>
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6">
            <Play size={28} className="text-indigo-500" />
            <span className="text-sm font-semibold text-gray-700">From Template</span>
            <span className="text-xs text-gray-400">Pick from list below</span>
          </div>
        </div>

        {/* Template picker */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Templates</h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {templates.length === 0 ? "No templates yet." : "No templates match your search."}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startSession(t.id)}
                  disabled={starting}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.exerciseCount} exercises</p>
                  </div>
                  <Play size={16} className="text-indigo-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
