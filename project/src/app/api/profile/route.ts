import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/profile";
import { generateApiResponse } from "@/lib/utils";

export async function GET() {
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

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      emailVerified: true,
      image: true,
      unitPreference: true,
      inviteCode: true,
      invitedBy: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NOT_FOUND",
        message: "User not found.",
      }),
      { status: 404 }
    );
  }

  return NextResponse.json(generateApiResponse(true, user));
}

export async function PUT(req: NextRequest) {
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

  const result = updateProfileSchema.safeParse(body);
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

  const updated = await db.user.update({
    where: { id: userId },
    data: result.data,
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      unitPreference: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    generateApiResponse(true, updated, "Profile updated.")
  );
}
