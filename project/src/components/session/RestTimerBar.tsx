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
      className={`fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 shadow-lg ${
        isAlert ? "bg-red-600 text-white" : "bg-gray-900 text-white"
      }`}
    >
      <div className="flex items-center gap-2">
        {isAlert ? <Bell size={16} /> : <BellOff size={16} className="text-gray-400" />}
        <span className="text-sm font-medium">{isAlert ? "Rest over!" : "Rest"}</span>
        <span className="font-mono text-xl font-bold">{formatTime(remaining)}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={snooze}
          title="Snooze +30s"
          className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30 transition-colors"
        >
          <Plus size={14} />
          30s
        </button>
        <button
          onClick={isAlert ? dismiss : stop}
          className="rounded-lg bg-white/20 px-3 py-1.5 text-sm font-medium hover:bg-white/30 transition-colors"
        >
          {isAlert ? "Dismiss" : "Stop"}
        </button>
      </div>
    </div>
  );
}
