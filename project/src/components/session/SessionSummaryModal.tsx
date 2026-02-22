"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface PR {
  exerciseName: string;
  weight: number;
  weightUnit: string;
  reps: number;
}

interface SessionSummaryModalProps {
  sessionId: string;
  durationMinutes: number;
  totalSets: number;
  totalVolume: number;
  totalVolumeUnit?: string | null;
  newPRs?: PR[];
  onKeepTraining: () => void;
}

export default function SessionSummaryModal({
  sessionId,
  durationMinutes,
  totalSets,
  totalVolume,
  totalVolumeUnit,
  newPRs = [],
  onKeepTraining,
}: SessionSummaryModalProps) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSaveExit = async () => {
    setSaving(true);
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", notes: notes || undefined }),
      });
      router.push("/sessions");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Workout Complete! 🎉</h2>
          <button onClick={onKeepTraining} className="rounded-md p-1 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg bg-indigo-50 p-3 text-center">
            <p className="text-xl font-bold text-indigo-700">{durationMinutes}</p>
            <p className="text-xs text-indigo-500 mt-0.5">minutes</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-center">
            <p className="text-xl font-bold text-indigo-700">{totalSets}</p>
            <p className="text-xs text-indigo-500 mt-0.5">sets</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-3 text-center">
            <p className="text-xl font-bold text-indigo-700">{totalVolume.toLocaleString()}</p>
            <p className="text-xs text-indigo-500 mt-0.5">{totalVolumeUnit ?? "kg"} vol</p>
          </div>
        </div>

        {/* New PRs */}
        {newPRs.length > 0 && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
            <p className="text-xs font-semibold text-yellow-700 mb-2">🏆 New Personal Records!</p>
            {newPRs.map((pr, i) => (
              <p key={i} className="text-sm text-yellow-800">
                {pr.exerciseName}: {pr.weight} {pr.weightUnit} × {pr.reps}
              </p>
            ))}
          </div>
        )}

        {/* Session notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add session notes (optional)…"
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none mb-4"
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onKeepTraining}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep Training
          </button>
          <button
            onClick={handleSaveExit}
            disabled={saving}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & Exit"}
          </button>
        </div>
      </div>
    </div>
  );
}
