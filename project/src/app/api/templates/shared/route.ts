import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

async function getFriendIds(userId: string): Promise<string[]> {
  const currentUser = await db.user.findUnique({ where: { id: userId }, select: { invitedBy: true } });
  const ids: string[] = [];
  if (currentUser?.invitedBy) ids.push(currentUser.invitedBy);
  const invitees = await db.user.findMany({ where: { invitedBy: userId }, select: { id: true } });
  for (const u of invitees) ids.push(u.id);
  return ids;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;
  const friendIds = await getFriendIds(userId);

  if (friendIds.length === 0) {
    return NextResponse.json(generateApiResponse(true, { templates: [] }));
  }

  const templates = await db.workoutTemplate.findMany({
    where: {
      userId: { in: friendIds },
      visibility: "friends",
      isArchived: false,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { exercises: true } },
      user: { select: { displayName: true, name: true } },
    },
  });

  const data = templates.map((t) => ({
    id: t.id,
    name: t.name,
    ownerName: t.user.displayName ?? t.user.name ?? "Unknown",
    exerciseCount: t._count.exercises,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return NextResponse.json(generateApiResponse(true, { templates: data }));
}
