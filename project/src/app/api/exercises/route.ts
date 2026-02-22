import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createExerciseSchema } from "@/lib/validations/exercise";
import { generateApiResponse } from "@/lib/utils";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (true) {
    const existing = await db.exercise.findUnique({ where: { slug } });
    if (!existing) return slug;
    attempt++;
    slug = `${base}-${attempt}`;
  }
}

export async function GET(req: NextRequest) {
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
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const category = searchParams.get("category") ?? "";
  const muscle = searchParams.get("muscle") ?? "";
  const source = searchParams.get("source") ?? ""; // "system" | "custom" | ""
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isDeleted: false,
    AND: [
      // visibility: system exercises OR own custom exercises
      {
        OR: [
          { isSystemExercise: true },
          { createdBy: userId },
        ],
      },
    ],
  };

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { primaryMuscle: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (type) where.AND.push({ type });
  if (category) where.AND.push({ movementCategory: category });
  if (muscle) where.AND.push({ primaryMuscle: { contains: muscle, mode: "insensitive" } });
  if (source === "system") where.AND.push({ isSystemExercise: true });
  if (source === "custom") where.AND.push({ isSystemExercise: false });

  const [exercises, total] = await Promise.all([
    db.exercise.findMany({
      where,
      orderBy: [{ isSystemExercise: "desc" }, { name: "asc" }],
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        movementCategory: true,
        primaryMuscle: true,
        secondaryMuscles: true,
        defaultUnit: true,
        defaultReps: true,
        defaultWeight: true,
        demoImageUrl: true,
        demoVideoUrl: true,
        description: true,
        isSystemExercise: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.exercise.count({ where }),
  ]);

  return NextResponse.json(
    generateApiResponse(true, {
      exercises,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  );
}

export async function POST(req: NextRequest) {
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

  const result = createExerciseSchema.safeParse(body);
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

  // Check name uniqueness within user scope + system exercises
  const nameConflict = await db.exercise.findFirst({
    where: {
      name: { equals: data.name, mode: "insensitive" },
      isDeleted: false,
      OR: [{ isSystemExercise: true }, { createdBy: userId }],
    },
  });

  if (nameConflict) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NAME_CONFLICT",
        message: "An exercise with this name already exists.",
      }),
      { status: 409 }
    );
  }

  const slug = await uniqueSlug(slugify(data.name));

  const exercise = await db.exercise.create({
    data: {
      name: data.name,
      slug,
      type: data.type,
      movementCategory: data.movementCategory,
      primaryMuscle: data.primaryMuscle,
      secondaryMuscles: data.secondaryMuscles,
      defaultUnit: data.defaultUnit ?? null,
      defaultReps: data.defaultReps ?? null,
      defaultWeight: data.defaultWeight ?? null,
      demoImageUrl: data.demoImageUrl || null,
      demoVideoUrl: data.demoVideoUrl || null,
      description: data.description ?? null,
      isSystemExercise: false,
      createdBy: userId,
    },
  });

  return NextResponse.json(generateApiResponse(true, exercise, "Exercise created."), {
    status: 201,
  });
}
