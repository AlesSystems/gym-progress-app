"use client";

import { CheckCircle, X } from "lucide-react";

interface ImportSummary {
  imported: { sessions: number; exercises: number; templates: number; scheduled: number };
  skipped: number;
  errors: string[];
}

interface ImportSummaryModalProps {
  summary: ImportSummary;
  onClose: () => void;
}

export default function ImportSummaryModal({ summary, onClose }: ImportSummaryModalProps) {
  const { imported, skipped, errors } = summary;
  const total = imported.sessions + imported.exercises + imported.templates + imported.scheduled;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <h2 className="text-base font-semibold text-gray-900">Import complete</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <dt className="text-gray-500">Sessions imported</dt>
          <dd className="font-medium text-gray-900">{imported.sessions}</dd>
          <dt className="text-gray-500">Exercises imported</dt>
          <dd className="font-medium text-gray-900">{imported.exercises}</dd>
          <dt className="text-gray-500">Templates imported</dt>
          <dd className="font-medium text-gray-900">{imported.templates}</dd>
          <dt className="text-gray-500">Scheduled workouts</dt>
          <dd className="font-medium text-gray-900">{imported.scheduled}</dd>
          <dt className="text-gray-500">Records skipped</dt>
          <dd className="font-medium text-gray-900">{skipped}</dd>
          <dt className="text-gray-500">Total imported</dt>
          <dd className="font-semibold text-indigo-600">{total}</dd>
        </dl>

        {errors.length > 0 && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Errors ({errors.length})</p>
            <ul className="text-xs text-red-600 space-y-1">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
