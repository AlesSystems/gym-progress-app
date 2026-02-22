import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateSessionExerciseSchema } from "@/lib/validations/session";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string; exId: string }> };

async function getOwnedExercise(sessionId: string, exId: string, _userId: string) {
  return db.workoutSessionExercise.findFirst({
    where: { id: exId, sessionId },
    include: { session: { select: { userId: true, status: true } } },
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
  const { id, exId } = await params;

  const sessionExercise = await getOwnedExercise(id, exId, userId);
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
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "INVALID_JSON", message: "Invalid request body." }),
      { status: 400 }
    );
  }

  const result = updateSessionExerciseSchema.safeParse(body);
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

  const updated = await db.workoutSessionExercise.update({
    where: { id: exId },
    data: {
      ...(result.data.restSeconds !== undefined && { restSeconds: result.data.restSeconds }),
      ...(result.data.notes !== undefined && { notes: result.data.notes }),
    },
    include: { sets: { orderBy: { setNumber: "asc" } } },
  });

  return NextResponse.json(generateApiResponse(true, updated, "Exercise updated."));
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
  const { id, exId } = await params;

  const sessionExercise = await getOwnedExercise(id, exId, userId);
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

  await db.workoutSessionExercise.delete({ where: { id: exId } });

  return NextResponse.json(generateApiResponse(true, undefined, "Exercise removed."));
}
