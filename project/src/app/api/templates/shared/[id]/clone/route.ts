import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

async function getFriendIds(userId: string): Promise<string[]> {
  const currentUser = await db.user.findUnique({ where: { id: userId }, select: { invitedBy: true } });
  const ids: string[] = [];
  if (currentUser?.invitedBy) ids.push(currentUser.invitedBy);
  const invitees = await db.user.findMany({ where: { invitedBy: userId }, select: { id: true } });
  for (const u of invitees) ids.push(u.id);
  return ids;
}

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

  // Verify the template exists, is friends-visibility, and belongs to a friend
  const original = await db.workoutTemplate.findFirst({
    where: { id },
    include: { exercises: { orderBy: { orderIndex: "asc" } } },
  });

  if (!original) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
      { status: 404 }
    );
  }

  if (original.visibility !== "friends") {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "FORBIDDEN", message: "This template is not shared." }),
      { status: 403 }
    );
  }

  const friendIds = await getFriendIds(userId);
  if (!friendIds.includes(original.userId)) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "FORBIDDEN", message: "Access denied." }),
      { status: 403 }
    );
  }

  let name = `${original.name} (Copy)`;
  try {
    const body = await req.json();
    if (body?.name && typeof body.name === "string") name = body.name.slice(0, 100);
  } catch {
    // use default name
  }

  const cloned = await db.workoutTemplate.create({
    data: {
      userId,
      name,
      description: original.description,
      clonedFrom: original.id,
      visibility: "private",
      exercises: {
        create: original.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          sets: ex.sets,
          reps: ex.reps,
          targetWeight: ex.targetWeight,
          targetWeightUnit: ex.targetWeightUnit,
          restSeconds: ex.restSeconds,
          tempoNotes: ex.tempoNotes,
          notes: ex.notes,
        })),
      },
    },
    include: { _count: { select: { exercises: true } } },
  });

  return NextResponse.json(
    generateApiResponse(
      true,
      {
        id: cloned.id,
        name: cloned.name,
        description: cloned.description,
        exerciseCount: cloned._count.exercises,
        isArchived: cloned.isArchived,
        visibility: cloned.visibility,
        clonedFrom: cloned.clonedFrom,
        createdAt: cloned.createdAt,
        updatedAt: cloned.updatedAt,
      },
      "Template cloned."
    ),
    { status: 201 }
  );
}
