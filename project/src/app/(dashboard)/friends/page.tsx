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
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Friends</h1>
      </div>

      {friends.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-border bg-card p-12 gap-3">
          <Users size={32} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No connections yet.</p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Get invite link
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {friends.map((f) => (
            <div
              key={f.userId}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-foreground">
                  {f.displayName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{f.displayName}</span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  f.relationship === "invited_you"
                    ? "bg-accent/10 text-accent-foreground border-accent/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {f.relationship === "invited_you" ? "Invited you" : "You invited"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
