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
  return { title: `Edit ${template?.name ?? "Template"} – Ales GYM` };
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Template</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Currently editing: <span className="text-primary font-medium">{template.name}</span>
          </p>
        </header>

        <div className="rounded-3xl border border-border bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <TemplateEditor
            templateId={template.id}
            initialName={template.name}
            initialDescription={template.description ?? ""}
            initialExercises={exercises}
            initialVisibility={(template.visibility as "private" | "friends") ?? "private"}
          />
        </div>
      </div>
    </div>
  );
}
