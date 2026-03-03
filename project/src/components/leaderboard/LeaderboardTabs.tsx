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

const MEDAL_COLORS = ["text-indigo-500", "text-slate-400", "text-amber-700"];
const MEDAL_BG = ["bg-indigo-500/10", "bg-slate-500/10", "bg-amber-700/10"];
const MEDAL_BORDER = ["border-indigo-500/20", "border-slate-500/20", "border-amber-700/20"];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} className="text-indigo-500 shrink-0" strokeWidth={2.5} />;
  if (rank === 2) return <Medal size={16} className="text-slate-400 shrink-0" strokeWidth={2.5} />;
  if (rank === 3) return <Medal size={16} className="text-amber-700 shrink-0" strokeWidth={2.5} />;
  return (
    <span className="text-[10px] font-black text-muted-foreground/40 w-[16px] text-center shrink-0">
      {rank}
    </span>
  );
}

function LeaderboardList({ entries }: { entries: RankedEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center opacity-50">
        <Trophy size={32} className="text-muted-foreground/30" strokeWidth={1.5} />
        <p className="text-xs font-medium text-muted-foreground">No data recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {entries.map((entry) => {
        const idx = entry.rank - 1;
        const isPodium = entry.rank <= 3;
        return (
          <div
            key={entry.userId}
            className={`relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-300 ${
              entry.isCurrentUser
                ? "border-primary/30 bg-primary/5 ring-1 ring-primary/10"
                : isPodium
                ? `${MEDAL_BORDER[idx]} ${MEDAL_BG[idx]} backdrop-blur-sm`
                : "border-border/50 bg-card/40 hover:bg-card/60 hover:border-border"
            }`}
          >
            <div className="w-5 flex justify-center">
              <RankBadge rank={entry.rank} />
            </div>
            <div
              className={`h-9 w-9 rounded-md flex items-center justify-center text-xs font-black shrink-0 transition-all overflow-hidden border ${
                entry.isCurrentUser
                  ? "bg-primary/20 text-primary border-primary/20"
                  : isPodium
                  ? `${MEDAL_BG[idx]} ${MEDAL_COLORS[idx]} ${MEDAL_BORDER[idx]}`
                  : "bg-secondary/50 text-muted-foreground border-border/40"
              }`}
            >
              {entry.image ? (
                <Image src={entry.image} alt={entry.displayName} width={36} height={36} className="object-cover w-full h-full" />
              ) : (
                entry.displayName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm truncate ${entry.isCurrentUser ? "text-primary" : "text-foreground"}`}>
                {entry.displayName}
                {entry.isCurrentUser && (
                  <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-primary/50 bg-primary/10 px-1.5 py-0.5 rounded">You</span>
                )}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold tabular-nums ${isPodium ? MEDAL_COLORS[Math.min(idx, 2)] : "text-foreground"} ${entry.isCurrentUser ? "text-primary" : ""}`}>
                {entry.value.toLocaleString()}
              </p>
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <Trophy size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground leading-tight tracking-tight">Total Workouts</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Most sessions completed</p>
          </div>
        </div>
        <LeaderboardList entries={boards.byWorkouts} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-md bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
            <Flame size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground leading-tight tracking-tight">Current Streak</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Consecutive training days</p>
          </div>
        </div>
        <LeaderboardList entries={boards.byStreak} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/10">
            <Dumbbell size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground leading-tight tracking-tight">Total Volume</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Weight × reps accumulated</p>
          </div>
        </div>
        <LeaderboardList entries={boards.byVolume} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-1">
          <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
            <Medal size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-bold text-base text-foreground leading-tight tracking-tight">Best Single Lift</h2>
            <p className="text-[11px] text-muted-foreground font-medium">Heaviest record achieved</p>
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
      <div className="flex gap-1.5 p-1 rounded-lg bg-secondary/30 border border-border/40 w-fit backdrop-blur-sm">
        <button
          onClick={() => setTab("global")}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
            tab === "global"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe size={13} strokeWidth={2.5} />
          Global Top 10
        </button>
        <button
          onClick={() => setTab("friends")}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
            tab === "friends"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users size={13} strokeWidth={2.5} />
          Friends
          {!hasFriends && (
            <span className="text-[9px] bg-muted text-muted-foreground/60 px-1.5 py-0.5 rounded font-black">
              0
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {tab === "global" && <CategoryGrid boards={global} />}

        {tab === "friends" && (
          hasFriends ? (
            <CategoryGrid boards={friends} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/10 p-16 gap-6 backdrop-blur-[2px] text-center animate-in fade-in duration-500">
              <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                <Users size={32} className="text-primary/30" strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <p className="text-lg font-bold text-foreground tracking-tight">No training partners</p>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto font-medium">
                  Connect with friends to see how you compare in your circle.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <a
                  href="/settings"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/10"
                >
                  Share Invite Link
                </a>
                <a
                  href="/friends"
                  className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-card/40 px-6 py-2.5 text-xs font-bold hover:bg-card active:scale-95 transition-all"
                >
                  Find Friends
                </a>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
