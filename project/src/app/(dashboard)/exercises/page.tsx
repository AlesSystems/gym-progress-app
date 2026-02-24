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

export const metadata = { title: "Exercise Library – Ales GYM" };

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
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-7xl w-full mx-auto">
      {/* Header with glassmorphism feel */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1 md:space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">Exercise Library</h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium">Browse and manage your movements</p>
        </div>
        <Link
          href="/exercises/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={3} />
          Create Custom
        </Link>
      </header>

      {/* Filters with better spacing */}
      <section className="relative z-10">
        <Suspense>
          <ExerciseFilters />
        </Suspense>
      </section>

      {/* Grid with glassmorphism cards */}
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-10 md:p-20 gap-6 backdrop-blur-sm">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30">
            <Dumbbell className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <p className="text-base md:text-lg font-medium text-muted-foreground italic text-center">No exercises found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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

      {/* Modern Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 pt-10">
          {page > 1 ? (
            <Link
              href={buildPageUrl(page - 1)}
              className="h-12 w-12 flex items-center justify-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
            >
              ←
            </Link>
          ) : <div className="h-12 w-12" />}
          
          <div className="h-12 px-6 flex items-center justify-center rounded-2xl border border-border bg-card/30 backdrop-blur-sm">
            <span className="text-sm font-black text-foreground tabular-nums">
              {page} <span className="text-muted-foreground font-medium mx-1">/</span> {totalPages}
            </span>
          </div>

          {page < totalPages ? (
            <Link
              href={buildPageUrl(page + 1)}
              className="h-12 w-12 flex items-center justify-center rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm"
            >
              →
            </Link>
          ) : <div className="h-12 w-12" />}
        </nav>
      )}
    </div>
  );
}
