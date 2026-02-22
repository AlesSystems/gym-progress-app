import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { passwordResetRequestSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateApiResponse } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`reset-request:${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "RATE_LIMIT",
        message: "Too many requests. Please try again later.",
      }),
      { status: 429 }
    );
  }

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

  const result = passwordResetRequestSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(generateApiResponse(true, undefined, "If that email exists, a reset link has been sent."));
  }

  const { email } = result.data;
  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    // Delete any existing reset token for this email
    await db.verificationToken.deleteMany({ where: { email } });

    const verToken = await db.verificationToken.create({
      data: {
        email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    try {
      await sendPasswordResetEmail(email, verToken.token);
    } catch {
      // Non-fatal
    }
  }

  return NextResponse.json(
    generateApiResponse(true, undefined, "If that email exists, a reset link has been sent.")
  );
}
