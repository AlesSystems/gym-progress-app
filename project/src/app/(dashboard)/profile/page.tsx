import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileEditor from "@/components/profile/ProfileEditor";
import MaxLiftsList from "@/components/profile/MaxLiftsList";
import InviteGenerator from "@/components/profile/InviteGenerator";
import LogoutButton from "@/components/profile/LogoutButton";

export const metadata = { title: "Profile – Gym Progress" };

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const [user, maxLifts] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        emailVerified: true,
        unitPreference: true,
        inviteCode: true,
        invitedBy: true,
        lastLoginAt: true,
        createdAt: true,
      },
    }),
    db.maxLift.findMany({
      where: { userId },
      include: { exercise: { select: { name: true, movementCategory: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-2xl w-full pb-28 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {user.displayName ?? user.name ?? "Profile"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
        {!user.emailVerified && (
          <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1">
            Email unverified
          </span>
        )}
      </div>

      {/* Profile editor */}
      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Edit Profile</p>
        <ProfileEditor
          initialValues={{
            name: user.name,
            displayName: user.displayName,
            unitPreference: user.unitPreference,
          }}
        />
      </div>

      {/* Invite section */}
      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Invite Friends</p>
        <InviteGenerator
          personalInviteCode={user.inviteCode}
          appUrl={appUrl}
        />
      </div>

      {/* Max lifts */}
      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Personal Records</p>
        <MaxLiftsList
          maxLifts={maxLifts.map((l) => ({
            ...l,
            achievedAt: l.achievedAt.toISOString(),
          }))}
          unitPreference={user.unitPreference}
        />
      </div>

      {/* Account info */}
      <div className="rounded-xl bg-card border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Account</p>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Member since</dt>
          <dd className="text-foreground">{new Date(user.createdAt).toLocaleDateString()}</dd>
          {user.lastLoginAt && (
            <>
              <dt className="text-muted-foreground">Last login</dt>
              <dd className="text-foreground">{new Date(user.lastLoginAt).toLocaleDateString()}</dd>
            </>
          )}
          <dt className="text-muted-foreground">Email verified</dt>
          <dd className={user.emailVerified ? "text-green-400" : "text-yellow-400"}>
            {user.emailVerified ? "Yes" : "No"}
          </dd>
        </dl>
      </div>

      {/* Sign out */}
      <div className="rounded-xl bg-card border border-border p-4">
        <LogoutButton />
      </div>
    </div>
  );
}
