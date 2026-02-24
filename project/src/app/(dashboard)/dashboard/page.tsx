import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  History,
  LayoutList,
  LineChart,
  User,
  Zap,
  Calendar,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

/** Returns an array of 7 volume values for Mon–Sun of the current week. */
function calcWeeklyVolume(
  sessions: { completedAt: Date | null; exercises: { sets: { weight: unknown; reps: number | null; isWarmup: boolean }[] }[] }[]
): { day: string; volume: number }[] {
  const today = new Date();
  // Monday = 0
  const dayOfWeek = (today.getDay() + 6) % 7; // convert Sun=0 to Mon=0 system
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const volumes: number[] = new Array(7).fill(0);

  for (const s of sessions) {
    if (!s.completedAt) continue;
    const d = new Date(s.completedAt);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((d.getTime() - monday.getTime()) / 86400000);
    if (diff < 0 || diff > 6) continue;

    const vol = s.exercises
      .flatMap((e) => e.sets)
      .filter((set) => !set.isWarmup)
      .reduce((sum, set) => {
        if (set.weight != null && set.reps) return sum + Number(set.weight) * set.reps;
        return sum;
      }, 0);

    volumes[diff] += vol;
  }

  const maxVol = Math.max(...volumes, 1);
  return days.map((day, i) => ({ day, volume: Math.round((volumes[i] / maxVol) * 100) }));
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  // Fetch user display name
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { displayName: true, name: true, image: true },
  });
  const userName = user?.displayName || user?.name || "there";

  // Fetch recent completed sessions (for recent activity + streak + weekly volume)
  const recentSessions = await db.workoutSession.findMany({
    where: { userId, status: "completed" },
    orderBy: { completedAt: "desc" },
    take: 50,
    include: {
      exercises: {
        include: {
          sets: { where: { isWarmup: false } },
        },
      },
    },
  });

  // Recent activity — last 5 sessions
  const recentActivity = recentSessions.slice(0, 5).map((s) => {
    const allSets = s.exercises.flatMap((e) => e.sets);
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
      setCount: allSets.length,
    };
  });

  // Streak
  const completedDates = recentSessions
    .map((s) => s.completedAt)
    .filter((d): d is Date => d !== null);
  const streak = calcStreak(completedDates);

  // Weekly volume (relative heights)
  const weeklyVolume = calcWeeklyVolume(recentSessions);
  const hasAnyVolume = weeklyVolume.some((d) => d.volume > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:space-y-8 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 md:text-base">
            Ready to crush your goals today?
          </p>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-xs md:text-sm font-medium text-secondary-foreground ring-1 ring-border/50">
            <Zap
              className={`h-4 w-4 ${streak > 0 ? "text-orange-500 fill-orange-500" : "text-muted-foreground"}`}
            />
            <span>
              {streak > 0 ? `${streak} Day Streak` : "No streak yet"}
            </span>
          </div>
          <Link href="/profile">
            <div className="h-10 w-10 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center hover:ring-primary/50 transition-all overflow-hidden">
              {user?.image ? (
                <Image src={user.image} alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </Link>
        </div>
      </header>

      {/* Hero / Quick Action Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-1 ring-1 ring-border/50">
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 rounded-[22px] bg-background/40 p-6 text-center backdrop-blur-sm md:p-12">
          <div className="rounded-full bg-primary/10 p-3 md:p-4 ring-1 ring-primary/20">
            <Dumbbell className="h-10 w-10 md:h-12 md:w-12 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold md:text-3xl">
              Start Workout
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto md:text-base">
              Pick up where you left off or start a fresh session.
            </p>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3 sm:flex-row">
            <Button size="lg" className="w-full text-sm md:text-base h-12 rounded-xl" asChild>
              <Link href="/workouts/start">Empty Session</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-sm md:text-base h-12 rounded-xl bg-background/50 backdrop-blur-md hover:bg-background/80"
              asChild
            >
              <Link href="/templates">From Template</Link>
            </Button>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </section>

      {/* Core Features Grid */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-lg font-medium">Quick Access</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <DashboardCard
            title="Templates"
            subtitle="My routines"
            icon={LayoutList}
            href="/templates"
            accentColor="text-blue-500"
            className="p-4 md:p-6"
          />
          <DashboardCard
            title="History"
            subtitle="Past sessions"
            icon={History}
            href="/sessions"
            accentColor="text-green-500"
            className="p-4 md:p-6"
          />
          <DashboardCard
            title="Exercises"
            subtitle="Library"
            icon={Dumbbell}
            href="/exercises"
            accentColor="text-purple-500"
            className="p-4 md:p-6"
          />
          <DashboardCard
            title="Analytics"
            subtitle="Progress"
            icon={LineChart}
            href="/analytics"
            accentColor="text-orange-500"
            className="p-4 md:p-6"
          />
        </div>
      </section>

      {/* Secondary Grid / Info */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </h3>
            <Link href="/sessions" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No sessions yet.</p>
              <p className="text-xs text-muted-foreground/70">
                Complete your first workout to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.completedAt ? relativeTime(s.completedAt) : "—"}
                        {s.exerciseCount > 0 && ` · ${s.exerciseCount} ex`}
                      </p>
                    </div>
                  </div>
                  {s.durationMinutes != null && (
                    <div className="text-[10px] md:text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded shrink-0">
                      {s.durationMinutes} min
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Volume */}
        <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4 text-muted-foreground" />
              Weekly Volume
            </h3>
            <span className="text-xs text-muted-foreground">This week</span>
          </div>

          {!hasAnyVolume ? (
            <div className="flex flex-col items-center justify-center gap-2 h-32 text-center">
              <p className="text-sm text-muted-foreground">No workouts this week yet.</p>
            </div>
          ) : (
            <>
              <div className="h-32 flex items-end justify-between gap-1 md:gap-2 px-1">
                {weeklyVolume.map((d, i) => (
                  <div key={i} className="h-full w-full bg-secondary rounded-t-sm relative group">
                    <div
                      className="absolute bottom-0 w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                      style={{ height: `${d.volume}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] md:text-xs text-muted-foreground px-1">
                {weeklyVolume.map((d, i) => (
                  <span key={i}>{d.day}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
