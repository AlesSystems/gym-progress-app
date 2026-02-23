"use client";

import { Copy } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface FriendTemplateSummary {
  id: string;
  name: string;
  ownerName: string;
  exerciseCount: number;
  updatedAt: string;
}

interface FriendTemplateCardProps extends FriendTemplateSummary {
  onClone: (id: string) => void;
}

export default function FriendTemplateCard({
  id,
  name,
  ownerName,
  exerciseCount,
  updatedAt,
  onClone,
}: FriendTemplateCardProps) {
  return (
    <div className="relative flex flex-col gap-3 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">{name}</h3>
          <p className="text-xs text-indigo-600 mt-0.5">by {ownerName}</p>
        </div>
        <button
          onClick={() => onClone(id)}
          className="flex items-center gap-1 shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
          aria-label="Clone template"
        >
          <Copy size={12} /> Clone
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
        <span>{exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}</span>
        <span>·</span>
        <span>Updated {formatDate(updatedAt)}</span>
      </div>
    </div>
  );
}
