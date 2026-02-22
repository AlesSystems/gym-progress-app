import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import SessionDetailClient from "./SessionDetailClient";

export const metadata = { title: "Session Detail – Gym Progress" };

type Params = { params: Promise<{ id: string }> };

export default async function SessionDetailPage({ params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const workoutSession = await db.workoutSession.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          sets: { orderBy: { setNumber: "asc" } },
          exercise: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!workoutSession) notFound();

  const durationMinutes = workoutSession.completedAt
    ? Math.round((workoutSession.completedAt.getTime() - workoutSession.startedAt.getTime()) / 60000)
    : null;

  // Serialize
  const data = {
    id: workoutSession.id,
    name: workoutSession.name,
    status: workoutSession.status,
    templateId: workoutSession.templateId,
    notes: workoutSession.notes,
    startedAt: workoutSession.startedAt.toISOString(),
    completedAt: workoutSession.completedAt?.toISOString() ?? null,
    durationMinutes,
    exercises: workoutSession.exercises.map((e) => ({
      id: e.id,
      exerciseName: e.exerciseName,
      exerciseId: e.exerciseId,
      restSeconds: e.restSeconds,
      notes: e.notes,
      sets: e.sets.map((s) => ({
        id: s.id,
        setNumber: s.setNumber,
        weight: s.weight ? Number(s.weight) : null,
        weightUnit: s.weightUnit,
        reps: s.reps,
        rpe: s.rpe ? Number(s.rpe) : null,
        notes: s.notes,
        isWarmup: s.isWarmup,
        completedAt: s.completedAt?.toISOString() ?? null,
      })),
    })),
  };

  return <SessionDetailClient session={data} />;
}
