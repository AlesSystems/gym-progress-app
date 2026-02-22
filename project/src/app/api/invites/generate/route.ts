import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateApiResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
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

  const invite = await db.invite.create({
    data: { createdBy: userId },
  });

  const appUrl = process.env.APP_URL ?? "";
  const inviteUrl = `${appUrl}/join/${invite.code}`;

  return NextResponse.json(
    generateApiResponse(true, { invite, inviteUrl }, "Invite created.")
  );
}
