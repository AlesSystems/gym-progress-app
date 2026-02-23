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
      {/* Backdrop with enhanced blur */}
      <div className="fixed inset-0 z-[100] bg-background/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      {/* Drawer with glassmorphism */}
      <div className="fixed right-0 top-0 z-[110] h-full w-full max-w-md bg-card/80 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col border-l border-border/50 animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-8 py-6 bg-secondary/10">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Add Exercise</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Build your workout</p>
          </div>
          <button 
            onClick={onClose} 
            className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filters section */}
        <div className="px-8 pt-6 pb-4 space-y-4 border-b border-border/30">
          <div className="relative group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full h-14 rounded-2xl border border-border bg-background/50 pl-12 pr-4 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-background/50 px-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none"
              >
                <option value="">All Types</option>
                <option value="compound">Compound</option>
                <option value="isolation">Isolation</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-background/50 px-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none"
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
        </div>

        {/* List of exercises */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Searching...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-4">
              <div className="h-16 w-16 bg-secondary rounded-3xl flex items-center justify-center text-muted-foreground/30">
                <Search size={32} />
              </div>
              <p className="text-muted-foreground font-medium italic">No exercises found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {exercises.map((ex) => (
                <div 
                  key={ex.id} 
                  className="group flex items-center justify-between gap-4 rounded-[1.5rem] border border-transparent hover:border-primary/20 hover:bg-primary/5 px-4 py-4 transition-all duration-300"
                >
                  <div className="min-w-0 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <Dumbbell size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-foreground truncate">{ex.name}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{ex.primaryMuscle} · {ex.movementCategory}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onAdd(ex)}
                    className="shrink-0 h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all"
                    aria-label={`Add ${ex.name}`}
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Helper icons
import { Dumbbell } from "lucide-react";
