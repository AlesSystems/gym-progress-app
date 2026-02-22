import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const appUrl = process.env.APP_URL ?? "";

  const magicLink = await db.magicLink.findUnique({ where: { token } });

  if (!magicLink || magicLink.expiresAt < new Date() || magicLink.usedAt) {
    return NextResponse.redirect(new URL("/login?error=invalid-magic-link", req.url));
  }

  // Find or create user
  let user = await db.user.findUnique({ where: { email: magicLink.email } });
  if (!user) {
    user = await db.user.create({
      data: {
        email: magicLink.email,
        emailVerified: new Date(),
      },
    });
  } else if (!user.emailVerified) {
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });
  }

  // Mark magic link as used
  await db.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  // Create short-lived signin token (2 min expiry)
  const signinToken = await db.verificationToken.create({
    data: {
      email: user.email,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    },
  });

  return NextResponse.redirect(
    new URL(`/verify?signin_token=${signinToken.token}`, appUrl || req.url)
  );
}
