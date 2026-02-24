import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import SessionHistoryClient from "./SessionHistoryClient";

export const metadata = { title: "Session History – Ales GYM" };

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const sessions = await db.workoutSession.findMany({
    where: { userId, status: "completed" },
    orderBy: { startedAt: "desc" },
    take: 20,
    include: {
      exercises: {
        include: {
          sets: { where: { isWarmup: false } },
        },
      },
    },
  });

  const data = sessions.map((s) => {
    const allSets = s.exercises.flatMap((e) => e.sets);
    const totalVolume = allSets.reduce((sum, set) => {
      if (set.weight && set.reps) return sum + Number(set.weight) * set.reps;
      return sum;
    }, 0);
    const volumeUnit = allSets.find((s) => s.weightUnit)?.weightUnit ?? null;
    const durationMinutes = s.completedAt
      ? Math.round((s.completedAt.getTime() - s.startedAt.getTime()) / 60000)
      : null;
    return {
      id: s.id,
      name: s.name,
      status: s.status,
      templateId: s.templateId,
      startedAt: s.startedAt.toISOString(),
      completedAt: s.completedAt?.toISOString() ?? null,
      durationMinutes,
      exerciseCount: s.exercises.length,
      totalSets: allSets.length,
      totalVolume: Math.round(totalVolume),
      totalVolumeUnit: volumeUnit,
    };
  });

  return <SessionHistoryClient initialSessions={data} />;
}
