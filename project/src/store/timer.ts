import { create } from "zustand";

export type TimerStatus = "IDLE" | "RUNNING" | "ALERT";

interface TimerState {
  status: TimerStatus;
  startTime: number | null;   // Date.now() when timer started
  duration: number;           // total seconds for this timer
  remaining: number;          // computed remaining seconds (updated by tick)

  start: (seconds: number) => void;
  snooze: () => void;
  stop: () => void;
  dismiss: () => void;
  tick: () => void;           // called by setInterval / rAF
  syncFromVisibility: () => void; // called on page focus restore
}

const DEFAULT_REST_SECONDS = 90;

export const useTimerStore = create<TimerState>((set, get) => ({
  status: "IDLE",
  startTime: null,
  duration: DEFAULT_REST_SECONDS,
  remaining: DEFAULT_REST_SECONDS,

  start: (seconds: number) => {
    const dur = seconds > 0 ? seconds : DEFAULT_REST_SECONDS;
    set({ status: "RUNNING", startTime: Date.now(), duration: dur, remaining: dur });
  },

  snooze: () => {
    const { status, startTime, duration } = get();
    if (status === "IDLE") return;
    // Add 30 s to remaining; recalculate startTime so tick stays consistent
    const addedSeconds = 30;
    if (status === "ALERT") {
      // Restart from 30 s
      set({ status: "RUNNING", startTime: Date.now(), duration: addedSeconds, remaining: addedSeconds });
    } else if (status === "RUNNING" && startTime !== null) {
      const newDuration = duration + addedSeconds;
      const elapsed = (Date.now() - startTime) / 1000;
      const newRemaining = Math.max(0, newDuration - elapsed);
      set({ duration: newDuration, remaining: Math.ceil(newRemaining) });
    }
  },

  stop: () => {
    set({ status: "IDLE", startTime: null });
  },

  dismiss: () => {
    set({ status: "IDLE", startTime: null });
  },

  tick: () => {
    const { status, startTime, duration } = get();
    if (status !== "RUNNING" || startTime === null) return;
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    if (remaining <= 0) {
      set({ status: "ALERT", remaining: 0 });
      // Trigger notification + vibration
      if (typeof window !== "undefined") {
        if ("vibrate" in navigator) {
          navigator.vibrate([300, 100, 300]);
        }
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Rest over!", { body: "Time to start your next set.", icon: "/favicon.ico" });
        }
      }
    } else {
      set({ remaining: Math.ceil(remaining) });
    }
  },

  syncFromVisibility: () => {
    const { status, startTime, duration } = get();
    if (status !== "RUNNING" || startTime === null) return;
    const elapsed = (Date.now() - startTime) / 1000;
    const remaining = Math.max(0, duration - elapsed);
    if (remaining <= 0) {
      set({ status: "ALERT", remaining: 0 });
    } else {
      set({ remaining: Math.ceil(remaining) });
    }
  },
}));

/** Call once to request Notification permission */
export async function requestNotificationPermission() {
  if (typeof window === "undefined") return;
  if ("Notification" in window && Notification.permission === "default") {
    await Notification.requestPermission();
  }
}
