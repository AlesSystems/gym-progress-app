import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import SettingsClient from "@/components/settings/SettingsClient";

export const metadata = { title: "Settings – Ales GYM" };

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      emailVerified: true,
      image: true,
      unitPreference: true,
      inviteCode: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return <SettingsClient user={user} appUrl={appUrl} />;
}
