"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import PRBadge from "./PRBadge";

export interface SetData {
  id: string;
  setNumber: number;
  weight?: number | null;
  weightUnit?: string | null;
  reps?: number | null;
  rpe?: number | null;
  notes?: string | null;
  isWarmup: boolean;
  completedAt?: string | null;
  isNewPR?: boolean;
}

interface SetRowProps {
  set: SetData;
  sessionId: string;
  exerciseId: string;
  onUpdate: (setId: string, updates: Partial<SetData>) => void;
  onDelete: (setId: string) => void;
}

export default function SetRow({ set, sessionId, exerciseId, onUpdate, onDelete }: SetRowProps) {
  const [saving, setSaving] = useState(false);

  const handleBlur = async (field: keyof SetData, value: unknown) => {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}/exercises/${exerciseId}/sets/${set.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      onUpdate(set.id, { [field]: value });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/sessions/${sessionId}/exercises/${exerciseId}/sets/${set.id}`, { method: "DELETE" });
    onDelete(set.id);
  };

  const toggleWarmup = async () => {
    const newVal = !set.isWarmup;
    await fetch(`/api/sessions/${sessionId}/exercises/${exerciseId}/sets/${set.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isWarmup: newVal }),
    });
    onUpdate(set.id, { isWarmup: newVal });
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 border ${
        set.isWarmup 
          ? "bg-amber-500/5 border-amber-500/20 shadow-sm shadow-amber-500/5" 
          : "bg-secondary/20 border-border/50 hover:border-primary/30 hover:bg-secondary/30"
      } ${saving ? "opacity-50 grayscale" : ""}`}
    >
      {/* Set number / indicator */}
      <div className="w-8 flex flex-col items-center shrink-0">
        <span className={`text-xs font-black ${set.isWarmup ? "text-amber-500" : "text-muted-foreground group-hover:text-primary transition-colors"}`}>
          {set.isWarmup ? "W" : set.setNumber}
        </span>
      </div>

      {/* Warmup toggle - styled as a small pill */}
      <button
        onClick={toggleWarmup}
        title={set.isWarmup ? "Mark as working set" : "Mark as warm-up"}
        className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
          set.isWarmup
            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
            : "bg-secondary text-muted-foreground hover:bg-amber-500/20 hover:text-amber-500"
        }`}
      >
        W
      </button>

      {/* Weight Input */}
      <div className="relative flex items-center gap-2">
        <input
          type="number"
          defaultValue={set.weight ?? ""}
          placeholder="0.0"
          min={0}
          max={9999}
          step={0.5}
          onBlur={(e) => {
            const v = e.target.value === "" ? null : parseFloat(e.target.value);
            handleBlur("weight", v);
          }}
          className="w-20 h-10 rounded-xl border border-border bg-background/50 px-2 text-center text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
          aria-label="Weight"
        />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest absolute -bottom-4 left-1/2 -translate-x-1/2">
          {set.weightUnit ?? "kg"}
        </span>
      </div>

      <div className="w-2 shrink-0" />

      {/* Reps Input */}
      <div className="relative">
        <input
          type="number"
          defaultValue={set.reps ?? ""}
          placeholder="0"
          min={0}
          max={999}
          step={1}
          onBlur={(e) => {
            const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
            handleBlur("reps", v);
          }}
          className="w-16 h-10 rounded-xl border border-border bg-background/50 px-2 text-center text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
          aria-label="Reps"
        />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest absolute -bottom-4 left-1/2 -translate-x-1/2">
          Reps
        </span>
      </div>

      {/* RPE Input */}
      <div className="relative">
        <input
          type="number"
          defaultValue={set.rpe ?? ""}
          placeholder="-"
          min={1}
          max={10}
          step={0.5}
          onBlur={(e) => {
            const v = e.target.value === "" ? null : parseFloat(e.target.value);
            handleBlur("rpe", v);
          }}
          className="w-16 h-10 rounded-xl border border-border bg-background/50 px-2 text-center text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30"
          aria-label="RPE"
        />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest absolute -bottom-4 left-1/2 -translate-x-1/2">
          RPE
        </span>
      </div>

      {/* PR badge */}
      <div className="flex-1 flex justify-center">
        {set.isNewPR && <PRBadge />}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:bg-destructive/10 hover:text-destructive transition-all"
        aria-label="Delete set"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
