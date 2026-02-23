import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DataSettingsClient from "./DataSettingsClient";

export const metadata = { title: "Data & Privacy – Gym Progress" };

export default async function DataSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <DataSettingsClient />
    </div>
  );
}
