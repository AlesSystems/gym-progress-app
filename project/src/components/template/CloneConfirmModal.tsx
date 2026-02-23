"use client";

import { useState } from "react";

interface CloneConfirmModalProps {
  open: boolean;
  originalName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function CloneConfirmModal({ open, originalName, onConfirm, onCancel }: CloneConfirmModalProps) {
  const [name, setName] = useState(`${originalName} (Copy)`);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onCancel} />
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
        <div className="w-full max-w-md rounded-[2.5rem] border border-border bg-card shadow-[0_0_50px_rgba(0,0,0,0.3)] p-10 space-y-8 relative overflow-hidden">
          {/* Decorative background gradient */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight">Duplicate Routine</h2>
            <p className="text-muted-foreground font-medium">
              Create a fresh copy of <span className="text-primary font-bold">&quot;{originalName}&quot;</span> with all its exercises.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">New Template Name</label>
            <input
              type="text"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 rounded-2xl border border-border bg-background/50 backdrop-blur-md px-6 py-2 text-base font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-sm"
              placeholder="Enter new name..."
              autoFocus
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl border border-border bg-background px-6 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              disabled={!name.trim()}
              onClick={() => onConfirm(name.trim())}
              className="flex-1 h-12 rounded-xl bg-primary px-6 text-sm font-black uppercase tracking-widest text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/25 disabled:opacity-50"
            >
              Clone
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
