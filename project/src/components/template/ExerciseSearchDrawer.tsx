"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Plus } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  type: string;
  movementCategory: string;
  primaryMuscle: string;
}

interface ExerciseSearchDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
}

export default function ExerciseSearchDrawer({ open, onClose, onAdd }: ExerciseSearchDrawerProps) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "30" });
        if (search) params.set("search", search);
        if (type) params.set("type", type);
        if (category) params.set("category", category);
        const res = await fetch(`/api/exercises?${params.toString()}`);
        const json = await res.json();
        setExercises(json.data?.exercises ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, type, category, open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-40 h-full w-full max-w-sm bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Add Exercise</h2>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 pt-3 pb-2 space-y-2 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises…"
              className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="compound">Compound</option>
              <option value="isolation">Isolation</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="push">Push</option>
              <option value="pull">Pull</option>
              <option value="legs">Legs</option>
              <option value="core">Core</option>
              <option value="cardio">Cardio</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading…</p>
          ) : exercises.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No exercises found.</p>
          ) : (
            <ul className="space-y-1">
              {exercises.map((ex) => (
                <li key={ex.id} className="flex items-center justify-between gap-2 rounded-lg hover:bg-gray-50 px-2 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ex.name}</p>
                    <p className="text-xs text-gray-500">{ex.primaryMuscle} · {ex.movementCategory}</p>
                  </div>
                  <button
                    onClick={() => onAdd(ex)}
                    className="shrink-0 rounded-md bg-indigo-600 p-1.5 text-white hover:bg-indigo-500 transition-colors"
                    aria-label={`Add ${ex.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
