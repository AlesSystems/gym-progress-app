import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const invite = await db.invite.findUnique({ where: { code } });

  if (!invite) {
    return NextResponse.json(
      generateApiResponse(true, { isValid: false, invite: null }, "Invite not found.")
    );
  }

  const now = new Date();
  const notExpired = !invite.expiresAt || invite.expiresAt > now;
  const notMaxed = invite.maxUses === null || invite.currentUses < invite.maxUses;
  const isValid = notExpired && notMaxed;

  return NextResponse.json(generateApiResponse(true, { isValid, invite }));
}
