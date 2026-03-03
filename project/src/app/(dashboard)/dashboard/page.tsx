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
      take: 4,
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

  // Recent activity — last 4 sessions
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
    <div className="mx-auto max-w-4xl space-y-8 p-6 md:space-y-10 md:p-12">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {getGreeting()}, <span className="text-primary">{userName}</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${streak > 0 ? "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400" : "bg-muted/50 border-border/50 text-muted-foreground"}`}>
              <Zap
                className={`h-3.5 w-3.5 ${streak > 0 ? "fill-orange-500/20" : ""}`}
                strokeWidth={streak > 0 ? 2.5 : 2}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {streak > 0 ? `${streak} day streak` : "No streak yet"}
              </span>
            </div>
          </div>
        </div>
        <Link href="/settings">
          <div className="h-11 w-11 rounded-lg bg-card/40 border border-border/60 shadow-sm backdrop-blur-sm flex items-center justify-center hover:border-primary/40 transition-all overflow-hidden group">
            {user?.image ? (
              <Image src={user.image} alt="Profile" width={44} height={44} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
            )}
          </div>
        </Link>
      </header>

      {/* Active session resume banner */}
      <ActiveSessionBanner />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Actions */}
        <div className="space-y-8">
          <section className="space-y-4">
             <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              Actions
            </h3>
            <StartWorkoutButton />
            <TemplateQuickStart />
          </section>
        </div>

        {/* Right Column: History */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Recent Sessions
              </h3>
              <Link href="/sessions" className="text-[11px] font-bold text-primary uppercase tracking-wider hover:underline">
                View All
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 p-8 text-center bg-card/20">
                <p className="text-sm font-medium text-muted-foreground">No sessions recorded yet</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-wide">
                  Your journey starts with the first rep
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((s) => (
                  <Link
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-card/40 px-5 py-4 group hover:border-primary/30 hover:bg-card/60 transition-all duration-300 backdrop-blur-sm shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-9 w-9 rounded-md bg-secondary/60 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0 border border-border/40">
                        <Calendar className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold group-hover:text-primary transition-colors truncate tracking-tight">
                          {s.name}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground/80">
                          {s.completedAt ? relativeTime(s.completedAt) : "—"}
                          {s.exerciseCount > 0 && <span className="opacity-40 mx-1.5">·</span>}
                          {s.exerciseCount > 0 && `${s.exerciseCount} exercises`}
                        </p>
                      </div>
                    </div>
                    {s.durationMinutes != null && (
                      <span className="text-[10px] font-black text-muted-foreground/60 bg-secondary/80 px-2 py-1 rounded border border-border/30 shrink-0 ml-2 uppercase tracking-tighter">
                        {s.durationMinutes}m
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
