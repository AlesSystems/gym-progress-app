"use client";

import { useState } from "react";
import { Trophy, Flame, Dumbbell, Medal, Crown, Globe, Users } from "lucide-react";
import Image from "next/image";

export type RankedEntry = {
  userId: string;
  displayName: string;
  image: string | null;
  isCurrentUser: boolean;
  rank: number;
  value: number;
  label: string;
};

export type CategoryBoards = {
  byWorkouts: RankedEntry[];
  byStreak: RankedEntry[];
  byVolume: RankedEntry[];
  byPR: RankedEntry[];
};

interface LeaderboardTabsProps {
  friends: CategoryBoards;
  global: CategoryBoards;
  hasFriends: boolean;
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
            <div className="w-6 flex justify-center">
              <RankBadge rank={entry.rank} />
            </div>
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
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm truncate ${entry.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                {entry.displayName}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary/60">You</span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-base font-black tabular-nums ${isPodium ? MEDAL_COLORS[Math.min(idx, 2)] : "text-foreground"} ${entry.isCurrentUser ? "text-primary" : ""}`}>
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

function CategoryGrid({ boards }: { boards: CategoryBoards }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <LeaderboardList entries={boards.byWorkouts} />
      </section>

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
        <LeaderboardList entries={boards.byStreak} />
      </section>

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
        <LeaderboardList entries={boards.byVolume} />
      </section>

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
        <LeaderboardList entries={boards.byPR} />
      </section>
    </div>
  );
}

export default function LeaderboardTabs({ friends, global, hasFriends }: LeaderboardTabsProps) {
  const [tab, setTab] = useState<"friends" | "global">("global");

  return (
    <div className="flex flex-col gap-8">
      {/* Tab switcher */}
      <div className="flex gap-2 p-1 rounded-2xl bg-card/60 border border-border w-fit">
        <button
          onClick={() => setTab("global")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            tab === "global"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe size={15} />
          Global Top 10
        </button>
        <button
          onClick={() => setTab("friends")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            tab === "friends"
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={15} />
          Friends
          {!hasFriends && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold">
              0
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {tab === "global" && <CategoryGrid boards={global} />}

      {tab === "friends" && (
        hasFriends ? (
          <CategoryGrid boards={friends} />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-16 gap-6 backdrop-blur-sm text-center">
            <div className="h-20 w-20 rounded-full bg-yellow-400/10 flex items-center justify-center">
              <Trophy size={40} className="text-yellow-400/40" />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-foreground">No friends yet</p>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Invite friends to compete with your personal circle!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/settings"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20"
              >
                Get Invite Link
              </a>
              <a
                href="/friends"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card/60 px-8 py-3 text-base font-bold hover:bg-card hover:scale-[1.05] active:scale-[0.95] transition-all"
              >
                Social Circle
              </a>
            </div>
          </div>
        )
      )}
    </div>
  );
}
