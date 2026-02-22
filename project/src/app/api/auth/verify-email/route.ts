import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
  }

  const verToken = await db.verificationToken.findUnique({ where: { token } });

  if (!verToken || verToken.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", req.url));
  }

  await db.user.update({
    where: { email: verToken.email },
    data: { emailVerified: new Date() },
  });

  await db.verificationToken.delete({ where: { id: verToken.id } });

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
}
