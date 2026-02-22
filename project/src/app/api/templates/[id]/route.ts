import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateTemplateSchema } from "@/lib/validations/template";
import { generateApiResponse } from "@/lib/utils";

type Params = { params: Promise<{ id: string }> };

async function getOwnedTemplate(id: string, userId: string) {
  return db.workoutTemplate.findFirst({ where: { id, userId } });
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

  const template = await db.workoutTemplate.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: {
            select: { id: true, name: true, type: true, movementCategory: true, primaryMuscle: true },
          },
        },
      },
    },
  });

  if (!template) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
      { status: 404 }
    );
  }

  return NextResponse.json(generateApiResponse(true, template));
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
  const { id } = await params;

  const template = await getOwnedTemplate(id, userId);
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

  const result = updateTemplateSchema.safeParse(body);
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

  const updated = await db.workoutTemplate.update({
    where: { id: template.id },
    data: result.data,
  });

  return NextResponse.json(generateApiResponse(true, updated, "Template updated."));
}

export async function PATCH(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const template = await getOwnedTemplate(id, userId);
  if (!template) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
      { status: 404 }
    );
  }

  const restored = await db.workoutTemplate.update({ where: { id: template.id }, data: { isArchived: false } });

  return NextResponse.json(generateApiResponse(true, restored, "Template restored."));
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
  const { id } = await params;

  const template = await getOwnedTemplate(id, userId);
  if (!template) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "NOT_FOUND", message: "Template not found." }),
      { status: 404 }
    );
  }

  await db.workoutTemplate.update({ where: { id: template.id }, data: { isArchived: true } });

  return NextResponse.json(generateApiResponse(true, undefined, "Template archived."));
}
