import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ExerciseForm from "@/components/exercise/ExerciseForm";
import type { CreateExerciseInput } from "@/lib/validations/exercise";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const metadata = { title: "Edit Exercise – Gym Progress" };

export default async function EditExercisePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const { slug } = await params;

  const exercise = await db.exercise.findUnique({
    where: { slug, isDeleted: false },
  });

  if (!exercise) notFound();
  if (exercise.isSystemExercise) redirect(`/exercises/${slug}`);
  if (exercise.createdBy !== userId) notFound();

  const defaultValues: Partial<CreateExerciseInput> = {
    name: exercise.name,
    type: exercise.type as CreateExerciseInput["type"],
    movementCategory: exercise.movementCategory as CreateExerciseInput["movementCategory"],
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: Array.isArray(exercise.secondaryMuscles)
      ? (exercise.secondaryMuscles as string[])
      : [],
    defaultUnit: exercise.defaultUnit as CreateExerciseInput["defaultUnit"],
    defaultReps: exercise.defaultReps ?? undefined,
    defaultWeight: exercise.defaultWeight ? Number(exercise.defaultWeight) : undefined,
    demoImageUrl: exercise.demoImageUrl ?? "",
    demoVideoUrl: exercise.demoVideoUrl ?? "",
    description: exercise.description ?? "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href={`/exercises/${slug}`} className="text-sm text-indigo-600 hover:underline">
          ← {exercise.name}
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Edit Exercise</h1>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <ExerciseForm
            mode="edit"
            exerciseId={exercise.id}
            defaultValues={defaultValues}
          />
        </div>
      </div>
    </div>
  );
}
