import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addSessionExerciseSchema } from "@/lib/validations/session";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const workoutSession = await db.workoutSession.findFirst({ where: { id, userId } });
  if (!workoutSession) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Session not found." }),
      { status: 404 }
    );
  }
  if (workoutSession.status !== "in_progress") {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "FORBIDDEN", message: "Session is not in progress." }),
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "INVALID_JSON", message: "Invalid request body." }),
      { status: 400 }
    );
  }

  const result = addSessionExerciseSchema.safeParse(body);
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

  const exercise = await db.exercise.findFirst({
    where: { id: result.data.exerciseId, isDeleted: false },
    select: { id: true, name: true },
  });
  if (!exercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Exercise not found." }),
      { status: 404 }
    );
  }

  // Determine orderIndex
  let orderIndex = result.data.orderIndex;
  if (orderIndex === undefined) {
    const maxOrder = await db.workoutSessionExercise.aggregate({
      where: { sessionId: id },
      _max: { orderIndex: true },
    });
    orderIndex = (maxOrder._max.orderIndex ?? -1) + 1;
  }

  const sessionExercise = await db.workoutSessionExercise.create({
    data: {
      sessionId: id,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      orderIndex,
      restSeconds: result.data.restSeconds ?? null,
      notes: result.data.notes ?? null,
    },
    include: { sets: true },
  });

  return NextResponse.json(generateApiResponse(true, sessionExercise, "Exercise added."), { status: 201 });
}
