import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse, serializeSet } from "@/lib/utils";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  const workoutSession = await db.workoutSession.findFirst({
    where: { userId, status: "in_progress" },
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
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "No active session found." }),
      { status: 404 }
    );
  }

  const serialized = {
    ...workoutSession,
    exercises: workoutSession.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map(serializeSet),
    })),
  };

  return NextResponse.json(generateApiResponse(true, serialized));
}
