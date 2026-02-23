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
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Start Workout</h1>
          <p className="text-muted-foreground text-lg">Choose a template or start freestyle.</p>
        </header>

        {/* Active session banner with pulsing effect */}
        {activeSession && (
          <div className="relative overflow-hidden rounded-3xl bg-amber-500/10 border border-amber-500/20 p-6 backdrop-blur-md shadow-xl transition-all hover:scale-[1.01]">
            <div className="flex items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-500">Session in progress</p>
                  <p className="text-sm text-amber-500/70 font-medium">{activeSession.name ?? "Workout"}</p>
                </div>
              </div>
              <Link
                href="/sessions/active"
                className="rounded-2xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30"
              >
                Resume Session →
              </Link>
            </div>
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
          </div>
        )}

        {/* Quick Actions CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => startSession()}
            disabled={starting}
            className="group relative overflow-hidden flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-10 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 disabled:opacity-50"
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <Dumbbell size={32} className="text-primary" />
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-foreground">Empty Session</span>
              <span className="text-sm text-muted-foreground font-medium">Start from scratch</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <div className="relative overflow-hidden flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border border-primary/20 bg-primary/10 p-10 backdrop-blur-sm shadow-xl shadow-primary/5">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Play size={32} className="text-primary-foreground ml-1" />
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-foreground">From Template</span>
              <span className="text-sm text-muted-foreground font-medium">Pick a routine below</span>
            </div>
            <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Template picker section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Your Templates
              <span className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                {templates.length}
              </span>
            </h2>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by template name..."
              className="w-full h-14 rounded-2xl border border-border bg-card/30 backdrop-blur-md px-5 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/40 shadow-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/10 p-16 text-center">
              <p className="text-muted-foreground font-medium">
                {templates.length === 0 ? "No templates found." : "No templates match your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => startSession(t.id)}
                  disabled={starting}
                  className="group flex items-center justify-between rounded-3xl border border-border bg-card/40 backdrop-blur-sm px-6 py-5 text-left hover:border-primary/40 hover:bg-card/60 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Dumbbell size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground truncate">{t.name}</p>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t.exerciseCount} exercises</p>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={24} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
