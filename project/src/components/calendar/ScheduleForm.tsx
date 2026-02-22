"use client";

import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { toLocalDateKey } from "./CalendarGrid";
import type { CalendarScheduledWorkout } from "@/types/calendar";

interface Template {
  id: string;
  name: string;
}

interface ScheduleFormProps {
  initialDate: Date;
  editEntry?: CalendarScheduledWorkout | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ScheduleForm({ initialDate, editEntry, onClose, onSuccess }: ScheduleFormProps) {
  const toast = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  const [scheduledDate, setScheduledDate] = useState(toLocalDateKey(initialDate));
  const [templateId, setTemplateId] = useState(editEntry?.templateId ?? "");
  const [title, setTitle] = useState(editEntry?.title ?? "");
  const [notes, setNotes] = useState(editEntry?.notes ?? "");

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setTemplates(json.data.templates);
      })
      .catch(() => {});
  }, []);

  // Auto-fill title from selected template
  useEffect(() => {
    if (!title || title === templates.find((t) => t.id !== templateId)?.name) {
      const tmpl = templates.find((t) => t.id === templateId);
      if (tmpl) setTitle(tmpl.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      scheduledDate,
      ...(templateId && { templateId }),
      ...(title && { title }),
      ...(notes && { notes }),
    };

    try {
      const url = editEntry ? `/api/scheduled/${editEntry.id}` : "/api/scheduled";
      const method = editEntry ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message ?? "Failed to save scheduled workout.", "😬");
        return;
      }

      toast.success(
        editEntry ? "Workout plan updated! ✏️" : "Workout scheduled! You're so organized 🗓️✨",
        editEntry ? "✏️" : "🎉"
      );
      onSuccess();
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.", "😓");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] bg-white rounded-3xl shadow-2xl max-w-md mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Calendar size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              {editEntry ? "Edit Scheduled Workout" : "Schedule a Workout"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Date *</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Template (optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Template <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all bg-white"
            >
              <option value="">— No template —</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Title <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Push Day, Morning Run…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Notes <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Any notes for this session…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !scheduledDate}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-indigo-200"
            >
              {loading ? "Saving…" : editEntry ? "Update" : "Schedule 🗓️"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
