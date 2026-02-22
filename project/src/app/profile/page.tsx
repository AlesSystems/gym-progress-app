import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileEditor from "@/components/profile/ProfileEditor";
import MaxLiftsList from "@/components/profile/MaxLiftsList";
import InviteGenerator from "@/components/profile/InviteGenerator";

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
      include: { exercise: { select: { name: true, category: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user.displayName ?? user.name ?? "Your Profile"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          {!user.emailVerified && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              Email not verified
            </span>
          )}
        </div>

        {/* Profile editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Edit Profile</h2>
          <ProfileEditor
            initialValues={{
              name: user.name,
              displayName: user.displayName,
              unitPreference: user.unitPreference,
            }}
          />
        </div>

        {/* Invite section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Invite Friends</h2>
          <p className="text-sm text-gray-500 mb-4">
            Share your invite code or link to bring friends to the team.
          </p>
          <InviteGenerator
            personalInviteCode={user.inviteCode}
            appUrl={appUrl}
          />
        </div>

        {/* Max lifts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Personal Records</h2>
          <MaxLiftsList
            maxLifts={maxLifts.map((l) => ({
              ...l,
              achievedAt: l.achievedAt.toISOString(),
            }))}
            unitPreference={user.unitPreference}
          />
        </div>

        {/* Account info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">Member since</dt>
            <dd className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</dd>
            {user.lastLoginAt && (
              <>
                <dt className="text-gray-500">Last login</dt>
                <dd className="text-gray-900">{new Date(user.lastLoginAt).toLocaleDateString()}</dd>
              </>
            )}
            <dt className="text-gray-500">Email verified</dt>
            <dd className={user.emailVerified ? "text-green-600" : "text-amber-600"}>
              {user.emailVerified ? "Yes" : "No"}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
