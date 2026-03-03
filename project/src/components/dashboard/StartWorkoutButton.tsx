"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";

export default function StartWorkoutButton() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success || res.status === 409) {
        router.push("/sessions/active");
      }
    } finally {
      setStarting(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={starting}
      className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary h-24 transition-all disabled:opacity-50 ring-1 ring-primary/20"
    >
      {starting ? (
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <Dumbbell size={32} strokeWidth={1.5} />
          <span className="text-lg font-semibold">Start Empty Workout</span>
        </>
      )}
    </button>
  );
}
