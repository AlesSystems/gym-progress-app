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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[2.5rem] border border-border bg-card shadow-2xl p-8 overflow-hidden relative">
        {/* Decorative background gradients */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Workout Complete! 🎉</h2>
            <p className="text-muted-foreground font-medium">Amazing session, time to recover.</p>
          </div>
          <button 
            onClick={onKeepTraining} 
            className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-3xl bg-secondary/30 border border-border/50 p-5 text-center backdrop-blur-sm">
            <p className="text-2xl font-black text-foreground">{durationMinutes}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">minutes</p>
          </div>
          <div className="rounded-3xl bg-secondary/30 border border-border/50 p-5 text-center backdrop-blur-sm">
            <p className="text-2xl font-black text-foreground">{totalSets}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">sets</p>
          </div>
          <div className="rounded-3xl bg-secondary/30 border border-border/50 p-5 text-center backdrop-blur-sm">
            <p className="text-2xl font-black text-foreground">{totalVolume.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{totalVolumeUnit ?? "kg"} volume</p>
          </div>
        </div>

        {/* New PRs Section */}
        {newPRs.length > 0 && (
          <div className="mb-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Trophy size={20} className="text-amber-500" />
              </div>
              <p className="text-sm font-black text-amber-500 uppercase tracking-widest">New Personal Records!</p>
            </div>
            <div className="space-y-2">
              {newPRs.map((pr, i) => (
                <div key={i} className="flex items-center justify-between bg-amber-500/5 rounded-xl px-4 py-2 border border-amber-500/10">
                  <span className="text-sm font-bold text-foreground">{pr.exerciseName}</span>
                  <span className="text-sm font-black text-amber-500">
                    {pr.weight} {pr.weightUnit} × {pr.reps}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session notes */}
        <div className="space-y-2 mb-8">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Session Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did it feel? Any wins today?"
            rows={3}
            maxLength={1000}
            className="w-full rounded-3xl border border-border bg-background/50 backdrop-blur-md px-6 py-4 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onKeepTraining}
            className="flex-1 h-14 rounded-2xl border border-border bg-background px-6 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
          >
            Not Finished Yet
          </button>
          <button
            onClick={handleSaveExit}
            disabled={saving}
            className="flex-1 h-14 rounded-2xl bg-primary px-6 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/25 disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Saving…
              </span>
            ) : "Save & Exit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper icons
import { Trophy } from "lucide-react";
