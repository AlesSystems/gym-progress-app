import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "VALIDATION_ERROR",
        message: "Query params 'from' and 'to' are required in YYYY-MM-DD format.",
      }),
      { status: 400 }
    );
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);

  const [completedSessions, scheduledWorkouts] = await Promise.all([
    db.workoutSession.findMany({
      where: {
        userId,
        status: "completed",
        completedAt: { gte: fromDate, lte: toDate },
      },
      include: {
        exercises: {
          include: { sets: { where: { isWarmup: false } } },
        },
      },
      orderBy: { completedAt: "asc" },
    }),
    db.scheduledWorkout.findMany({
      where: {
        userId,
        scheduledDate: { gte: fromDate, lte: toDate },
      },
      include: { template: { select: { name: true } } },
      orderBy: { scheduledDate: "asc" },
    }),
  ]);

  // Build day map
  const days: Record<
    string,
    {
      completedSessions: Array<{
        id: string;
        name: string | null;
        durationMinutes: number | null;
        totalVolume: number;
        volumeUnit: string | null;
      }>;
      scheduledWorkouts: Array<{
        id: string;
        title: string | null;
        templateId: string | null;
        status: "planned" | "completed" | "missed";
        notes: string | null;
        completedSessionId: string | null;
      }>;
    }
  > = {};

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const s of completedSessions) {
    const dateKey = (s.completedAt ?? s.startedAt).toISOString().slice(0, 10);
    if (!days[dateKey]) days[dateKey] = { completedSessions: [], scheduledWorkouts: [] };

    const allSets = s.exercises.flatMap((e: { sets: Array<{ weight: unknown; reps: number | null; weightUnit: string | null }> }) => e.sets);
    const totalVolume = allSets.reduce((sum: number, set: { weight: unknown; reps: number | null }) => {
      if (set.weight && set.reps) return sum + Number(set.weight) * set.reps;
      return sum;
    }, 0);
    const volumeUnit = allSets.find((set: { weightUnit: string | null }) => set.weightUnit)?.weightUnit ?? null;
    const durationMinutes = s.completedAt
      ? Math.round((s.completedAt.getTime() - s.startedAt.getTime()) / 60000)
      : null;

    days[dateKey].completedSessions.push({
      id: s.id,
      name: s.name,
      durationMinutes,
      totalVolume: Math.round(totalVolume),
      volumeUnit,
    });
  }

  for (const sw of scheduledWorkouts) {
    const dateKey = sw.scheduledDate.toISOString().slice(0, 10);
    if (!days[dateKey]) days[dateKey] = { completedSessions: [], scheduledWorkouts: [] };

    const swDate = new Date(sw.scheduledDate);
    swDate.setUTCHours(0, 0, 0, 0);

    let status: "planned" | "completed" | "missed";
    if (sw.completedSessionId) {
      status = "completed";
    } else if (swDate < today) {
      status = "missed";
    } else {
      status = "planned";
    }

    days[dateKey].scheduledWorkouts.push({
      id: sw.id,
      title: sw.title ?? sw.template?.name ?? null,
      templateId: sw.templateId,
      status,
      notes: sw.notes,
      completedSessionId: sw.completedSessionId,
    });
  }

  return NextResponse.json(generateApiResponse(true, { from, to, days }));
}
