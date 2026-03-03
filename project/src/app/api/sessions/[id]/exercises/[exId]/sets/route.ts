import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logSetSchema } from "@/lib/validations/session";
import { generateApiResponse, serializeSet } from "@/lib/utils";

type Params = { params: Promise<{ id: string; exId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id, exId } = await params;

  const sessionExercise = await db.workoutSessionExercise.findFirst({
    where: { id: exId, sessionId: id },
    include: { session: { select: { userId: true, status: true } } },
  });
  if (!sessionExercise || sessionExercise.session.userId !== userId) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Exercise not found." }),
      { status: 404 }
    );
  }
  if (sessionExercise.session.status !== "in_progress") {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "FORBIDDEN", message: "Session is not in progress." }),
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const result = logSetSchema.safeParse(body);
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

  // Determine next set number
  const maxSet = await db.workoutSet.aggregate({
    where: { sessionExerciseId: exId },
    _max: { setNumber: true },
  });
  const setNumber = (maxSet._max.setNumber ?? 0) + 1;

  const completedAt = result.data.completedAt
    ? new Date(result.data.completedAt)
    : result.data.isWarmup === false
    ? new Date()
    : null;

  const newSet = await db.workoutSet.create({
    data: {
      sessionExerciseId: exId,
      setNumber,
      weight: result.data.weight !== undefined ? result.data.weight : null,
      weightUnit: result.data.weightUnit ?? null,
      reps: result.data.reps !== undefined ? result.data.reps : null,
      notes: result.data.notes ?? null,
      isWarmup: result.data.isWarmup,
      completedAt,
    },
  });

  return NextResponse.json(
    generateApiResponse(true, serializeSet(newSet), "Set logged."),
    { status: 201 }
  );
}
