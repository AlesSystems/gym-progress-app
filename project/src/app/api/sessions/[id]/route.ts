import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { completeSessionSchema } from "@/lib/validations/session";
import { generateApiResponse, serializeSet } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

async function getOwnedSession(id: string, userId: string) {
  return db.workoutSession.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

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

  if (!workoutSession) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Session not found." }),
      { status: 404 }
    );
  }

  const durationMinutes =
    workoutSession.completedAt
      ? Math.round((workoutSession.completedAt.getTime() - workoutSession.startedAt.getTime()) / 60000)
      : null;

  const serialized = {
    ...workoutSession,
    durationMinutes,
    exercises: workoutSession.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map(serializeSet),
    })),
  };

  return NextResponse.json(generateApiResponse(true, serialized));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const workoutSession = await getOwnedSession(id, userId);
  if (!workoutSession) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Session not found." }),
      { status: 404 }
    );
  }

  if (workoutSession.status !== "in_progress") {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FORBIDDEN",
        message: "Session is already completed or abandoned.",
      }),
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

  const result = completeSessionSchema.safeParse(body);
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

  const updated = await db.workoutSession.update({
    where: { id },
    data: {
      status: result.data.status,
      notes: result.data.notes ?? null,
      completedAt: result.data.status === "completed" ? new Date() : null,
    },
  });

  return NextResponse.json(generateApiResponse(true, updated, `Session ${result.data.status}.`));
}
