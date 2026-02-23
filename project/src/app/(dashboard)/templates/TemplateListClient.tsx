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
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Templates</h1>
          {tab === "mine" && (
            <Link
              href="/templates/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              New
            </Link>
          )}
        </div>

        {/* Primary tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("mine")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "mine"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            My Templates
          </button>
          <button
            onClick={() => handleTabChange("friends")}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === "friends"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            Friends
          </button>
        </div>

        {tab === "mine" && (
          <>
            {/* Active / Archived sub-tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowArchived(false)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  !showArchived
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  showArchived
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                Archived
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-12 gap-3">
                <ClipboardList size={32} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {showArchived ? "No archived templates." : "No templates yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </>
        )}

        {tab === "friends" && (
          <>
            {friendsLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12">
                <p className="text-sm text-muted-foreground">Loading…</p>
              </div>
            ) : friendTemplates === null || friendTemplates.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-border bg-card p-12 gap-3">
                <Users size={32} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No shared templates from friends yet.</p>
                <Link href="/friends" className="text-xs text-primary hover:underline">
                  View your connections →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendTemplates.map((t) => (
                  <FriendTemplateCard key={t.id} {...t} onClone={handleFriendClone} />
                ))}
              </div>
            )}
          </>
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
