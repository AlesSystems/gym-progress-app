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
      className="w-full flex items-center justify-center gap-4 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary h-20 transition-all duration-300 disabled:opacity-50 border border-primary/20 backdrop-blur-sm shadow-sm hover:shadow-primary/5 active:scale-[0.98]"
    >
      {starting ? (
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/10">
            <Dumbbell size={24} strokeWidth={2} />
          </div>
          <span className="text-base font-bold tracking-tight uppercase">Start Empty Workout</span>
        </>
      )}
    </button>
  );
}
