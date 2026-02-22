import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addTemplateExerciseSchema } from "@/lib/validations/template";
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

  const template = await db.workoutTemplate.findFirst({ where: { id, userId } });
  if (!template) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
      { status: 404 }
    );
  }

  const exerciseCount = await db.workoutTemplateExercise.count({ where: { templateId: id } });
  if (exerciseCount >= 30) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "LIMIT_EXCEEDED",
        message: "Templates can have at most 30 exercises.",
      }),
      { status: 422 }
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

  const result = addTemplateExerciseSchema.safeParse(body);
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
    where: {
      id: result.data.exerciseId,
      isDeleted: false,
      OR: [{ isSystemExercise: true }, { createdBy: userId }],
    },
  });

  if (!exercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Exercise not found." }),
      { status: 404 }
    );
  }

  const templateExercise = await db.workoutTemplateExercise.create({
    data: {
      templateId: id,
      exerciseId: result.data.exerciseId,
      orderIndex: exerciseCount,
      sets: result.data.sets,
      reps: result.data.reps,
      targetWeight: result.data.targetWeight ?? null,
      targetWeightUnit: result.data.targetWeightUnit ?? null,
      restSeconds: result.data.restSeconds ?? null,
      tempoNotes: result.data.tempoNotes ?? null,
      notes: result.data.notes ?? null,
    },
    include: {
      exercise: { select: { id: true, name: true, type: true, movementCategory: true, primaryMuscle: true } },
    },
  });

  await db.workoutTemplate.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(generateApiResponse(true, templateExercise, "Exercise added."), { status: 201 });
}
