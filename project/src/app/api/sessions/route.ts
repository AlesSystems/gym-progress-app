import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { startSessionSchema } from "@/lib/validations/session";
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
  const status = searchParams.get("status") ?? "completed";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    db.workoutSession.findMany({
      where: { userId, status },
      orderBy: { startedAt: "desc" },
      skip,
      take: limit,
      include: {
        exercises: {
          include: {
            sets: { where: { isWarmup: false } },
          },
        },
      },
    }),
    db.workoutSession.count({ where: { userId, status } }),
  ]);

  const data = sessions.map((s) => {
    const allSets = s.exercises.flatMap((e) => e.sets);
    const totalVolume = allSets.reduce((sum, set) => {
      if (set.weight && set.reps) return sum + Number(set.weight) * set.reps;
      return sum;
    }, 0);
    const volumeUnits = allSets.find((s) => s.weightUnit)?.weightUnit ?? null;
    const durationMinutes =
      s.completedAt ? Math.round((s.completedAt.getTime() - s.startedAt.getTime()) / 60000) : null;
    return {
      id: s.id,
      name: s.name,
      status: s.status,
      templateId: s.templateId,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      durationMinutes,
      exerciseCount: s.exercises.length,
      totalSets: allSets.length,
      totalVolume: Math.round(totalVolume),
      totalVolumeUnit: volumeUnits,
    };
  });

  return NextResponse.json(
    generateApiResponse(true, { sessions: data, total, page, limit, pages: Math.ceil(total / limit) })
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  // Check for existing in_progress session
  const active = await db.workoutSession.findFirst({ where: { userId, status: "in_progress" } });
  if (active) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "CONFLICT",
        message: "You already have an active session in progress.",
      }),
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = startSessionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        details: result.error.flatten(),
      }),
      { status: 422 }
    );
  }

  const { templateId, name, scheduledWorkoutId } = result.data;

  // Determine session name
  const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  let sessionName = name ?? null;

  let templateExercises: Array<{
    exerciseId: string;
    orderIndex: number;
    restSeconds: number | null;
    notes: string | null;
    exercise: { name: string };
  }> = [];

  if (templateId) {
    const template = await db.workoutTemplate.findFirst({
      where: { id: templateId, userId },
      include: {
        exercises: {
          orderBy: { orderIndex: "asc" },
          include: { exercise: { select: { name: true } } },
        },
      },
    });
    if (!template) {
      return NextResponse.json(
        generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
        { status: 404 }
      );
    }
    if (!sessionName) sessionName = `${template.name} — ${dateStr}`;
    templateExercises = template.exercises;
  } else {
    if (!sessionName) sessionName = `Freestyle — ${dateStr}`;
  }

  const workoutSession = await db.workoutSession.create({
    data: {
      userId,
      templateId: templateId ?? null,
      name: sessionName,
      status: "in_progress",
      startedAt: new Date(),
      exercises: {
        create: templateExercises.map((te) => ({
          exerciseId: te.exerciseId,
          orderIndex: te.orderIndex,
          restSeconds: te.restSeconds ?? null,
          notes: te.notes ?? null,
          exerciseName: te.exercise.name,
        })),
      },
    },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: { sets: true },
      },
    },
  });

  // Link scheduled workout if provided
  if (scheduledWorkoutId) {
    await db.scheduledWorkout.updateMany({
      where: { id: scheduledWorkoutId, userId, completedSessionId: null },
      data: { completedSessionId: workoutSession.id },
    });
  }

  return NextResponse.json(generateApiResponse(true, workoutSession, "Session started."), { status: 201 });
}

