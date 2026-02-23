"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ClipboardList, Users } from "lucide-react";
import TemplateCard from "@/components/template/TemplateCard";
import FriendTemplateCard, { type FriendTemplateSummary } from "@/components/template/FriendTemplateCard";
import CloneConfirmModal from "@/components/template/CloneConfirmModal";

interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
  isArchived: boolean;
  visibility: string;
  updatedAt: string;
  clonedFrom: string | null;
}

interface TemplateListClientProps {
  initialTemplates: TemplateSummary[];
}

type Tab = "mine" | "friends";

export default function TemplateListClient({ initialTemplates }: TemplateListClientProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showArchived, setShowArchived] = useState(false);
  const [tab, setTab] = useState<Tab>("mine");
  const [cloneTarget, setCloneTarget] = useState<{ id: string; name: string; isFriend?: boolean } | null>(null);
  const [friendTemplates, setFriendTemplates] = useState<FriendTemplateSummary[] | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false);

  const filtered = templates.filter((t) => t.isArchived === showArchived);

  const loadFriendTemplates = async () => {
    if (friendTemplates !== null) return;
    setFriendsLoading(true);
    try {
      const res = await fetch("/api/templates/shared");
      const json = await res.json();
      if (json.success) setFriendTemplates(json.data.templates);
    } finally {
      setFriendsLoading(false);
    }
  };

  const handleTabChange = (next: Tab) => {
    setTab(next);
    if (next === "friends") loadFriendTemplates();
  };

  const handleArchive = async (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (!t) return;
    if (!t.isArchived) {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, isArchived: true } : t)));
    } else {
      await fetch(`/api/templates/${id}`, { method: "PATCH" });
      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, isArchived: false } : t)));
    }
  };

  const handleClone = (id: string) => {
    const t = templates.find((t) => t.id === id);
    if (t) setCloneTarget({ id: t.id, name: t.name });
  };

  const handleFriendClone = (id: string) => {
    const t = friendTemplates?.find((t) => t.id === id);
    if (t) setCloneTarget({ id: t.id, name: t.name, isFriend: true });
  };

  const handleCloneConfirm = async (newName: string) => {
    if (!cloneTarget) return;
    const endpoint = cloneTarget.isFriend
      ? `/api/templates/shared/${cloneTarget.id}/clone`
      : `/api/templates/${cloneTarget.id}/clone`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const json = await res.json();
    if (json.success) {
      setTemplates((prev) => [{ ...json.data, visibility: json.data.visibility ?? "private" }, ...prev]);
    }
    setCloneTarget(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-7xl w-full mx-auto">
        {/* Header with modern typography */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1 md:space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Workout Templates</h1>
            <p className="text-muted-foreground text-base md:text-lg font-medium">Your collection of training routines</p>
          </div>
          {tab === "mine" && (
            <Link
              href="/templates/new"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 w-full md:w-auto"
            >
              <Plus size={20} strokeWidth={3} />
              Create Template
            </Link>
          )}
        </header>

        {/* Primary glassmorphism tabs */}
        <div className="flex p-1 rounded-2xl bg-secondary/30 backdrop-blur-md border border-border/50 w-full md:w-fit">
          <button
            onClick={() => handleTabChange("mine")}
            className={`flex-1 md:flex-none rounded-xl px-4 md:px-6 py-2.5 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              tab === "mine"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Routines
          </button>
          <button
            onClick={() => handleTabChange("friends")}
            className={`flex-1 md:flex-none rounded-xl px-4 md:px-6 py-2.5 text-[10px] md:text-sm font-black uppercase tracking-widest transition-all duration-300 ${
              tab === "friends"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Friends
          </button>
        </div>

        {tab === "mine" && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Active / Archived modern toggle */}
            <div className="flex items-center gap-4 px-2">
              <button
                onClick={() => setShowArchived(false)}
                className={`text-sm font-bold transition-all border-b-2 pb-1 ${
                  !showArchived
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`text-sm font-bold transition-all border-b-2 pb-1 ${
                  showArchived
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Archived
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-10 md:p-20 gap-6 backdrop-blur-sm">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30">
                  <ClipboardList className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <p className="text-base md:text-lg font-medium text-muted-foreground italic text-center">
                  {showArchived ? "Your archive is currently empty." : "No templates yet. Start by creating one!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    {...t}
                    onClone={handleClone}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "friends" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {friendsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading friend templates...</p>
              </div>
            ) : friendTemplates === null || friendTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-20 gap-6 backdrop-blur-sm text-center">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30">
                  <Users size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-muted-foreground italic">No shared templates from friends yet.</p>
                  <Link href="/friends" className="inline-flex text-sm font-bold text-primary hover:underline">
                    Find and follow your friends →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friendTemplates.map((t) => (
                  <FriendTemplateCard key={t.id} {...t} onClone={handleFriendClone} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CloneConfirmModal
        open={!!cloneTarget}
        originalName={cloneTarget?.name ?? ""}
        onConfirm={handleCloneConfirm}
        onCancel={() => setCloneTarget(null)}
      />
    </>
  );
}
