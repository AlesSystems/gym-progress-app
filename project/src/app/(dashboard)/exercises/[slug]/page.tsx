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
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8 pb-32 md:pb-12">
        {/* Breadcrumb */}
        <Link 
          href="/exercises" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors px-1"
        >
          <span className="text-base md:text-lg">←</span> Exercise Library
        </Link>

        {/* Header card with glassmorphism */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card/50 p-5 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {exercise.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {!exercise.isSystemExercise && (
                  <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] md:text-xs font-medium text-amber-500">
                    Custom
                  </span>
                )}
                <ExerciseBadge
                  type={exercise.type as ExerciseType}
                  category={exercise.movementCategory as MovementCategory}
                />
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2 md:gap-3 shrink-0">
                <Link
                  href={`/exercises/${exercise.slug}/edit`}
                  className="flex-1 md:flex-none inline-flex h-9 md:h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-xs md:text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton exerciseId={exercise.id} />
              </div>
            )}
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            <div className="space-y-5 md:space-y-6">
              <div>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 md:mb-3">
                  Target Muscles
                </h3>
                <MuscleTagList
                  primaryMuscle={exercise.primaryMuscle}
                  secondaryMuscles={secondaryMuscles}
                />
              </div>

              {(exercise.defaultReps || exercise.defaultWeight || exercise.defaultUnit) && (
                <div>
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 md:mb-3">
                    Defaults
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4 rounded-xl md:rounded-2xl bg-secondary/30 border border-border/50 p-3 md:p-4">
                    {exercise.defaultReps && (
                      <div className="space-y-0.5">
                        <p className="text-[8px] md:text-[10px] font-medium text-muted-foreground uppercase">Reps</p>
                        <p className="text-base md:text-lg font-bold text-foreground">{exercise.defaultReps}</p>
                      </div>
                    )}
                    {exercise.defaultWeight && (
                      <div className="space-y-0.5">
                        <p className="text-[8px] md:text-[10px] font-medium text-muted-foreground uppercase">Weight</p>
                        <p className="text-base md:text-lg font-bold text-foreground">
                          {Number(exercise.defaultWeight)}<span className="text-xs md:text-sm font-normal text-muted-foreground ml-0.5">{exercise.defaultUnit ?? "kg"}</span>
                        </p>
                      </div>
                    )}
                    {exercise.defaultUnit && !exercise.defaultWeight && (
                      <div className="space-y-0.5">
                        <p className="text-[8px] md:text-[10px] font-medium text-muted-foreground uppercase">Unit</p>
                        <p className="text-base md:text-lg font-bold text-foreground">{exercise.defaultUnit}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {exercise.description && (
              <div className="space-y-2 md:space-y-3">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Instructions
                </h3>
                <div className="rounded-xl md:rounded-2xl bg-secondary/20 border border-border/40 p-4 md:p-5">
                  <p className="text-xs md:text-sm leading-relaxed text-muted-foreground whitespace-pre-line italic">
                    {exercise.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Decorative background blur */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
        </div>

        {/* Media section */}
        <div className="rounded-3xl border border-border overflow-hidden bg-card/30 backdrop-blur-sm">
          <DemoMediaPreview
            imageUrl={exercise.demoImageUrl}
            videoUrl={exercise.demoVideoUrl}
          />
        </div>
      </div>
    </div>
  );
}
