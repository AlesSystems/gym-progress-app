"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer";
import { Bell, BellOff, Plus } from "lucide-react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RestTimerBar() {
  const { status, remaining, tick, snooze, stop, dismiss, syncFromVisibility } = useTimerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Tick every second when running or alert
  useEffect(() => {
    if (status === "RUNNING") {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [status, tick]);

  // Sync on page visibility restore
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") syncFromVisibility();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [syncFromVisibility]);

  if (status === "IDLE") return null;

  const isAlert = status === "ALERT";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-between px-6 py-4 shadow-2xl backdrop-blur-2xl border-t border-border/50 transition-all duration-500 ${
        isAlert 
          ? "bg-red-500/90 text-white animate-pulse" 
          : "bg-background/90 text-foreground"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isAlert ? "bg-white/20" : "bg-primary/10"}`}>
          {isAlert ? <Bell size={20} className="animate-bounce" /> : <Clock size={20} className="text-primary" />}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAlert ? "text-white/70" : "text-muted-foreground"}`}>
            {isAlert ? "Time's Up!" : "Rest Timer"}
          </p>
          <span className="font-mono text-2xl font-black tabular-nums tracking-tighter">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={snooze}
          className={`h-11 flex items-center gap-2 rounded-xl px-4 text-sm font-bold transition-all active:scale-95 ${
            isAlert 
              ? "bg-white/20 hover:bg-white/30 text-white" 
              : "bg-secondary hover:bg-primary/10 hover:text-primary text-foreground border border-border"
          }`}
        >
          <Plus size={18} />
          30s
        </button>
        <button
          onClick={isAlert ? dismiss : stop}
          className={`h-11 px-6 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
            isAlert 
              ? "bg-white text-red-600 hover:bg-gray-100" 
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          }`}
        >
          {isAlert ? "Dismiss" : "Stop"}
        </button>
      </div>
    </div>
  );
}

// Helper icons
import { Bell, Clock, Plus } from "lucide-react";
