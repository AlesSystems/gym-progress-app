"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ConnectButtonProps {
  code: string;
}

export default function ConnectButton({ code }: ConnectButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/accept/${code}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to connect.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/leaderboard"), 1500);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200 text-center">
        Connected! Redirecting to leaderboard…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}
      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Connecting…" : "Connect & Join Leaderboard"}
      </button>
    </div>
  );
}
