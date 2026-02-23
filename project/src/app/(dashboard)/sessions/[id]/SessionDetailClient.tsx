"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Dumbbell, ArrowLeft, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface SetDetail {
  id: string;
  setNumber: number;
  weight?: number | null;
  weightUnit?: string | null;
  reps?: number | null;
  rpe?: number | null;
  notes?: string | null;
  isWarmup: boolean;
  completedAt?: string | null;
}

interface ExerciseDetail {
  id: string;
  exerciseName: string;
  exerciseId: string;
  restSeconds?: number | null;
  notes?: string | null;
  sets: SetDetail[];
}

interface SessionDetail {
  id: string;
  name: string | null;
  status: string;
  templateId?: string | null;
  notes?: string | null;
  startedAt: string;
  completedAt?: string | null;
  durationMinutes?: number | null;
  exercises: ExerciseDetail[];
}

interface SessionDetailClientProps {
  session: SessionDetail;
}

export default function SessionDetailClient({ session }: SessionDetailClientProps) {
  const router = useRouter();

  const allSets = session.exercises.flatMap((e) => e.sets).filter((s) => !s.isWarmup);
  const totalVolume = allSets.reduce((sum, s) => {
    if (s.weight && s.reps) return sum + s.weight * s.reps;
    return sum;
  }, 0);
  const volumeUnit = allSets.find((s) => s.weightUnit)?.weightUnit ?? "kg";

  const handleRepeat = async () => {
    if (!session.templateId) return;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: session.templateId }),
    });
    const json = await res.json();
    if (json.success) {
      router.push("/sessions/active");
    } else if (res.status === 409) {
      router.push("/sessions/active");
    } else {
      alert(json.error?.message ?? "Failed to start session.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Back */}
        <Link 
          href="/sessions" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft size={16} /> Back to History
        </Link>

        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {session.name ?? "Workout Session"}
            </h1>
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {formatDate(session.startedAt)}
            </p>
          </div>
          
          {session.templateId && (
            <button
              onClick={handleRepeat}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              <RotateCcw size={18} />
              Repeat Workout
            </button>
          )}
        </header>

        {/* Stats Grid with Glassmorphism */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4 text-center transition-all hover:bg-card/60">
            <p className="text-2xl font-bold text-foreground">{session.durationMinutes ?? "—"}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
              <Clock size={12} className="text-blue-500" /> minutes
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4 text-center transition-all hover:bg-card/60">
            <p className="text-2xl font-bold text-foreground">{session.exercises.length}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center justify-center gap-1">
              <Dumbbell size={12} className="text-purple-500" /> exercises
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-4 text-center transition-all hover:bg-card/60">
            <p className="text-2xl font-bold text-foreground">{Math.round(totalVolume).toLocaleString()}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {volumeUnit} volume
            </p>
          </div>
        </div>

        {/* Session notes */}
        {session.notes && (
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 backdrop-blur-sm">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Session Notes</h3>
            <p className="text-sm leading-relaxed text-muted-foreground italic">
              &quot;{session.notes}&quot;
            </p>
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-foreground px-1">Exercise Performance</h2>
          {session.exercises.map((ex) => (
            <div key={ex.id} className="rounded-3xl border border-border bg-card/30 overflow-hidden backdrop-blur-sm transition-all hover:border-primary/20 hover:bg-card/40">
              <div className="px-6 py-4 bg-secondary/20 border-b border-border/50">
                <h3 className="text-base font-bold text-foreground">{ex.exerciseName}</h3>
              </div>
              <div className="px-6 py-5">
                {ex.sets.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No sets logged for this exercise.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50">
                          <th className="text-left pb-3 px-1">Set</th>
                          <th className="text-center pb-3">Weight</th>
                          <th className="text-center pb-3">Reps</th>
                          <th className="text-center pb-3">RPE</th>
                          <th className="text-right pb-3 px-1">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {ex.sets.map((s) => (
                          <tr key={s.id} className={`group hover:bg-secondary/10 transition-colors ${s.isWarmup ? "text-amber-500/80" : "text-foreground"}`}>
                            <td className="py-3 px-1">
                              <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md text-[10px] font-bold ${s.isWarmup ? "bg-amber-500/10" : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                                {s.isWarmup ? "W" : s.setNumber}
                              </span>
                            </td>
                            <td className="py-3 text-center font-medium">
                              {s.weight !== null && s.weight !== undefined ? (
                                <span>{s.weight} <span className="text-[10px] text-muted-foreground">{s.weightUnit ?? "kg"}</span></span>
                              ) : "—"}
                            </td>
                            <td className="py-3 text-center font-semibold text-lg">{s.reps ?? "—"}</td>
                            <td className="py-3 text-center font-medium">
                              {s.rpe ? <span className="text-primary">{s.rpe}</span> : "—"}
                            </td>
                            <td className="py-3 px-1 text-right text-[10px] font-bold uppercase tracking-tighter opacity-50">
                              {s.isWarmup ? "Warm-up" : "Working"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {ex.notes && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Exercise Notes</p>
                    <p className="text-sm text-muted-foreground italic">{ex.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
