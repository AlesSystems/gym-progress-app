"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Play } from "lucide-react";

interface TemplateSummary {
  id: string;
  name: string;
  exerciseCount: number;
}

export default function TemplateQuickStart() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTemplates(json.data.templates ?? []);
      })
      .catch(() => {});
  }, []);

  const startFromTemplate = async (templateId: string) => {
    setStartingId(templateId);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const json = await res.json();
      if (json.success || res.status === 409) {
        router.push("/sessions/active");
      }
    } finally {
      setStartingId(null);
    }
  };

  if (templates.length === 0) return null;

  const shown = templates.slice(0, 4);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Quick Start from Template
        </h3>
        <Link
          href="/templates"
          className="text-xs text-primary hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {shown.map((t) => (
          <button
            key={t.id}
            onClick={() => startFromTemplate(t.id)}
            disabled={startingId !== null}
            className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card/40 p-3 text-left hover:border-primary/40 hover:bg-card/60 transition-all duration-300 disabled:opacity-50 active:scale-[0.98] backdrop-blur-sm shadow-sm"
          >
            <div className="h-9 w-9 rounded-md bg-secondary/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors border border-border/40">
              {startingId === t.id ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play
                  size={14}
                  className="text-muted-foreground/80 group-hover:text-primary transition-colors ml-0.5"
                  strokeWidth={2.5}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate tracking-tight text-foreground/90 group-hover:text-primary transition-colors">{t.name}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {t.exerciseCount} exercises
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
