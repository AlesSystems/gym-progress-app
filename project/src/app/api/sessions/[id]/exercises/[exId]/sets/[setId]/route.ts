import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSetSchema } from "@/lib/validations/session";
import { generateApiResponse, serializeSet } from "@/lib/utils";

type Params = { params: Promise<{ id: string; exId: string; setId: string }> };

async function getOwnedSet(setId: string, exId: string, _sessionId: string, _userId: string) {
  return db.workoutSet.findFirst({
    where: { id: setId, sessionExerciseId: exId },
    include: {
      sessionExercise: {
        select: { sessionId: true, session: { select: { userId: true, status: true } } },
      },
    },
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id, exId, setId } = await params;

  const workoutSet = await getOwnedSet(setId, exId, id, userId);
  if (!workoutSet || workoutSet.sessionExercise.session.userId !== userId) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Set not found." }),
      { status: 404 }
    );
  }
  if (workoutSet.sessionExercise.session.status !== "in_progress") {
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

  const result = updateSetSchema.safeParse(body);
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

  const updated = await db.workoutSet.update({
    where: { id: setId },
    data: {
      ...(result.data.weight !== undefined && { weight: result.data.weight }),
      ...(result.data.weightUnit !== undefined && { weightUnit: result.data.weightUnit }),
      ...(result.data.reps !== undefined && { reps: result.data.reps }),
      ...(result.data.rpe !== undefined && { rpe: result.data.rpe }),
      ...(result.data.notes !== undefined && { notes: result.data.notes }),
      ...(result.data.isWarmup !== undefined && { isWarmup: result.data.isWarmup }),
      ...(result.data.completedAt !== undefined && {
        completedAt: result.data.completedAt ? new Date(result.data.completedAt) : null,
      }),
    },
  });

  return NextResponse.json(generateApiResponse(true, serializeSet(updated), "Set updated."));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id, exId, setId } = await params;

  const workoutSet = await getOwnedSet(setId, exId, id, userId);
  if (!workoutSet || workoutSet.sessionExercise.session.userId !== userId) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Set not found." }),
      { status: 404 }
    );
  }
  if (workoutSet.sessionExercise.session.status !== "in_progress") {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "FORBIDDEN", message: "Session is not in progress." }),
      { status: 403 }
    );
  }

  await db.workoutSet.delete({ where: { id: setId } });

  return NextResponse.json(generateApiResponse(true, undefined, "Set deleted."));
}
