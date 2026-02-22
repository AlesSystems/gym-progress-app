import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
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
  const { code } = await params;

  const invite = await db.invite.findUnique({ where: { code } });
  if (!invite) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "NOT_FOUND",
        message: "Invite not found.",
      }),
      { status: 404 }
    );
  }

  const now = new Date();
  const notExpired = !invite.expiresAt || invite.expiresAt > now;
  const notMaxed = invite.maxUses === null || invite.currentUses < invite.maxUses;

  if (!notExpired || !notMaxed) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVITE_INVALID",
        message: "Invite is expired or has reached its usage limit.",
      }),
      { status: 400 }
    );
  }

  await db.invite.update({
    where: { id: invite.id },
    data: {
      currentUses: { increment: 1 },
      usedBy: userId,
      usedAt: now,
    },
  });

  // Update user.invitedBy if not already set
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user && !user.invitedBy) {
    await db.user.update({
      where: { id: userId },
      data: { invitedBy: invite.createdBy },
    });
  }

  return NextResponse.json(
    generateApiResponse(true, undefined, "Invite accepted.")
  );
}
