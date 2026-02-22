import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { passwordResetSchema } from "@/lib/validations/auth";
import { generateApiResponse } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVALID_JSON",
        message: "Invalid request body.",
      }),
      { status: 400 }
    );
  }

  const result = passwordResetSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        details: result.error.flatten(),
      }),
      { status: 422 }
    );
  }

  const { token, password } = result.data;

  const verToken = await db.verificationToken.findUnique({ where: { token } });
  if (!verToken || verToken.expiresAt < new Date()) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "INVALID_TOKEN",
        message: "Invalid or expired reset token.",
      }),
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { email: verToken.email },
    data: { password: hashedPassword },
  });

  await db.verificationToken.delete({ where: { id: verToken.id } });

  return NextResponse.json(
    generateApiResponse(true, undefined, "Password reset successfully.")
  );
}
