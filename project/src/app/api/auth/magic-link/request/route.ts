import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { magicLinkSchema } from "@/lib/validations/auth";
import { sendMagicLinkEmail } from "@/lib/email";
import { generateApiResponse } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

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

  const result = magicLinkSchema.safeParse(body);
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

  const { email } = result.data;

  if (!rateLimit(`magic-link:${email}`, 3, 10 * 60 * 1000)) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "RATE_LIMIT",
        message: "Too many requests. Please try again later.",
      }),
      { status: 429 }
    );
  }

  const magicLink = await db.magicLink.create({
    data: {
      email,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  try {
    await sendMagicLinkEmail(email, magicLink.token);
  } catch {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "EMAIL_ERROR",
        message: "Failed to send magic link email. Please try again.",
      }),
      { status: 500 }
    );
  }

  return NextResponse.json(
    generateApiResponse(true, undefined, "If that email exists, a magic link has been sent.")
  );
}
