"use client";

import { useState } from "react";
import { Lock, Users } from "lucide-react";

interface VisibilityToggleProps {
  templateId: string;
  initialVisibility: "private" | "friends";
}

export default function VisibilityToggle({ templateId, initialVisibility }: VisibilityToggleProps) {
  const [visibility, setVisibility] = useState<"private" | "friends">(initialVisibility);
  const [saving, setSaving] = useState(false);

  const toggle = async (next: "private" | "friends") => {
    if (next === visibility || saving) return;
    setSaving(true);
    const prev = visibility;
    setVisibility(next);
    try {
      const res = await fetch(`/api/templates/${templateId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      if (!res.ok) setVisibility(prev);
    } catch {
      setVisibility(prev);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">Visibility</span>
      <div
        className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-sm"
        title="Friends who are connected via your invite link will be able to see and clone this template."
      >
        <button
          onClick={() => toggle("private")}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
            visibility === "private"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Lock size={13} />
          Private
        </button>
        <button
          onClick={() => toggle("friends")}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
            visibility === "friends"
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Users size={13} />
          Friends
        </button>
      </div>
    </div>
  );
}
