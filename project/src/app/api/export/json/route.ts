import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

const SCHEMA_VERSION = "1.0";

export async function GET(req: NextRequest) {
  void req;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const allowed = rateLimit(`export-json:${userId}`, 5, 24 * 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. You can export at most 5 times per day." },
      { status: 429 }
    );
  }

  const [user, customExercises, templates, scheduledWorkouts, sessions] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { displayName: true, unitPreference: true, createdAt: true },
    }),
    db.exercise.findMany({
      where: { createdBy: userId, isDeleted: false, isSystemExercise: false },
      select: {
        name: true,
        type: true,
        movementCategory: true,
        primaryMuscle: true,
        secondaryMuscles: true,
        defaultUnit: true,
        defaultReps: true,
        demoVideoUrl: true,
        description: true,
      },
    }),
    db.workoutTemplate.findMany({
      where: { userId, isArchived: false },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
          include: { exercise: { select: { name: true } } },
        },
      },
    }),
    db.scheduledWorkout.findMany({
      where: { userId },
      select: { scheduledDate: true, title: true, notes: true },
    }),
    db.workoutSession.findMany({
      where: { userId, status: "completed" },
      orderBy: { startedAt: "asc" },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
          include: { sets: { orderBy: { setNumber: "asc" } } },
        },
      },
    }),
  ]);

  const backup = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      displayName: user?.displayName ?? null,
      unitPreference: user?.unitPreference ?? "kg",
      createdAt: user?.createdAt.toISOString() ?? null,
    },
    customExercises: customExercises.map((e) => ({
      name: e.name,
      type: e.type,
      movementCategory: e.movementCategory,
      primaryMuscle: e.primaryMuscle,
      secondaryMuscles: e.secondaryMuscles,
      defaultUnit: e.defaultUnit ?? null,
      defaultReps: e.defaultReps ?? null,
      demoVideoUrl: e.demoVideoUrl ?? null,
      description: e.description ?? null,
    })),
    workoutTemplates: templates.map((t) => ({
      name: t.name,
      description: t.description ?? null,
      exercises: t.exercises.map((te) => ({
        exerciseName: te.exercise.name,
        orderIndex: te.orderIndex,
        sets: te.sets,
        reps: te.reps,
        targetWeight: te.targetWeight != null ? Number(te.targetWeight) : null,
        targetWeightUnit: te.targetWeightUnit ?? null,
        restSeconds: te.restSeconds ?? null,
        tempoNotes: te.tempoNotes ?? null,
      })),
    })),
    scheduledWorkouts: scheduledWorkouts.map((sw) => ({
      scheduledDate: sw.scheduledDate.toISOString().slice(0, 10),
      title: sw.title ?? null,
      notes: sw.notes ?? null,
    })),
    sessions: sessions.map((s) => ({
      name: s.name ?? null,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt?.toISOString() ?? null,
      notes: s.notes ?? null,
      exercises: s.exercises.map((ex) => ({
        exerciseName: ex.exerciseName,
        orderIndex: ex.orderIndex,
        restSeconds: ex.restSeconds ?? null,
        sets: ex.sets.map((set) => ({
          setNumber: set.setNumber,
          weight: set.weight != null ? Number(set.weight) : null,
          weightUnit: set.weightUnit ?? null,
          reps: set.reps ?? null,
          rpe: set.rpe != null ? Number(set.rpe) : null,
          isWarmup: set.isWarmup,
          completedAt: set.completedAt?.toISOString() ?? null,
        })),
      })),
    })),
  };

  const today = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(backup, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="gym-backup-${today}.json"`,
    },
  });
}
