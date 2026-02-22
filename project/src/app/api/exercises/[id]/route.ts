import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateExerciseSchema } from "@/lib/validations/exercise";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

async function resolveExercise(id: string) {
  // Accept either cuid id or slug
  const exercise = await db.exercise.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isDeleted: false,
    },
  });
  return exercise;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "UNAUTHORIZED",
        message: "Not authenticated.",
      }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const exercise = await resolveExercise(id);

  if (!exercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NOT_FOUND",
        message: "Exercise not found.",
      }),
      { status: 404 }
    );
  }

  // Guard: user can only see system exercises or their own custom
  if (!exercise.isSystemExercise && exercise.createdBy !== userId) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FORBIDDEN",
        message: "Access denied.",
      }),
      { status: 403 }
    );
  }

  return NextResponse.json(generateApiResponse(true, exercise));
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "UNAUTHORIZED",
        message: "Not authenticated.",
      }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const exercise = await resolveExercise(id);

  if (!exercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NOT_FOUND",
        message: "Exercise not found.",
      }),
      { status: 404 }
    );
  }

  if (exercise.isSystemExercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FORBIDDEN",
        message: "System exercises cannot be modified.",
      }),
      { status: 403 }
    );
  }

  if (exercise.createdBy !== userId) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FORBIDDEN",
        message: "You can only edit your own exercises.",
      }),
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVALID_JSON",
        message: "Invalid request body.",
      }),
      { status: 400 }
    );
  }

  const result = updateExerciseSchema.safeParse(body);
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

  const data = result.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { ...data };
  if (data.demoImageUrl !== undefined) updateData.demoImageUrl = data.demoImageUrl || null;
  if (data.demoVideoUrl !== undefined) updateData.demoVideoUrl = data.demoVideoUrl || null;

  const updated = await db.exercise.update({
    where: { id: exercise.id },
    data: updateData,
  });

  return NextResponse.json(generateApiResponse(true, updated, "Exercise updated."));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "UNAUTHORIZED",
        message: "Not authenticated.",
      }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const exercise = await resolveExercise(id);

  if (!exercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NOT_FOUND",
        message: "Exercise not found.",
      }),
      { status: 404 }
    );
  }

  if (exercise.isSystemExercise) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FORBIDDEN",
        message: "System exercises cannot be deleted.",
      }),
      { status: 403 }
    );
  }

  if (exercise.createdBy !== userId) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "FORBIDDEN",
        message: "You can only delete your own exercises.",
      }),
      { status: 403 }
    );
  }

  // Soft delete
  await db.exercise.update({
    where: { id: exercise.id },
    data: { isDeleted: true },
  });

  return NextResponse.json(generateApiResponse(true, undefined, "Exercise deleted."));
}
