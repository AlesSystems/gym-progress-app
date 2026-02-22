import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateScheduledWorkoutSchema } from "@/lib/validations/scheduled";
import { generateApiResponse } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const existing = await db.scheduledWorkout.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Scheduled workout not found." }),
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

  const result = updateScheduledWorkoutSchema.safeParse(body);
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

  const { scheduledDate, templateId, title, notes } = result.data;

  if (templateId) {
    const template = await db.workoutTemplate.findFirst({ where: { id: templateId, userId } });
    if (!template) {
      return NextResponse.json(
        generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
        { status: 404 }
      );
    }
  }

  const updated = await db.scheduledWorkout.update({
    where: { id },
    data: {
      ...(scheduledDate && { scheduledDate: new Date(`${scheduledDate}T00:00:00.000Z`) }),
      ...(templateId !== undefined && { templateId: templateId ?? null }),
      ...(title !== undefined && { title: title ?? null }),
      ...(notes !== undefined && { notes: notes ?? null }),
    },
    include: { template: { select: { name: true } } },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const swDate = new Date(updated.scheduledDate);
  swDate.setUTCHours(0, 0, 0, 0);

  let status: "planned" | "completed" | "missed";
  if (updated.completedSessionId) {
    status = "completed";
  } else if (swDate < today) {
    status = "missed";
  } else {
    status = "planned";
  }

  return NextResponse.json(
    generateApiResponse(true, {
      id: updated.id,
      title: updated.title ?? updated.template?.name ?? null,
      scheduledDate: updated.scheduledDate.toISOString().slice(0, 10),
      templateId: updated.templateId,
      notes: updated.notes,
      completedSessionId: updated.completedSessionId,
      status,
    }, "Workout updated! ✏️")
  );
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const existing = await db.scheduledWorkout.findFirst({ where: { id, userId } });
  if (!existing) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Scheduled workout not found." }),
      { status: 404 }
    );
  }

  await db.scheduledWorkout.delete({ where: { id } });

  return NextResponse.json(generateApiResponse(true, undefined, "Scheduled workout removed."));
}
