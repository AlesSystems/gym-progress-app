"use client";

import { useState } from "react";

interface CloneConfirmModalProps {
  open: boolean;
  originalName: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function CloneConfirmModal({ open, originalName, onConfirm, onCancel }: CloneConfirmModalProps) {
  const [name, setName] = useState(`${originalName} (Copy)`);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl bg-white shadow-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Clone Template</h2>
          <p className="text-sm text-gray-500">
            A full copy of <span className="font-medium text-gray-700">&quot;{originalName}&quot;</span> will be created with all exercises.
          </p>
          <div>
            <label className="text-xs text-gray-500 block mb-1">New template name</label>
            <input
              type="text"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              disabled={!name.trim()}
              onClick={() => onConfirm(name.trim())}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              Clone
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
