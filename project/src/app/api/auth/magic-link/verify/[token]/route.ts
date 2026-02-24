import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const appUrl = getAppUrl();

  let magicLink;
  try {
    magicLink = await db.magicLink.findUnique({ where: { token } });
  } catch {
    return NextResponse.redirect(new URL("/login?error=server-error", req.url));
  }

  if (!magicLink || magicLink.expiresAt < new Date() || magicLink.usedAt) {
    return NextResponse.redirect(new URL("/login?error=invalid-magic-link", req.url));
  }

  let user;
  try {
    user = await db.user.findUnique({ where: { email: magicLink.email } });
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

    await db.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=server-error", req.url));
  }

  let signinToken;
  try {
    signinToken = await db.verificationToken.create({
      data: {
        email: user.email,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=server-error", req.url));
  }

  return NextResponse.redirect(
    new URL(`/verify?signin_token=${signinToken.token}`, appUrl)
  );
}
