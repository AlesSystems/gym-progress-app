import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Zap,
  Calendar,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ActiveSessionBanner from "@/components/dashboard/ActiveSessionBanner";
import StartWorkoutButton from "@/components/dashboard/StartWorkoutButton";
import TemplateQuickStart from "@/components/dashboard/TemplateQuickStart";
function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return diffMins <= 1 ? "just now" : `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 5) return `${diffWeeks} weeks ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Returns the number of consecutive days (ending today or yesterday) with at least one completed session. */
function calcStreak(completedDates: Date[]): number {
  if (completedDates.length === 0) return 0;

  // Normalise to YYYY-MM-DD strings in local time, deduplicate
  const daySet = new Set(
    completedDates.map((d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    })
  );

  const today = new Date();
  let streak = 0;
  let cursor = new Date(today);

  // Allow streak to start from today OR yesterday (don't break streak if not yet worked out today)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (!daySet.has(todayStr)) {
    // Start from yesterday
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!daySet.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  // Parallel fetch: user info, recent 3 sessions (for display), streak dates
  const [user, recentSessions, streakDates] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { displayName: true, name: true, image: true },
    }),
    db.workoutSession.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        startedAt: true,
        completedAt: true,
        exercises: {
          select: { id: true },
        },
      },
    }),
    db.workoutSession.findMany({
      where: { userId, status: "completed", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 30,
      select: { completedAt: true },
    }),
  ]);

  const userName = user?.displayName || user?.name || "there";

  // Recent activity — last 3 sessions
  const recentActivity = recentSessions.map((s) => {
    const durationMinutes =
      s.completedAt
        ? Math.round((s.completedAt.getTime() - s.startedAt.getTime()) / 60000)
        : null;
    return {
      id: s.id,
      name: s.name ?? "Workout",
      completedAt: s.completedAt,
      durationMinutes,
      exerciseCount: s.exercises.length,
    };
  });

  // Streak
  const completedDates = streakDates
    .map((s) => s.completedAt)
    .filter((d): d is Date => d !== null);
  const streak = calcStreak(completedDates);

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:space-y-6 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
            {getGreeting()}, {userName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Zap
              className={`h-3.5 w-3.5 ${streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`}
            />
            <span className="text-xs text-muted-foreground">
              {streak > 0 ? `${streak} day streak` : "No streak yet"}
            </span>
          </div>
        </div>
        <Link href="/settings">
          <div className="h-9 w-9 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center hover:ring-primary/50 transition-all overflow-hidden">
            {user?.image ? (
              <Image src={user.image} alt="Profile" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Link>
      </header>

      {/* Active session resume banner */}
      <ActiveSessionBanner />

      {/* Start empty workout */}
      <StartWorkoutButton />

      {/* Quick start from template */}
      <TemplateQuickStart />

      {/* Recent sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Recent Sessions
          </h3>
          <Link href="/sessions" className="text-xs text-primary hover:underline">
            View All
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">No sessions yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Complete your first workout to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-card/50 px-4 py-3 group hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.completedAt ? relativeTime(s.completedAt) : "—"}
                      {s.exerciseCount > 0 && ` · ${s.exerciseCount} exercises`}
                    </p>
                  </div>
                </div>
                {s.durationMinutes != null && (
                  <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded shrink-0 ml-2">
                    {s.durationMinutes} min
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
