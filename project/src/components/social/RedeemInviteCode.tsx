"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

export default function RedeemInviteCode() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invites/accept/${trimmed}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message ?? "Failed to add friend.");
        return;
      }
      setSuccess(true);
      setCode("");
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <UserPlus size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Have an invite code?</p>
          <p className="text-xs text-muted-foreground">Enter it below to connect with a friend</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-sm text-primary font-medium text-center">
          ✓ Friend added!
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRedeem()}
          placeholder="Paste invite code…"
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
        />
        <button
          onClick={handleRedeem}
          disabled={loading || !code.trim()}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
        >
          {loading ? "…" : "Add"}
        </button>
      </div>
    </div>
  );
}
