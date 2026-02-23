import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Users } from "lucide-react";

export const metadata = { title: "Friends – Gym Progress" };

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const currentUser = await db.user.findUnique({
    where: { id: userId },
    select: { invitedBy: true },
  });

  const friends: { userId: string; displayName: string; relationship: "invited_you" | "you_invited" }[] = [];

  if (currentUser?.invitedBy) {
    const inviter = await db.user.findUnique({
      where: { id: currentUser.invitedBy },
      select: { id: true, displayName: true, name: true },
    });
    if (inviter) {
      friends.push({
        userId: inviter.id,
        displayName: inviter.displayName ?? inviter.name ?? "Unknown",
        relationship: "invited_you",
      });
    }
  }

  const invitees = await db.user.findMany({
    where: { invitedBy: userId },
    select: { id: true, displayName: true, name: true },
  });

  for (const inv of invitees) {
    friends.push({
      userId: inv.id,
      displayName: inv.displayName ?? inv.name ?? "Unknown",
      relationship: "you_invited",
    });
  }

  return (
    <div className="flex flex-col gap-10 p-6 md:p-12 max-w-4xl w-full mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5">
              <Users size={28} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Social Circle</h1>
          </div>
          <p className="text-muted-foreground text-lg font-medium">Your network of training partners</p>
        </div>
      </header>

      {friends.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-border bg-card/20 p-20 gap-8 backdrop-blur-sm text-center">
          <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/30">
            <Users size={40} />
          </div>
          <div className="space-y-3">
            <p className="text-xl font-bold text-foreground">No connections yet</p>
            <p className="text-muted-foreground italic max-w-xs mx-auto">Everything is better with friends. Invite someone to start sharing routines!</p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20"
          >
            Get Invite Link
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {friends.map((f) => (
            <div
              key={f.userId}
              className="group relative flex items-center justify-between rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/60"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-lg font-black text-muted-foreground group-hover:from-primary/20 group-hover:to-primary/10 group-hover:text-primary transition-all duration-500 shadow-inner">
                  {f.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{f.displayName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${f.relationship === "invited_you" ? "bg-accent" : "bg-primary"}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {f.relationship === "invited_you" ? "Invited You" : "You Invited"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] border ${
                f.relationship === "invited_you"
                  ? "bg-accent/10 text-accent-foreground border-accent/20"
                  : "bg-primary/10 text-primary border-primary/20"
              }`}>
                Connected
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
