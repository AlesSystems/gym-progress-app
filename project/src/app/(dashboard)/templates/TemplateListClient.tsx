"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Workout Templates</h1>
              {tab === "mine" && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {filtered.length} template{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {tab === "mine" && (
              <Link
                href="/templates/new"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                + New Template
              </Link>
            )}
          </div>

          {/* Primary tabs: My Templates / Friends */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleTabChange("mine")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "mine"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              My Templates
            </button>
            <button
              onClick={() => handleTabChange("friends")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === "friends"
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Friends
            </button>
          </div>

          {tab === "mine" && (
            <>
              {/* Active / Archived sub-tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setShowArchived(false)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    !showArchived
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setShowArchived(true)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    showArchived
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Archived
                </button>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                  <p className="text-gray-500 text-sm">
                    {showArchived ? "No archived templates." : "No templates yet. Create your first one!"}
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
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                  <p className="text-gray-400 text-sm">Loading…</p>
                </div>
              ) : friendTemplates === null || friendTemplates.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center space-y-2">
                  <p className="text-gray-500 text-sm">No shared templates from friends yet.</p>
                  <Link href="/friends" className="text-xs text-indigo-600 hover:underline">
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
