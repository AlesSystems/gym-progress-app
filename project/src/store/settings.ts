import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  defaultRestSeconds: number;
  autoStartTimer: boolean;
  setDefaultRestSeconds: (v: number) => void;
  setAutoStartTimer: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultRestSeconds: 90,
      autoStartTimer: false,
      setDefaultRestSeconds: (v) => set({ defaultRestSeconds: v }),
      setAutoStartTimer: (v) => set({ autoStartTimer: v }),
    }),
    { name: "gym-settings" }
  )
);
