import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Trophy } from "lucide-react";
import LeaderboardTabs, { type CategoryBoards } from "@/components/leaderboard/LeaderboardTabs";

export const metadata = { title: "Leaderboard – Ales GYM" };

// ─── helpers ─────────────────────────────────────────────────────────────────

function calcStreak(completedDates: Date[]): number {
  if (completedDates.length === 0) return 0;
  const daySet = new Set(
    completedDates.map((d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    })
  );
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const cursor = new Date(today);
  if (!daySet.has(todayStr)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    if (!daySet.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

type UserStats = {
  userId: string;
  displayName: string;
  image: string | null;
  isCurrentUser: boolean;
  totalSessions: number;
  streak: number;
  totalVolume: number;
  bestLift: { exerciseName: string; weight: number; unit: string } | null;
};

async function buildStats(userIds: string[], currentUserId: string): Promise<UserStats[]> {
  // Run all three queries in parallel
  const [users, sessions, maxLifts] = await Promise.all([
    db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true, name: true, image: true },
    }),
    db.workoutSession.findMany({
      where: { userId: { in: userIds }, status: "completed" },
      select: {
        userId: true,
        completedAt: true,
        exercises: {
          select: {
            sets: {
              where: { isWarmup: false },
              select: { weight: true, reps: true },
            },
          },
        },
      },
    }),
    db.maxLift.findMany({
      where: { userId: { in: userIds } },
      orderBy: { weight: "desc" },
      select: {
        userId: true,
        weight: true,
        unit: true,
        exercise: { select: { name: true } },
      },
    }),
  ]);

  // Pre-group sessions by userId for O(n) lookup instead of O(n*m) filter
  const sessionsByUser = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const arr = sessionsByUser.get(s.userId);
    if (arr) arr.push(s);
    else sessionsByUser.set(s.userId, [s]);
  }

  // Pre-group maxLifts by userId
  const maxLiftByUser = new Map<string, (typeof maxLifts)[0]>();
  for (const l of maxLifts) {
    if (!maxLiftByUser.has(l.userId)) maxLiftByUser.set(l.userId, l);
  }

  return users.map((u) => {
    const userSessions = sessionsByUser.get(u.id) ?? [];
    const totalSessions = userSessions.length;
    const completedDates = userSessions
      .map((s) => s.completedAt)
      .filter((d): d is Date => d !== null);
    const streak = calcStreak(completedDates);
    const totalVolume = userSessions.reduce((sum, s) => {
      return sum + s.exercises.flatMap((e) => e.sets).reduce((v, set) => {
        if (set.weight != null && set.reps) return v + Number(set.weight) * set.reps;
        return v;
      }, 0);
    }, 0);
    const topLift = maxLiftByUser.get(u.id);
    return {
      userId: u.id,
      displayName: u.displayName ?? u.name ?? "Unknown",
      image: u.image ?? null,
      isCurrentUser: u.id === currentUserId,
      totalSessions,
      streak,
      totalVolume: Math.round(totalVolume),
      bestLift: topLift
        ? { exerciseName: topLift.exercise.name, weight: topLift.weight, unit: topLift.unit }
        : null,
    };
  });
}

async function fetchFriendsLeaderboard(currentUserId: string): Promise<UserStats[]> {
  // Fetch user info and invitees in parallel
  const [currentUser, invitees, teamMemberships] = await Promise.all([
    db.user.findUnique({
      where: { id: currentUserId },
      select: { invitedBy: true },
    }),
    db.user.findMany({
      where: { invitedBy: currentUserId },
      select: { id: true },
    }),
    db.teamMember.findMany({
      where: { userId: currentUserId },
      select: { teamId: true },
    }),
  ]);

  const peerIds = new Set<string>([currentUserId]);
  if (currentUser?.invitedBy) peerIds.add(currentUser.invitedBy);
  invitees.forEach((u) => peerIds.add(u.id));

  if (teamMemberships.length > 0) {
    const teamIds = teamMemberships.map((t) => t.teamId);
    const teammates = await db.teamMember.findMany({
      where: { teamId: { in: teamIds } },
      select: { userId: true },
    });
    teammates.forEach((t) => peerIds.add(t.userId));
  }
  return buildStats(Array.from(peerIds), currentUserId);
}

async function fetchGlobalLeaderboard(currentUserId: string): Promise<UserStats[]> {
  // To avoid performance issues and timeouts, we only process a subset of candidate top users.
  // We'll pick the top 20 by session count and top 20 by best lift.
  const [topBySessions, topByLifts] = await Promise.all([
    db.workoutSession.groupBy({
      by: ["userId"],
      _count: { _all: true },
      where: { status: "completed" },
      orderBy: { _count: { userId: "desc" } },
      take: 20,
    }),
    db.maxLift.findMany({
      orderBy: { weight: "desc" },
      take: 20,
      select: { userId: true },
    }),
  ]);

  const candidateIds = new Set<string>();
  topBySessions.forEach((r) => candidateIds.add(r.userId));
  topByLifts.forEach((r) => candidateIds.add(r.userId));
  
  // Always include current user so they can see their own rank
  candidateIds.add(currentUserId);

  if (candidateIds.size === 0) return [];
  return buildStats(Array.from(candidateIds), currentUserId);
}

// ─── rank helpers ─────────────────────────────────────────────────────────────

function rankBy<T>(arr: T[], key: (x: T) => number, limit = Infinity): (T & { rank: number })[] {
  return [...arr]
    .sort((a, b) => key(b) - key(a))
    .slice(0, limit)
    .map((item, i) => ({ ...item, rank: i + 1 }));
}

function toBoards(stats: UserStats[], limit = Infinity): CategoryBoards {
  return {
    byWorkouts: rankBy(stats, (u) => u.totalSessions, limit).map((u) => ({
      ...u, value: u.totalSessions, label: u.totalSessions === 1 ? "session" : "sessions",
    })),
    byStreak: rankBy(stats, (u) => u.streak, limit).map((u) => ({
      ...u, value: u.streak, label: u.streak === 1 ? "day" : "days",
    })),
    byVolume: rankBy(stats, (u) => u.totalVolume, limit).map((u) => ({
      ...u, value: u.totalVolume, label: "kg lifted",
    })),
    byPR: rankBy(stats, (u) => u.bestLift?.weight ?? 0, limit).map((u) => ({
      ...u,
      value: u.bestLift?.weight ?? 0,
      label: u.bestLift ? `${u.bestLift.unit} – ${u.bestLift.exerciseName}` : "no lifts yet",
    })),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const currentUserId = (session.user as { id: string }).id;

  const [friendStats, globalStats] = await Promise.all([
    fetchFriendsLeaderboard(currentUserId),
    fetchGlobalLeaderboard(currentUserId),
  ]);

  const hasFriends = friendStats.length > 1;
  const friendBoards = toBoards(friendStats);
  const globalBoards = toBoards(globalStats, 10);

  return (
    <div className="flex flex-col gap-10 p-6 md:p-12 max-w-5xl w-full mx-auto">
      {/* Header */}
      <header className="px-1 space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-base max-w-lg">
          Compete with your circle or see where you stand globally.
        </p>
      </header>

      <LeaderboardTabs friends={friendBoards} global={globalBoards} hasFriends={hasFriends} />
    </div>
  );
}
