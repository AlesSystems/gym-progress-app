"use client";

import { useState } from "react";
import Link from "next/link";
import TemplateCard from "@/components/template/TemplateCard";
import CloneConfirmModal from "@/components/template/CloneConfirmModal";

interface TemplateSummary {
  id: string;
  name: string;
  description: string | null;
  exerciseCount: number;
  isArchived: boolean;
  updatedAt: string;
  clonedFrom: string | null;
}

interface TemplateListClientProps {
  initialTemplates: TemplateSummary[];
}

export default function TemplateListClient({ initialTemplates }: TemplateListClientProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [showArchived, setShowArchived] = useState(false);
  const [cloneTarget, setCloneTarget] = useState<TemplateSummary | null>(null);

  const filtered = templates.filter((t) => t.isArchived === showArchived);

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
    if (t) setCloneTarget(t);
  };

  const handleCloneConfirm = async (newName: string) => {
    if (!cloneTarget) return;
    const res = await fetch(`/api/templates/${cloneTarget.id}/clone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const json = await res.json();
    if (json.success) {
      setTemplates((prev) => [json.data, ...prev]);
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
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} template{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href="/templates/new"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              + New Template
            </Link>
          </div>

          {/* Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowArchived(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !showArchived
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                showArchived
                  ? "bg-indigo-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Archived
            </button>
          </div>

          {/* Grid */}
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
