import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTemplateSchema } from "@/lib/validations/template";
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
  const { searchParams } = new URL(req.url);
  const archived = searchParams.get("archived") === "true";

  const templates = await db.workoutTemplate.findMany({
    where: { userId, isArchived: archived },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { exercises: true } } },
  });

  const data = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    exerciseCount: t._count.exercises,
    isArchived: t.isArchived,
    clonedFrom: t.clonedFrom,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return NextResponse.json(generateApiResponse(true, { templates: data }));
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

  const result = createTemplateSchema.safeParse(body);
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

  const template = await db.workoutTemplate.create({
    data: { userId, name: result.data.name, description: result.data.description ?? null },
  });

  return NextResponse.json(generateApiResponse(true, template, "Template created."), { status: 201 });
}
