import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Activity,
  TrendingUp,
  Calendar,
  Dumbbell,
  Clock,
  Trophy,
  Zap,
  Target,
} from "lucide-react";
import VolumeLoadChart from "@/components/analytics/VolumeLoadChart";
import StrengthProgressChart from "@/components/analytics/StrengthProgressChart";
import FrequencyChart from "@/components/analytics/FrequencyChart";
import MuscleGroupChart from "@/components/analytics/MuscleGroupChart";
import TopExercisesChart from "@/components/analytics/TopExercisesChart";
import DurationTrendChart from "@/components/analytics/DurationTrendChart";
import PersonalRecords from "@/components/analytics/PersonalRecords";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Epley estimated 1RM */
function epley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/** ISO week label: "MMM W1" */
function weekLabel(date: Date): string {
  const mon = new Date(date);
  mon.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const month = mon.toLocaleDateString("en-US", { month: "short" });
  const weekNum = Math.ceil(mon.getDate() / 7);
  return `${month} W${weekNum}`;
}

/** Short date label for X-axis */
function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function capitalize(s: string): string {
  if (!s) return "Other";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  // Fetch all completed sessions with full sets data (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const sessions = await db.workoutSession.findMany({
    where: { userId, status: "completed", completedAt: { gte: sixMonthsAgo } },
    orderBy: { completedAt: "asc" },
    include: {
      exercises: {
        include: {
          exercise: { select: { name: true, primaryMuscle: true } },
          sets: { where: { isWarmup: false } },
        },
      },
    },
  });

  // Determine preferred unit from most common set weightUnit
  const allWeightUnits = sessions
    .flatMap((s) => s.exercises.flatMap((e) => e.sets.map((set) => set.weightUnit)))
    .filter(Boolean) as string[];
  const unitCounts: Record<string, number> = {};
  for (const u of allWeightUnits) unitCounts[u] = (unitCounts[u] ?? 0) + 1;
  const unit = (unitCounts["lb"] ?? 0) > (unitCounts["kg"] ?? 0) ? "lb" : "kg";

  // ── 1. Stat tiles ────────────────────────────────────────────────────────
  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((sum, s) => {
    return (
      sum +
      s.exercises.flatMap((e) => e.sets).reduce((sv, set) => {
        if (set.weight && set.reps) return sv + Number(set.weight) * set.reps;
        return sv;
      }, 0)
    );
  }, 0);
  const durationsMs = sessions
    .filter((s) => s.completedAt)
    .map((s) => s.completedAt!.getTime() - s.startedAt.getTime());
  const avgDuration =
    durationsMs.length ? Math.round(durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 60000) : 0;
  const totalExercises = sessions.reduce((sum, s) => sum + s.exercises.length, 0);

  const fmtVolume =
    totalVolume >= 1_000_000
      ? `${(totalVolume / 1_000_000).toFixed(1)}M`
      : totalVolume >= 1000
      ? `${(totalVolume / 1000).toFixed(1)}k`
      : totalVolume.toFixed(0);

  // ── 2. Volume by week (last 12 weeks) ───────────────────────────────────
  const weeklyMap = new Map<string, { volume: number; sessions: number; date: Date }>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const label = weekLabel(s.completedAt);
    const vol = s.exercises.flatMap((e) => e.sets).reduce((sum, set) => {
      if (set.weight && set.reps) return sum + Number(set.weight) * set.reps;
      return sum;
    }, 0);
    const existing = weeklyMap.get(label);
    if (existing) {
      existing.volume += vol;
      existing.sessions += 1;
    } else {
      weeklyMap.set(label, { volume: vol, sessions: 1, date: s.completedAt });
    }
  }
  // Build last 12 weeks (ensure all are present even with 0)
  const twelveWeeks: { week: string; volume: number; sessions: number }[] = [];
  const now = new Date();
  for (let w = 11; w >= 0; w--) {
    const d = new Date(now);
    d.setDate(d.getDate() - w * 7);
    const label = weekLabel(d);
    const entry = weeklyMap.get(label);
    twelveWeeks.push({
      week: label.replace(" W", "·W"),
      volume: entry ? Math.round(entry.volume) : 0,
      sessions: entry?.sessions ?? 0,
    });
  }

  // ── 3. Strength progress (e1RM over time, top 4 exercises) ──────────────
  // Count exercise appearances
  const exerciseUsage: Record<string, number> = {};
  for (const s of sessions) {
    for (const e of s.exercises) {
      const name = e.exercise?.name ?? e.exerciseName;
      if (name) exerciseUsage[name] = (exerciseUsage[name] ?? 0) + 1;
    }
  }
  const topExNames = Object.entries(exerciseUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([n]) => n);

  // Build timeline per exercise
  const e1rmByDate: Map<string, Record<string, number>> = new Map();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const dateStr = shortDate(s.completedAt);
    for (const e of s.exercises) {
      const name = e.exercise?.name ?? e.exerciseName;
      if (!topExNames.includes(name)) continue;
      for (const set of e.sets) {
        if (!set.weight || !set.reps || set.reps < 1) continue;
        const e1rm = epley(Number(set.weight), set.reps);
        const existing = e1rmByDate.get(dateStr);
        if (!existing) {
          e1rmByDate.set(dateStr, { [name]: e1rm });
        } else {
          existing[name] = Math.max(existing[name] ?? 0, e1rm);
        }
      }
    }
  }
  const e1rmData = Array.from(e1rmByDate.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .slice(-24)
    .map(([date, vals]) => ({ date, ...vals }));

  // ── 4. Frequency by week (last 12 weeks) ────────────────────────────────
  const freqMap = new Map<string, { count: number; fullLabel: string }>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const label = weekLabel(s.completedAt);
    const existing = freqMap.get(label);
    if (existing) existing.count += 1;
    else freqMap.set(label, { count: 1, fullLabel: `Week of ${shortDate(s.completedAt)}` });
  }
  const frequencyData: { label: string; count: number; fullLabel: string }[] = [];
  for (let w = 11; w >= 0; w--) {
    const d = new Date(now);
    d.setDate(d.getDate() - w * 7);
    const label = weekLabel(d);
    const entry = freqMap.get(label);
    frequencyData.push({
      label: label.replace(" W", "·W"),
      count: entry?.count ?? 0,
      fullLabel: entry?.fullLabel ?? `Week of ${shortDate(d)}`,
    });
  }

  // ── 5. Muscle group distribution ─────────────────────────────────────────
  const muscleVol: Record<string, number> = {};
  for (const s of sessions) {
    for (const e of s.exercises) {
      const muscle = capitalize(e.exercise?.primaryMuscle ?? "Other") || "Other";
      const vol = e.sets.reduce((sum, set) => {
        if (set.weight && set.reps) return sum + Number(set.weight) * set.reps;
        return sum;
      }, 0);
      muscleVol[muscle] = (muscleVol[muscle] ?? 0) + vol;
    }
  }
  const totalMuscleVol = Object.values(muscleVol).reduce((a, b) => a + b, 0) || 1;
  const muscleData = Object.entries(muscleVol)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([muscle, volume]) => ({
      muscle,
      volume: Math.round(volume),
      pct: Math.round((volume / totalMuscleVol) * 100),
    }));

  // ── 6. Top exercises by volume ──────────────────────────────────────────
  const exVol: Record<string, { volume: number; sessions: number }> = {};
  for (const s of sessions) {
    for (const e of s.exercises) {
      const name = e.exercise?.name ?? e.exerciseName;
      if (!name) continue;
      const vol = e.sets.reduce((sum, set) => {
        if (set.weight && set.reps) return sum + Number(set.weight) * set.reps;
        return sum;
      }, 0);
      if (!exVol[name]) exVol[name] = { volume: 0, sessions: 0 };
      exVol[name].volume += vol;
      exVol[name].sessions += 1;
    }
  }
  const topExercises = Object.entries(exVol)
    .sort((a, b) => b[1].volume - a[1].volume)
    .slice(0, 8)
    .map(([name, d]) => ({ name, volume: Math.round(d.volume), sessions: d.sessions }));

  // ── 7. Duration trend (last 20 sessions) ────────────────────────────────
  const durationData = sessions
    .filter((s) => s.completedAt)
    .slice(-20)
    .map((s) => ({
      date: shortDate(s.completedAt!),
      duration: Math.round((s.completedAt!.getTime() - s.startedAt.getTime()) / 60000),
      name: s.name ?? "Workout",
    }));
  const avgDur = durationData.length
    ? durationData.reduce((a, b) => a + b.duration, 0) / durationData.length
    : 0;

  // ── 8. Personal records ──────────────────────────────────────────────────
  const prMap: Record<string, { weight: number; reps: number | null; e1rm: number; achievedAt: Date; unit: string }> =
    {};
  for (const s of sessions) {
    if (!s.completedAt) continue;
    for (const e of s.exercises) {
      const name = e.exercise?.name ?? e.exerciseName;
      if (!name) continue;
      for (const set of e.sets) {
        if (!set.weight) continue;
        const w = Number(set.weight);
        const r = set.reps ?? 1;
        const e1rm = epley(w, r);
        const existing = prMap[name];
        if (!existing || e1rm > existing.e1rm) {
          prMap[name] = {
            weight: w,
            reps: set.reps,
            e1rm,
            achievedAt: s.completedAt,
            unit: set.weightUnit ?? unit,
          };
        }
      }
    }
  }
  const personalRecords = Object.entries(prMap)
    .sort((a, b) => b[1].e1rm - a[1].e1rm)
    .slice(0, 8)
    .map(([exercise, d]) => ({
      exercise,
      weight: d.weight,
      unit: d.unit,
      reps: d.reps,
      e1rm: d.e1rm,
      achievedAt: shortDate(d.achievedAt),
    }));

  // ── Render ────────────────────────────────────────────────────────────────

  const statTiles = [
    {
      icon: Dumbbell,
      value: totalSessions.toString(),
      label: "Total Sessions",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      accent: "from-blue-500/10",
    },
    {
      icon: Activity,
      value: `${fmtVolume} ${unit}`,
      label: "Total Volume",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      accent: "from-purple-500/10",
    },
    {
      icon: Clock,
      value: `${avgDuration} min`,
      label: "Avg Session",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      accent: "from-cyan-500/10",
    },
    {
      icon: Target,
      value: totalExercises.toString(),
      label: "Exercise Entries",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      accent: "from-emerald-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl w-full mx-auto">
      {/* ── Header ── */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Analytics</h1>
        </div>
        <p className="text-muted-foreground text-sm pl-[52px]">
          Deep dive into your performance · last 6 months
        </p>
      </header>

      {/* ── Stat Tiles ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statTiles.map((tile) => (
          <div
            key={tile.label}
            className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} to-transparent opacity-40`} />
            <div className="relative z-10 flex flex-col gap-3">
              <div className={`h-9 w-9 rounded-xl ${tile.bg} flex items-center justify-center`}>
                <tile.icon className={`h-4 w-4 ${tile.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-black tabular-nums ${tile.color}`}>{tile.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  {tile.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Volume + Strength (large) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          icon={Activity}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-400"
          title="Volume Load"
          subtitle="Weekly total · kg lifted"
          glowColor="bg-blue-500/5"
        >
          <VolumeLoadChart data={twelveWeeks} unit={unit} />
        </ChartCard>

        <ChartCard
          icon={TrendingUp}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-400"
          title="Estimated 1RM"
          subtitle="Strength progress · Epley formula"
          glowColor="bg-purple-500/5"
        >
          <StrengthProgressChart data={e1rmData} exercises={topExNames} unit={unit} />
        </ChartCard>
      </div>

      {/* ── Row 2: Frequency + Muscle Group + Duration ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard
          icon={Calendar}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-400"
          title="Workout Frequency"
          subtitle="Sessions per week"
          glowColor="bg-emerald-500/5"
        >
          <FrequencyChart data={frequencyData} />
        </ChartCard>

        <ChartCard
          icon={Zap}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-400"
          title="Muscle Groups"
          subtitle="Volume distribution"
          glowColor="bg-orange-500/5"
        >
          <MuscleGroupChart data={muscleData} unit={unit} />
        </ChartCard>

        <ChartCard
          icon={Clock}
          iconBg="bg-cyan-500/10"
          iconColor="text-cyan-400"
          title="Session Duration"
          subtitle="Minutes per workout"
          glowColor="bg-cyan-500/5"
        >
          <DurationTrendChart data={durationData} avg={avgDur} />
        </ChartCard>
      </div>

      {/* ── Row 3: Top Exercises + Personal Records ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          icon={Dumbbell}
          iconBg="bg-pink-500/10"
          iconColor="text-pink-400"
          title="Top Exercises"
          subtitle="By total volume lifted"
          glowColor="bg-pink-500/5"
        >
          <TopExercisesChart data={topExercises} unit={unit} />
        </ChartCard>

        <ChartCard
          icon={Trophy}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-400"
          title="Personal Records"
          subtitle="Best estimated 1RM per exercise"
          glowColor="bg-yellow-500/5"
        >
          <PersonalRecords records={personalRecords} />
        </ChartCard>
      </div>
    </div>
  );
}

// ── ChartCard shell ──────────────────────────────────────────────────────

function ChartCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  glowColor,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  glowColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-6 backdrop-blur-sm shadow-lg transition-all duration-300 hover:border-border/80 hover:shadow-xl">
      <div
        className={`absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-48 h-48 ${glowColor} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground leading-tight">{title}</h3>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {subtitle}
            </p>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
