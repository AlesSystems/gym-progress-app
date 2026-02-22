import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createScheduledWorkoutSchema } from "@/lib/validations/scheduled";
import { generateApiResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const scheduled = await db.scheduledWorkout.findMany({
    where: { userId, scheduledDate: { gte: today } },
    include: { template: { select: { name: true } } },
    orderBy: { scheduledDate: "asc" },
  });

  const data = scheduled.map((sw) => ({
    id: sw.id,
    title: sw.title ?? sw.template?.name ?? null,
    scheduledDate: sw.scheduledDate.toISOString().slice(0, 10),
    templateId: sw.templateId,
    notes: sw.notes,
    completedSessionId: sw.completedSessionId,
    status: sw.completedSessionId ? "completed" : "planned",
    createdAt: sw.createdAt,
    updatedAt: sw.updatedAt,
  }));

  return NextResponse.json(generateApiResponse(true, { scheduled: data }));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "INVALID_JSON", message: "Invalid request body." }),
      { status: 400 }
    );
  }

  const result = createScheduledWorkoutSchema.safeParse(body);
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

  // If templateId provided, verify ownership
  if (templateId) {
    const template = await db.workoutTemplate.findFirst({ where: { id: templateId, userId } });
    if (!template) {
      return NextResponse.json(
        generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
        { status: 404 }
      );
    }
  }

  const scheduled = await db.scheduledWorkout.create({
    data: {
      userId,
      templateId: templateId ?? null,
      scheduledDate: new Date(`${scheduledDate}T00:00:00.000Z`),
      title: title ?? null,
      notes: notes ?? null,
    },
    include: { template: { select: { name: true } } },
  });

  return NextResponse.json(
    generateApiResponse(true, {
      id: scheduled.id,
      title: scheduled.title ?? scheduled.template?.name ?? null,
      scheduledDate: scheduled.scheduledDate.toISOString().slice(0, 10),
      templateId: scheduled.templateId,
      notes: scheduled.notes,
      completedSessionId: scheduled.completedSessionId,
      status: "planned",
    }, "Workout scheduled! 🗓️"),
    { status: 201 }
  );
}
