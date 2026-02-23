import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(1, "Password is required to confirm deletion."),
});

export async function DELETE(req: NextRequest) {
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

  if (user.password) {
    const valid = await bcrypt.compare(result.data.password, user.password);
    if (!valid) {
      return NextResponse.json({ success: false, error: { message: "Incorrect password." } }, { status: 400 });
    }
  }

  // Cascade delete is set up in Prisma schema (onDelete: Cascade)
  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true, message: "Account deleted." });
}
