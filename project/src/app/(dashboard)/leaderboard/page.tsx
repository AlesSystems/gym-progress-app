import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Trophy, Flame, Dumbbell, Medal, Crown, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  totalVolume: number; // kg
  bestLift: { exerciseName: string; weight: number; unit: string } | null;
};

async function fetchLeaderboard(currentUserId: string): Promise<UserStats[]> {
  // Gather all "connected" user IDs
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

  // Also include team members
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

  const userIds = Array.from(peerIds);

  // Fetch user info
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, displayName: true, name: true, image: true },
  });

  // Fetch completed sessions with sets for volume calculation
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

  // Fetch best lifts
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

  // Build stats per user
  const stats: UserStats[] = users.map((u) => {
    const userSessions = sessions.filter((s) => s.userId === u.id);

    const totalSessions = userSessions.length;

    const completedDates = userSessions
      .map((s) => s.completedAt)
      .filter((d): d is Date => d !== null);
    const streak = calcStreak(completedDates);

    const totalVolume = userSessions.reduce((sum, s) => {
      const vol = s.exercises
        .flatMap((e) => e.sets)
        .reduce((v, set) => {
          if (set.weight != null && set.reps) return v + Number(set.weight) * set.reps;
          return v;
        }, 0);
      return sum + vol;
    }, 0);

    // Best single lift (highest weight)
    const topLift = maxLifts.find((l) => l.userId === u.id);
    const bestLift = topLift
      ? { exerciseName: topLift.exercise.name, weight: topLift.weight, unit: topLift.unit }
      : null;

    return {
      userId: u.id,
      displayName: u.displayName ?? u.name ?? "Unknown",
      image: u.image ?? null,
      isCurrentUser: u.id === currentUserId,
      totalSessions,
      streak,
      totalVolume: Math.round(totalVolume),
      bestLift,
    };
  });

  return stats;
}

// ─── rank helpers ─────────────────────────────────────────────────────────────

function rankBy<T>(arr: T[], key: (x: T) => number): (T & { rank: number })[] {
  return [...arr]
    .sort((a, b) => key(b) - key(a))
    .map((item, i) => ({ ...item, rank: i + 1 }));
}

const MEDAL_COLORS = ["text-yellow-400", "text-slate-400", "text-amber-600"];
const MEDAL_BG = ["bg-yellow-400/10", "bg-slate-400/10", "bg-amber-600/10"];
const MEDAL_BORDER = ["border-yellow-400/30", "border-slate-400/30", "border-amber-600/30"];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={18} className="text-yellow-400 shrink-0" />;
  if (rank === 2) return <Medal size={18} className="text-slate-400 shrink-0" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600 shrink-0" />;
  return (
    <span className="text-xs font-black text-muted-foreground/50 w-[18px] text-center shrink-0">
      {rank}
    </span>
  );
}

type RankedEntry = {
  userId: string;
  displayName: string;
  image: string | null;
  isCurrentUser: boolean;
  rank: number;
  value: number;
  label: string;
};

function LeaderboardList({ entries }: { entries: RankedEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <Trophy size={36} className="text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">No data yet — start logging workouts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const idx = entry.rank - 1;
        const isPodium = entry.rank <= 3;
        return (
          <div
            key={entry.userId}
            className={`relative flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 ${
              entry.isCurrentUser
                ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/5"
                : isPodium
                ? `${MEDAL_BORDER[idx]} ${MEDAL_BG[idx]}`
                : "border-border bg-card/30 hover:bg-card/60"
            }`}
          >
            {/* Rank */}
            <div className="w-6 flex justify-center">
              <RankBadge rank={entry.rank} />
            </div>

            {/* Avatar */}
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all overflow-hidden ${
                entry.isCurrentUser
                  ? "bg-primary/20 text-primary"
                  : isPodium
                  ? `${MEDAL_BG[idx]} ${MEDAL_COLORS[idx]}`
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {entry.image ? (
                <Image src={entry.image} alt={entry.displayName} width={40} height={40} className="object-cover w-full h-full" />
              ) : (
                entry.displayName.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p
                className={`font-bold text-sm truncate ${
                  entry.isCurrentUser ? "text-primary" : "text-foreground"
                }`}
              >
                {entry.displayName}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                    You
                  </span>
                )}
              </p>
            </div>

            {/* Value */}
            <div className="text-right shrink-0">
              <p
                className={`text-base font-black tabular-nums ${
                  isPodium ? MEDAL_COLORS[Math.min(idx, 2)] : "text-foreground"
                } ${entry.isCurrentUser ? "text-primary" : ""}`}
              >
                {entry.value.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
                {entry.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const currentUserId = (session.user as { id: string }).id;
  const allStats = await fetchLeaderboard(currentUserId);

  const hasPeers = allStats.length > 1;

  const byWorkouts = rankBy(allStats, (u) => u.totalSessions).map((u) => ({
    ...u,
    value: u.totalSessions,
    label: u.totalSessions === 1 ? "session" : "sessions",
  }));

  const byStreak = rankBy(allStats, (u) => u.streak).map((u) => ({
    ...u,
    value: u.streak,
    label: u.streak === 1 ? "day" : "days",
  }));

  const byVolume = rankBy(allStats, (u) => u.totalVolume).map((u) => ({
    ...u,
    value: u.totalVolume,
    label: "kg lifted",
  }));

  // For PRs: rank by best single lift weight
  const byPR = rankBy(allStats, (u) => u.bestLift?.weight ?? 0).map((u) => ({
    ...u,
    value: u.bestLift?.weight ?? 0,
    label: u.bestLift
      ? `${u.bestLift.unit} – ${u.bestLift.exerciseName}`
      : "no lifts yet",
  }));

  return (
    <div className="flex flex-col gap-10 p-6 md:p-12 max-w-4xl w-full mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 shadow-xl shadow-yellow-400/5">
              <Trophy size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">
            Compete with your training circle
          </p>
        </div>

        {!hasPeers && (
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-primary/20 shrink-0"
          >
            <Users size={16} />
            Invite Friends
          </Link>
        )}
      </header>

      {/* Solo state */}
      {!hasPeers && (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-16 gap-6 backdrop-blur-sm text-center">
          <div className="h-20 w-20 rounded-full bg-yellow-400/10 flex items-center justify-center">
            <Trophy size={40} className="text-yellow-400/40" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-foreground">You&apos;re the champion — for now</p>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Invite friends or join a team to unlock the leaderboard and see how you stack up!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20"
            >
              Get Invite Link
            </Link>
            <Link
              href="/friends"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-8 py-3 text-base font-bold hover:bg-card hover:scale-[1.05] active:scale-[0.95] transition-all"
            >
              Social Circle
            </Link>
          </div>
        </div>
      )}

      {/* Leaderboard categories */}
      {hasPeers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Total Workouts */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Trophy size={18} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-foreground leading-tight">Total Workouts</h2>
                <p className="text-xs text-muted-foreground">Most sessions completed</p>
              </div>
            </div>
            <LeaderboardList entries={byWorkouts} />
          </section>

          {/* Streak */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Flame size={18} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-foreground leading-tight">Current Streak</h2>
                <p className="text-xs text-muted-foreground">Consecutive training days</p>
              </div>
            </div>
            <LeaderboardList entries={byStreak} />
          </section>

          {/* Total Volume */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Dumbbell size={18} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-foreground leading-tight">Total Volume</h2>
                <p className="text-xs text-muted-foreground">Weight × reps across all sessions</p>
              </div>
            </div>
            <LeaderboardList entries={byVolume} />
          </section>

          {/* Best PR */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                <Medal size={18} />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-foreground leading-tight">Best Single Lift</h2>
                <p className="text-xs text-muted-foreground">Heaviest personal record</p>
              </div>
            </div>
            <LeaderboardList entries={byPR} />
          </section>
        </div>
      )}
    </div>
  );
}
