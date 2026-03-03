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
            className="group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-3 text-left hover:border-primary/30 hover:bg-card/80 transition-all disabled:opacity-50"
          >
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              {startingId === t.id ? (
                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors ml-0.5"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {t.exerciseCount} exercises
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
