import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { reorderExercisesSchema } from "@/lib/validations/template";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "INVALID_JSON", message: "Invalid request body." }),
      { status: 400 }
    );
  }

  const result = reorderExercisesSchema.safeParse(body);
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

  // Verify all IDs belong to this template
  const existingIds = await db.workoutTemplateExercise.findMany({
    where: { templateId: id },
    select: { id: true },
  });
  const existingIdSet = new Set(existingIds.map((e) => e.id));
  const invalid = result.data.find((item) => !existingIdSet.has(item.id));
  if (invalid) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVALID_EXERCISE",
        message: `Exercise ${invalid.id} does not belong to this template.`,
      }),
      { status: 422 }
    );
  }

  await db.$transaction(
    result.data.map((item) =>
      db.workoutTemplateExercise.update({ where: { id: item.id }, data: { orderIndex: item.orderIndex } })
    )
  );

  await db.workoutTemplate.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(generateApiResponse(true, undefined, "Exercises reordered."));
}
