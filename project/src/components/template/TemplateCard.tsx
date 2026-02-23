"use client";

import { MoreVertical, Copy, Archive, Edit } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export interface TemplateCardProps {
  id: string;
  name: string;
  description?: string | null;
  exerciseCount: number;
  isArchived: boolean;
  visibility?: string;
  updatedAt: string | Date;
  onClone: (id: string) => void;
  onArchive: (id: string) => void;
}

export default function TemplateCard({
  id,
  name,
  description,
  exerciseCount,
  isArchived,
  visibility,
  updatedAt,
  onClone,
  onArchive,
}: TemplateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group relative flex flex-col gap-3 md:gap-4 rounded-2xl md:rounded-[2rem] border border-border bg-card/40 p-4 md:p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <Link href={`/templates/${id}/edit`} className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight truncate tracking-tight">
            {name}
          </h3>
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="shrink-0 h-9 w-9 md:h-10 md:w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          aria-label="Template options"
        >
          <MoreVertical size={18} md:size={20} />
        </button>
      </div>

      <div className="space-y-3 md:space-y-4 relative z-10">
        {description && (
          <p className="text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-2 italic border-l-2 border-primary/20 pl-3">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-auto pt-3 md:pt-4 border-t border-border/50">
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-primary" />
            <span>{exerciseCount} ex</span>
          </div>
          <div className="flex items-center gap-1 md:gap-1.5">
            <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-secondary" />
            <span>{formatDate(updatedAt)}</span>
          </div>
          
          <div className="flex-1 flex justify-end gap-1.5 md:gap-2">
            {isArchived && (
              <span className="rounded-full bg-secondary border border-border px-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Archived
              </span>
            )}
            {!isArchived && visibility === "friends" && (
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary">
                Shared
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Context menu with glassmorphism */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-background/20 backdrop-blur-[1px]" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-6 top-16 z-50 w-48 rounded-[1.5rem] border border-border/50 bg-card/90 backdrop-blur-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
            <Link
              href={`/templates/${id}/edit`}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <Edit size={18} /> Edit Routine
            </Link>
            <button
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => { setMenuOpen(false); onClone(id); }}
            >
              <Copy size={18} /> Duplicate
            </button>
            <div className="h-px bg-border/50 my-1 mx-2" />
            <button
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => { setMenuOpen(false); onArchive(id); }}
            >
              <Archive size={18} /> {isArchived ? "Restore" : "Archive"}
            </button>
          </div>
        </>
      )}

      {/* Quick view details */}
      <Link 
        href={`/templates/${id}/edit`}
        className="mt-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
      >
        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Edit Routine →</span>
      </Link>
    </div>
  );
}
