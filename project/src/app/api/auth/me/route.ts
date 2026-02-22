import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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

  const user = await db.user.findUnique({
    where: { id: (session.user as { id: string }).id },
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
