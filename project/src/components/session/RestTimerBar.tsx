"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer";
import { Bell, BellOff, Clock, Plus } from "lucide-react";

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
      className={`fixed bottom-24 md:bottom-0 left-4 md:left-0 right-4 md:right-0 z-[60] flex items-center justify-between px-4 md:px-6 py-3 md:py-4 rounded-2xl md:rounded-none shadow-2xl border md:border-t border-border/50 transition-colors duration-300 ${
        isAlert 
          ? "bg-red-500 text-white animate-pulse" 
          : "bg-card text-foreground"
      }`}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shrink-0 ${isAlert ? "bg-white/20" : "bg-primary/10"}`}>
          {isAlert ? <Bell className="h-[18px] w-[18px] md:h-5 md:w-5 animate-bounce" /> : <Clock className="h-[18px] w-[18px] md:h-5 md:w-5 text-primary" />}
        </div>
        <div className="min-w-0">
          <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] truncate ${isAlert ? "text-white/70" : "text-muted-foreground"}`}>
            {isAlert ? "Time's Up!" : "Rest Timer"}
          </p>
          <span className="font-mono text-xl md:text-2xl font-black tabular-nums tracking-tighter">
            {formatTime(remaining)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={snooze}
          className={`h-9 md:h-11 flex items-center gap-1.5 md:gap-2 rounded-xl px-3 md:px-4 text-xs md:text-sm font-bold transition-all active:scale-95 ${
            isAlert 
              ? "bg-white/20 hover:bg-white/30 text-white" 
              : "bg-secondary hover:bg-primary/10 hover:text-primary text-foreground border border-border"
          }`}
        >
          <Plus className="h-3.5 w-3.5 md:h-[18px] md:w-[18px]" />
          30s
        </button>
        <button
          onClick={isAlert ? dismiss : stop}
          className={`h-9 md:h-11 px-4 md:px-6 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all active:scale-95 ${
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
