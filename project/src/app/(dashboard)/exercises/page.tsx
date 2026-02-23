import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Dumbbell } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ExerciseCard from "@/components/exercise/ExerciseCard";
import ExerciseFilters from "@/components/exercise/ExerciseFilters";
import type { ExerciseType, MovementCategory } from "@/lib/validations/exercise";

export const metadata = { title: "Exercise Library – Gym Progress" };

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: string;
    category?: string;
    muscle?: string;
    source?: string;
    page?: string;
  }>;
}

export default async function ExerciseLibraryPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const sp = await searchParams;

  const search = sp.search ?? "";
  const type = sp.type ?? "";
  const category = sp.category ?? "";
  const muscle = sp.muscle ?? "";
  const source = sp.source ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const limit = 24;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isDeleted: false,
    AND: [
      { OR: [{ isSystemExercise: true }, { createdBy: userId }] },
    ],
  };

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { primaryMuscle: { contains: search, mode: "insensitive" } },
      ],
    });
  }
  if (type) where.AND.push({ type });
  if (category) where.AND.push({ movementCategory: category });
  if (muscle) where.AND.push({ primaryMuscle: { contains: muscle, mode: "insensitive" } });
  if (source === "system") where.AND.push({ isSystemExercise: true });
  if (source === "custom") where.AND.push({ isSystemExercise: false });

  const [exercises, total] = await Promise.all([
    db.exercise.findMany({
      where,
      orderBy: [{ isSystemExercise: "desc" }, { name: "asc" }],
      skip,
      take: limit,
    }),
    db.exercise.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (category) params.set("category", category);
    if (muscle) params.set("muscle", muscle);
    if (source) params.set("source", source);
    params.set("page", String(p));
    return `/exercises?${params.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Exercises</h1>
        <Link
          href="/exercises/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Custom
        </Link>
      </div>

      {/* Filters */}
      <div>
        <Suspense>
          <ExerciseFilters />
        </Suspense>
      </div>

      {/* Grid */}
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-12 gap-3">
          <Dumbbell size={32} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No exercises found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              id={ex.id}
              name={ex.name}
              slug={ex.slug}
              type={ex.type as ExerciseType}
              movementCategory={ex.movementCategory as MovementCategory}
              primaryMuscle={ex.primaryMuscle}
              secondaryMuscles={
                Array.isArray(ex.secondaryMuscles) ? (ex.secondaryMuscles as string[]) : []
              }
              isSystemExercise={ex.isSystemExercise}
              description={ex.description}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              ← Prev
            </Link>
          )}
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
