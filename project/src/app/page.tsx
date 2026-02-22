import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/profile");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <main className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gym Progress
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Track your workouts and progress.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-6 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
