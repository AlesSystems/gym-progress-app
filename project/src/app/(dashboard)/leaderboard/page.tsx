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
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, displayName: true, name: true, image: true },
  });

  const sessions = await db.workoutSession.findMany({
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
  });

  const maxLifts = await db.maxLift.findMany({
    where: { userId: { in: userIds } },
    orderBy: { weight: "desc" },
    select: {
      userId: true,
      weight: true,
      unit: true,
      exercise: { select: { name: true } },
    },
  });

  return users.map((u) => {
    const userSessions = sessions.filter((s) => s.userId === u.id);
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
    const topLift = maxLifts.find((l) => l.userId === u.id);
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
  const currentUser = await db.user.findUnique({
    where: { id: currentUserId },
    select: { invitedBy: true },
  });
  const peerIds = new Set<string>([currentUserId]);
  if (currentUser?.invitedBy) peerIds.add(currentUser.invitedBy);
  const invitees = await db.user.findMany({
    where: { invitedBy: currentUserId },
    select: { id: true },
  });
  invitees.forEach((u) => peerIds.add(u.id));
  const teamMemberships = await db.teamMember.findMany({
    where: { userId: currentUserId },
    select: { teamId: true },
  });
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
  // Only include users who have at least one completed session
  const activeRows = await db.workoutSession.findMany({
    where: { status: "completed" },
    select: { userId: true },
    distinct: ["userId"],
  });
  const userIds = activeRows.map((r) => r.userId);
  if (userIds.length === 0) return [];
  return buildStats(userIds, currentUserId);
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
    <div className="flex flex-col gap-10 p-6 md:p-12 max-w-4xl w-full mx-auto">
      {/* Header */}
      <header className="px-2 space-y-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 shadow-xl shadow-yellow-400/5">
            <Trophy size={28} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground text-lg font-medium">
          Compete with your training circle — or the whole app
        </p>
      </header>

      <LeaderboardTabs friends={friendBoards} global={globalBoards} hasFriends={hasFriends} />
    </div>
  );
}
