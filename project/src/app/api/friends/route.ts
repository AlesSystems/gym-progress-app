import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, { code: "UNAUTHORIZED", message: "Not authenticated." }),
      { status: 401 }
    );
  }

  const userId = (session.user as { id: string }).id;

  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { invitedBy: true },
  });

  const friends: { userId: string; displayName: string; relationship: "invited_you" | "you_invited" }[] = [];

  // The user who invited currentUser
  if (currentUser?.invitedBy) {
    const inviter = await db.user.findUnique({
      where: { id: currentUser.invitedBy },
      select: { id: true, displayName: true, name: true },
    });
    if (inviter) {
      friends.push({
        userId: inviter.id,
        displayName: inviter.displayName ?? inviter.name ?? "Unknown",
        relationship: "invited_you",
      });
    }
  }

  // Users that currentUser invited
  const invitees = await db.user.findMany({
    where: { invitedBy: userId },
    select: { id: true, displayName: true, name: true },
  });

  for (const invitee of invitees) {
    friends.push({
      userId: invitee.id,
      displayName: invitee.displayName ?? invitee.name ?? "Unknown",
      relationship: "you_invited",
    });
  }

  return NextResponse.json(generateApiResponse(true, { friends }));
}
