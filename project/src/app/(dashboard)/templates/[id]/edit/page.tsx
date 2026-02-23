import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import TemplateEditor from "@/components/template/TemplateEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const template = await db.workoutTemplate.findUnique({ where: { id }, select: { name: true } });
  return { title: `Edit ${template?.name ?? "Template"} – Gym Progress` };
}

export default async function EditTemplatePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const template = await db.workoutTemplate.findFirst({
    where: { id, userId },
    include: {
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: {
            select: { id: true, name: true, type: true, movementCategory: true, primaryMuscle: true },
          },
        },
      },
    },
  });

  if (!template) notFound();

  const exercises = template.exercises.map((ex) => ({
    id: ex.id,
    orderIndex: ex.orderIndex,
    sets: ex.sets,
    reps: ex.reps,
    targetWeight: ex.targetWeight ? Number(ex.targetWeight) : null,
    targetWeightUnit: ex.targetWeightUnit,
    restSeconds: ex.restSeconds,
    tempoNotes: ex.tempoNotes,
    notes: ex.notes,
    exercise: ex.exercise,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Edit Template</h1>
        <p className="text-sm text-gray-500 mt-0.5">{template.name}</p>
      </div>
      <TemplateEditor
        templateId={template.id}
        initialName={template.name}
        initialDescription={template.description ?? ""}
        initialExercises={exercises}
        initialVisibility={(template.visibility as "private" | "friends") ?? "private"}
      />
    </div>
  );
}
