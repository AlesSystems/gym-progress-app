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

  const invitees = await db.user.findMany({
    where: { invitedBy: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      createdAt: true,
      _count: {
        select: { invitees: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(generateApiResponse(true, invitees));
}
