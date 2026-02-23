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
    <div className="group relative flex flex-col gap-4 rounded-[2rem] border border-primary/20 bg-primary/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight truncate tracking-tight">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <p className="text-xs font-black text-primary uppercase tracking-widest opacity-80">by {ownerName}</p>
          </div>
        </div>
        <button
          onClick={() => onClone(id)}
          className="h-10 px-4 flex items-center gap-2 shrink-0 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          aria-label="Clone template"
        >
          <Copy size={14} strokeWidth={3} /> Clone
        </button>
      </div>

      <div className="mt-auto pt-4 border-t border-primary/10 relative z-10 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        <div className="flex items-center gap-3">
          <span>{exerciseCount} movements</span>
          <span>·</span>
          <span>Updated {formatDate(updatedAt)}</span>
        </div>
        
        <span className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          Duplicate →
        </span>
      </div>
    </div>
  );
}
