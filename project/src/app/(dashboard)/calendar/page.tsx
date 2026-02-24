import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import CalendarClient from "./CalendarClient";

export const metadata = { title: "Calendar – Ales GYM" };

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return <CalendarClient />;
}
