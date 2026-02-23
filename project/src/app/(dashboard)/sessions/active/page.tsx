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
      <div className="min-h-screen bg-background pb-32">
        <ActiveSessionHeader name={session.name} startedAt={session.startedAt} />

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {session.exercises.length === 0 ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-20 text-center backdrop-blur-sm group hover:border-primary/30 transition-all duration-500">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Plus size={40} className="text-primary" />
              </div>
              <p className="text-muted-foreground font-medium mb-8 max-w-xs mx-auto text-lg italic">
                Your workout is a blank canvas. Start by adding your first exercise!
              </p>
              <button
                onClick={() => setShowAddExercise(true)}
                className="rounded-2xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20"
              >
                + Add Exercise
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {session.exercises.map((ex) => (
                  <ExerciseAccordion
                    key={ex.id}
                    exercise={ex}
                    sessionId={session.id}
                    onExerciseRemove={handleExerciseRemove}
                    onExerciseUpdate={handleExerciseUpdate}
                  />
                ))}
              </div>

              {/* Finish Workout Action */}
              <div className="pt-8 px-2">
                <button
                  onClick={() => setShowSummary(true)}
                  className="w-full h-16 rounded-[2rem] bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-xl font-black text-white hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-green-500/30 flex items-center justify-center gap-3"
                >
                  FINISH WORKOUT 
                  <span className="text-2xl">✓</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modern Floating Action Button: Add Exercise */}
      <button
        onClick={() => setShowAddExercise(true)}
        disabled={addingExercise}
        className="fixed right-6 bottom-24 z-50 flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/40 hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50"
        aria-label="Add exercise"
      >
        <Plus size={20} strokeWidth={3} />
        Add Exercise
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
