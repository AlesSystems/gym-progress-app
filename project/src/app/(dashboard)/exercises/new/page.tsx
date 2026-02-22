import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import ExerciseForm from "@/components/exercise/ExerciseForm";

export const metadata = { title: "New Exercise – Gym Progress" };

export default async function NewExercisePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/exercises" className="text-sm text-indigo-600 hover:underline">
          ← Exercise Library
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Add Custom Exercise</h1>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <ExerciseForm mode="create" />
        </div>
      </div>
    </div>
  );
}
