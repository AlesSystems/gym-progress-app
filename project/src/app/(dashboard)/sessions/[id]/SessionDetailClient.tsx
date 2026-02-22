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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/sessions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6">
          <ArrowLeft size={14} /> Back to History
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">{session.name ?? "Workout"}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(session.startedAt)}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{session.durationMinutes ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <Clock size={10} /> min
            </p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{session.exercises.length}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              <Dumbbell size={10} /> exercises
            </p>
          </div>
          <div className="rounded-lg bg-white border border-gray-200 p-3 text-center">
            <p className="text-xl font-bold text-gray-900">{Math.round(totalVolume).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{volumeUnit} vol</p>
          </div>
        </div>

        {/* Session notes */}
        {session.notes && (
          <div className="mb-6 rounded-lg bg-indigo-50 border border-indigo-200 p-3">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Session Notes</p>
            <p className="text-sm text-indigo-900">{session.notes}</p>
          </div>
        )}

        {/* Exercises */}
        <div className="space-y-4">
          {session.exercises.map((ex) => (
            <div key={ex.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">{ex.exerciseName}</h3>
              </div>
              <div className="px-4 py-3">
                {ex.sets.length === 0 ? (
                  <p className="text-xs text-gray-400">No sets logged.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-400">
                        <th className="text-left font-medium pb-2">#</th>
                        <th className="text-center font-medium pb-2">Weight</th>
                        <th className="text-center font-medium pb-2">Reps</th>
                        <th className="text-center font-medium pb-2">RPE</th>
                        <th className="text-right font-medium pb-2">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ex.sets.map((s) => (
                        <tr key={s.id} className={s.isWarmup ? "text-amber-700" : "text-gray-800"}>
                          <td className="py-1.5 text-xs">{s.isWarmup ? "W" : s.setNumber}</td>
                          <td className="py-1.5 text-center">
                            {s.weight !== null && s.weight !== undefined ? `${s.weight} ${s.weightUnit ?? "kg"}` : "—"}
                          </td>
                          <td className="py-1.5 text-center">{s.reps ?? "—"}</td>
                          <td className="py-1.5 text-center">{s.rpe ?? "—"}</td>
                          <td className="py-1.5 text-right text-xs text-gray-400">
                            {s.isWarmup ? "Warm-up" : "Working"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Repeat Session button */}
        {session.templateId && (
          <div className="mt-6">
            <button
              onClick={handleRepeat}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <RotateCcw size={16} />
              Repeat Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
