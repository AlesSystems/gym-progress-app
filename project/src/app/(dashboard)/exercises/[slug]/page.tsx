import { getServerSession } from "next-auth/next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ExerciseBadge from "@/components/exercise/ExerciseBadge";
import MuscleTagList from "@/components/exercise/MuscleTagList";
import DemoMediaPreview from "@/components/exercise/DemoMediaPreview";
import DeleteButton from "@/components/exercise/DeleteButton";
import type { ExerciseType, MovementCategory } from "@/lib/validations/exercise";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const exercise = await db.exercise.findUnique({ where: { slug } });
  return { title: exercise ? `${exercise.name} – Gym Progress` : "Exercise – Gym Progress" };
}

export default async function ExerciseDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const { slug } = await params;

  const exercise = await db.exercise.findUnique({
    where: { slug, isDeleted: false },
  });

  if (!exercise) notFound();

  // Guard: must be system or own custom
  if (!exercise.isSystemExercise && exercise.createdBy !== userId) notFound();

  const isOwner = !exercise.isSystemExercise && exercise.createdBy === userId;
  const secondaryMuscles = Array.isArray(exercise.secondaryMuscles)
    ? (exercise.secondaryMuscles as string[])
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Breadcrumb */}
        <Link href="/exercises" className="text-sm text-indigo-600 hover:underline">
          ← Exercise Library
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{exercise.name}</h1>
              {!exercise.isSystemExercise && (
                <span className="inline-block mt-1 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Custom Exercise
                </span>
              )}
            </div>
            {isOwner && (
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/exercises/${exercise.slug}/edit`}
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton exerciseId={exercise.id} />
              </div>
            )}
          </div>

          <ExerciseBadge
            type={exercise.type as ExerciseType}
            category={exercise.movementCategory as MovementCategory}
          />

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Muscles</p>
            <MuscleTagList
              primaryMuscle={exercise.primaryMuscle}
              secondaryMuscles={secondaryMuscles}
            />
          </div>

          {(exercise.defaultReps || exercise.defaultWeight || exercise.defaultUnit) && (
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
              {exercise.defaultReps && (
                <div>
                  <p className="text-xs text-gray-500">Default Reps</p>
                  <p className="font-semibold text-gray-900">{exercise.defaultReps}</p>
                </div>
              )}
              {exercise.defaultWeight && (
                <div>
                  <p className="text-xs text-gray-500">Default Weight</p>
                  <p className="font-semibold text-gray-900">
                    {Number(exercise.defaultWeight)} {exercise.defaultUnit ?? "kg"}
                  </p>
                </div>
              )}
              {exercise.defaultUnit && (
                <div>
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="font-semibold text-gray-900">{exercise.defaultUnit}</p>
                </div>
              )}
            </div>
          )}

          {exercise.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Description
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{exercise.description}</p>
            </div>
          )}
        </div>

        {/* Media */}
        <DemoMediaPreview
          imageUrl={exercise.demoImageUrl}
          videoUrl={exercise.demoVideoUrl}
        />
      </div>
    </div>
  );
}
