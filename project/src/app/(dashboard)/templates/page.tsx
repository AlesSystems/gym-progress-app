import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TemplateListClient from "./TemplateListClient";

export const metadata = { title: "Workout Templates – Gym Progress" };

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const templates = await db.workoutTemplate.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { exercises: true } } },
  });

  const data = templates.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    exerciseCount: t._count.exercises,
    isArchived: t.isArchived,
    clonedFrom: t.clonedFrom,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return <TemplateListClient initialTemplates={data} />;
}
