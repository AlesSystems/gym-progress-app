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

  // Prevent self-invite
  const currentUser = await db.user.findUnique({ where: { id: userId }, select: { invitedBy: true, inviteCode: true } });
  if (currentUser?.inviteCode === code) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "SELF_INVITE",
        message: "You cannot accept your own invite.",
      }),
      { status: 400 }
    );
  }

  let invitedById: string | null = null;

  // Check if it's a personal invite code (User.inviteCode)
  const inviterUser = await db.user.findUnique({ where: { inviteCode: code }, select: { id: true } });
  if (inviterUser) {
    invitedById = inviterUser.id;
  } else {
    // Check Invite table
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

    invitedById = invite.createdBy;

    await db.invite.update({
      where: { id: invite.id },
      data: { currentUses: { increment: 1 }, usedBy: userId, usedAt: now },
    });
  }

  // Update user.invitedBy if not already set
  if (currentUser && !currentUser.invitedBy) {
    await db.user.update({
      where: { id: userId },
      data: { invitedBy: invitedById },
    });
  }

  return NextResponse.json(
    generateApiResponse(true, undefined, "Invite accepted.")
  );
}
