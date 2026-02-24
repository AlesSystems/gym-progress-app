import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import ExerciseForm from "@/components/exercise/ExerciseForm";

export const metadata = { title: "New Exercise – Ales GYM" };

export default async function NewExercisePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/exercises" className="text-sm font-medium text-primary hover:underline">
          ← Exercise Library
        </Link>

        <h1 className="text-2xl font-bold text-foreground mt-4 mb-6">Add Custom Exercise</h1>

        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <ExerciseForm mode="create" />
        </div>
      </div>
    </div>
  );
}
