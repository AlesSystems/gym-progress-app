"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import ActiveSessionHeader from "@/components/session/ActiveSessionHeader";
import ExerciseAccordion, { SessionExercise } from "@/components/session/ExerciseAccordion";
import RestTimerBar from "@/components/session/RestTimerBar";
import SessionSummaryModal from "@/components/session/SessionSummaryModal";
import ExerciseSearchDrawer from "@/components/template/ExerciseSearchDrawer";
import { requestNotificationPermission } from "@/store/timer";
import { SetData } from "@/components/session/SetRow";

interface ActiveSession {
  id: string;
  name: string | null;
  startedAt: string;
  exercises: SessionExercise[];
}

export default function ActiveSessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addingExercise, setAddingExercise] = useState(false);

  useEffect(() => {
    requestNotificationPermission();
    fetch("/api/sessions/active")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSession(json.data);
        else router.push("/sessions/start");
      })
      .catch(() => router.push("/sessions/start"))
      .finally(() => setLoading(false));
  }, [router]);

  const handleExerciseRemove = (exId: string) => {
    if (!session) return;
    setSession({ ...session, exercises: session.exercises.filter((e) => e.id !== exId) });
  };

  const handleExerciseUpdate = (exId: string, sets: SetData[]) => {
    if (!session) return;
    setSession({
      ...session,
      exercises: session.exercises.map((e) => (e.id === exId ? { ...e, sets } : e)),
    });
  };

  const handleAddExercise = async (exercise: { id: string; name: string }) => {
    if (!session) return;
    setAddingExercise(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/exercises`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id }),
      });
      const json = await res.json();
      if (json.success) {
        const newExercise: SessionExercise = {
          id: json.data.id,
          exerciseName: json.data.exerciseName,
          exerciseId: json.data.exerciseId,
          restSeconds: json.data.restSeconds,
          notes: json.data.notes,
          sets: [],
        };
        setSession({ ...session, exercises: [...session.exercises, newExercise] });
      }
    } finally {
      setAddingExercise(false);
      setShowAddExercise(false);
    }
  };

  const calcStats = () => {
    if (!session) return { totalSets: 0, totalVolume: 0, totalVolumeUnit: "kg" };
    const allSets = session.exercises.flatMap((e) => e.sets).filter((s) => !s.isWarmup);
    const totalSets = allSets.length;
    const totalVolume = allSets.reduce((sum, s) => {
      if (s.weight && s.reps) return sum + Number(s.weight) * s.reps;
      return sum;
    }, 0);
    const totalVolumeUnit = allSets.find((s) => s.weightUnit)?.weightUnit ?? "kg";
    return { totalSets, totalVolume: Math.round(totalVolume), totalVolumeUnit };
  };

  const elapsedMinutes = session
    ? Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-sm">Loading session…</p>
      </div>
    );
  }

  if (!session) return null;

  const stats = calcStats();

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24">
        <ActiveSessionHeader name={session.name} startedAt={session.startedAt} />

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {session.exercises.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-gray-500 text-sm mb-3">No exercises yet. Add your first exercise!</p>
              <button
                onClick={() => setShowAddExercise(true)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                + Add Exercise
              </button>
            </div>
          ) : (
            session.exercises.map((ex) => (
              <ExerciseAccordion
                key={ex.id}
                exercise={ex}
                sessionId={session.id}
                onExerciseRemove={handleExerciseRemove}
                onExerciseUpdate={handleExerciseUpdate}
              />
            ))
          )}

          {/* Finish Workout */}
          <button
            onClick={() => setShowSummary(true)}
            className="w-full rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-500 transition-colors shadow-sm"
          >
            Finish Workout ✓
          </button>
        </div>
      </div>

      {/* FAB: Add Exercise */}
      <button
        onClick={() => setShowAddExercise(true)}
        disabled={addingExercise}
        className="fixed right-4 bottom-20 z-40 flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-colors disabled:opacity-50"
        aria-label="Add exercise"
      >
        <Plus size={16} />
        Exercise
      </button>

      <RestTimerBar />

      <ExerciseSearchDrawer
        open={showAddExercise}
        onClose={() => setShowAddExercise(false)}
        onAdd={handleAddExercise}
      />

      {showSummary && (
        <SessionSummaryModal
          sessionId={session.id}
          durationMinutes={elapsedMinutes}
          totalSets={stats.totalSets}
          totalVolume={stats.totalVolume}
          totalVolumeUnit={stats.totalVolumeUnit}
          onKeepTraining={() => setShowSummary(false)}
        />
      )}
    </>
  );
}
