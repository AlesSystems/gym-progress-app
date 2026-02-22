import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateTemplateExerciseSchema } from "@/lib/validations/template";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string; exId: string }> };

async function getOwnedTemplateExercise(templateId: string, exId: string, userId: string) {
  const template = await db.workoutTemplate.findFirst({ where: { id: templateId, userId } });
  if (!template) return null;
  return db.workoutTemplateExercise.findFirst({ where: { id: exId, templateId } });
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

  const templateExercise = await getOwnedTemplateExercise(id, exId, userId);
  if (!templateExercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Exercise not found in template." }),
      { status: 404 }
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

  const result = updateTemplateExerciseSchema.safeParse(body);
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

  const updated = await db.workoutTemplateExercise.update({
    where: { id: exId },
    data: result.data,
    include: {
      exercise: { select: { id: true, name: true, type: true, movementCategory: true, primaryMuscle: true } },
    },
  });

  await db.workoutTemplate.update({ where: { id }, data: { updatedAt: new Date() } });

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

  const templateExercise = await getOwnedTemplateExercise(id, exId, userId);
  if (!templateExercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Exercise not found in template." }),
      { status: 404 }
    );
  }

  await db.workoutTemplateExercise.delete({ where: { id: exId } });

  // Renumber remaining exercises sequentially
  const remaining = await db.workoutTemplateExercise.findMany({
    where: { templateId: id },
    orderBy: { orderIndex: "asc" },
  });

  await db.$transaction(
    remaining.map((ex, idx) =>
      db.workoutTemplateExercise.update({ where: { id: ex.id }, data: { orderIndex: idx } })
    )
  );

  await db.workoutTemplate.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(generateApiResponse(true, undefined, "Exercise removed."));
}
