"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  exerciseId: string;
}

export default function DeleteButton({ exerciseId }: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/exercises/${exerciseId}`, { method: "DELETE" });
    router.push("/exercises");
    router.refresh();
  };

    if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
    >
      Delete
    </button>
  );
}
