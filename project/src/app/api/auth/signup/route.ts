import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signUpSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";
import { generateApiResponse } from "@/lib/utils";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)) {
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

  const result = signUpSchema.safeParse(body);
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

  const { name, email, password, inviteCode } = result.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      generateApiResponse(false, undefined, undefined, {
        code: "EMAIL_TAKEN",
        message: "An account with this email already exists.",
      }),
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let invitedById: string | undefined;

  if (inviteCode) {
    // Check User.inviteCode field
    const inviterUser = await db.user.findUnique({ where: { inviteCode } });
    if (inviterUser) {
      invitedById = inviterUser.id;
    } else {
      // Check Invite table
      const invite = await db.invite.findUnique({ where: { code: inviteCode } });
      if (invite) {
        const now = new Date();
        const notExpired = !invite.expiresAt || invite.expiresAt > now;
        const notMaxed = invite.maxUses === null || invite.currentUses < invite.maxUses;
        if (notExpired && notMaxed) {
          invitedById = invite.createdBy;
        }
      }
    }
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(invitedById && { invitedBy: invitedById }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      inviteCode: true,
      createdAt: true,
    },
  });

  // If invite came from Invite table, update it
  if (inviteCode && !invitedById) {
    // already handled above; update if from invite table
  }
  if (inviteCode && invitedById) {
    const invite = await db.invite.findUnique({ where: { code: inviteCode } });
    if (invite) {
      await db.invite.update({
        where: { code: inviteCode },
        data: {
          currentUses: { increment: 1 },
          usedBy: user.id,
          usedAt: new Date(),
        },
      });
    }
  }

  // Create verification token (24hr expiry)
  const verToken = await db.verificationToken.create({
    data: {
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  try {
    await sendVerificationEmail(email, verToken.token);
  } catch {
    // Non-fatal: user created but email failed
  }

  return NextResponse.json(
    generateApiResponse(true, user, "Account created. Please check your email to verify."),
    { status: 201 }
  );
}
