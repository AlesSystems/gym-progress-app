import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total} exercise{total !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/exercises/new"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            + Add Custom Exercise
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Suspense>
            <ExerciseFilters />
          </Suspense>
        </div>

        {/* Grid */}
        {exercises.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500 text-sm">No exercises found. Try adjusting your filters.</p>
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
          <div className="mt-8 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                ← Prev
              </Link>
            )}
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
