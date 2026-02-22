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
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
        set.isWarmup ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"
      } ${saving ? "opacity-60" : ""}`}
    >
      {/* Set number */}
      <span className="w-5 text-center text-xs font-semibold text-gray-500 shrink-0">
        {set.isWarmup ? "W" : set.setNumber}
      </span>

      {/* Warmup toggle */}
      <button
        onClick={toggleWarmup}
        title={set.isWarmup ? "Mark as working set" : "Mark as warm-up"}
        className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
          set.isWarmup
            ? "bg-amber-200 text-amber-800"
            : "bg-gray-200 text-gray-500 hover:bg-amber-100 hover:text-amber-700"
        }`}
      >
        W
      </button>

      {/* Weight */}
      <input
        type="number"
        defaultValue={set.weight ?? ""}
        placeholder="kg"
        min={0}
        max={9999}
        step={0.5}
        onBlur={(e) => {
          const v = e.target.value === "" ? null : parseFloat(e.target.value);
          handleBlur("weight", v);
        }}
        className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        aria-label="Weight"
      />

      <span className="text-xs text-gray-400 shrink-0">{set.weightUnit ?? "kg"}</span>

      {/* Reps */}
      <input
        type="number"
        defaultValue={set.reps ?? ""}
        placeholder="reps"
        min={0}
        max={999}
        step={1}
        onBlur={(e) => {
          const v = e.target.value === "" ? null : parseInt(e.target.value, 10);
          handleBlur("reps", v);
        }}
        className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        aria-label="Reps"
      />

      {/* RPE */}
      <input
        type="number"
        defaultValue={set.rpe ?? ""}
        placeholder="RPE"
        min={1}
        max={10}
        step={0.5}
        onBlur={(e) => {
          const v = e.target.value === "" ? null : parseFloat(e.target.value);
          handleBlur("rpe", v);
        }}
        className="w-14 rounded border border-gray-300 px-2 py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
        aria-label="RPE"
      />

      {/* PR badge */}
      {set.isNewPR && <PRBadge />}

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="ml-auto shrink-0 rounded p-1 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Delete set"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
