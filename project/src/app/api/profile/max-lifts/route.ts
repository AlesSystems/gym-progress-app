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

  const userId = (session.user as { id: string }).id;

  const maxLifts = await db.maxLift.findMany({
    where: { userId },
    include: {
      exercise: {
        select: { id: true, name: true, movementCategory: true },
      },
    },
    orderBy: { achievedAt: "desc" },
  });

  return NextResponse.json(generateApiResponse(true, maxLifts));
}
