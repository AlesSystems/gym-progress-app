import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: { message: "Not authenticated." } }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: { message: "Invalid request body." } }, { status: 400 });
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { message: result.error.issues[0]?.message ?? "Validation failed." } },
      { status: 422 }
    );
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) {
    return NextResponse.json({ success: false, error: { message: "User not found." } }, { status: 404 });
  }

  if (!user.password) {
    return NextResponse.json(
      { success: false, error: { message: "Your account uses a passwordless login. You cannot set a password this way." } },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(result.data.currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ success: false, error: { message: "Current password is incorrect." } }, { status: 400 });
  }

  const hashed = await bcrypt.hash(result.data.newPassword, 12);
  await db.user.update({ where: { id: userId }, data: { password: hashed } });

  return NextResponse.json({ success: true, message: "Password updated successfully." });
}
