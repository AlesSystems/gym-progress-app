import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {friends.length === 0
              ? "You have no connections yet."
              : `You have ${friends.length} friend${friends.length !== 1 ? "s" : ""} connected via invites`}
          </p>
        </div>

        {friends.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              Connect with friends by sharing your invite link.
            </p>
            <Link
              href="/invites"
              className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Go to Invites
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((f) => (
              <div
                key={f.userId}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-gray-900">{f.displayName}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    f.relationship === "invited_you"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  {f.relationship === "invited_you" ? "Invited you" : "You invited"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
