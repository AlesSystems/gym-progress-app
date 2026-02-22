import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ exerciseId: string }> }
) {
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
  const { exerciseId } = await params;

  const maxLift = await db.maxLift.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
    include: {
      exercise: {
        select: { id: true, name: true, category: true },
      },
    },
  });

  if (!maxLift) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NOT_FOUND",
        message: "Max lift not found.",
      }),
      { status: 404 }
    );
  }

  return NextResponse.json(generateApiResponse(true, maxLift));
}
