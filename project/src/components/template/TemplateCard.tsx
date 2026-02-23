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
    <div className="relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link href={`/templates/${id}/edit`} className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-tight truncate">
            {name}
          </h3>
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Template options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
        <span>{exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}</span>
        <span>·</span>
        <span>Updated {formatDate(updatedAt)}</span>
        {isArchived && (
          <span className="ml-auto rounded-full bg-secondary border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Archived
          </span>
        )}
        {!isArchived && visibility === "friends" && (
          <span className="ml-auto rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
            Shared
          </span>
        )}
      </div>

      {/* Context menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-4 top-10 z-20 w-40 rounded-lg border border-border bg-card shadow-xl py-1">
            <Link
              href={`/templates/${id}/edit`}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary"
              onClick={() => setMenuOpen(false)}
            >
              <Edit size={14} /> Edit
            </Link>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-secondary"
              onClick={() => { setMenuOpen(false); onClone(id); }}
            >
              <Copy size={14} /> Clone
            </button>
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => { setMenuOpen(false); onArchive(id); }}
            >
              <Archive size={14} /> {isArchived ? "Restore" : "Archive"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
