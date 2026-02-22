import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/verify?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@gymapp.com",
    to: email,
    subject: "Verify your email address",
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@gymapp.com",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}
