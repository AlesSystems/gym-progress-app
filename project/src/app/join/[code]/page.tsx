import { db } from "@/lib/db";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;

  // Check if this is a user personal invite code
  const inviterUser = await db.user.findUnique({
    where: { inviteCode: code },
    select: { displayName: true, name: true },
  });

  // Check if it's an Invite table record
  let inviteValid = !!inviterUser;
  let inviterName: string | null = inviterUser?.displayName ?? inviterUser?.name ?? null;

  if (!inviterUser) {
    const invite = await db.invite.findUnique({ where: { code } });
    if (invite) {
      const now = new Date();
      inviteValid =
        (!invite.expiresAt || invite.expiresAt > now) &&
        (invite.maxUses === null || invite.currentUses < invite.maxUses);
      if (inviteValid) {
        const creator = await db.user.findUnique({
          where: { id: invite.createdBy },
          select: { displayName: true, name: true },
        });
        inviterName = creator?.displayName ?? creator?.name ?? null;
      }
    }
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center space-y-4">
          <div className="text-3xl">🚫</div>
          <h1 className="text-xl font-bold text-gray-900">Invalid Invite</h1>
          <p className="text-sm text-gray-500">
            This invite link is invalid or has expired.
          </p>
          <Link
            href="/signup"
            className="inline-block text-sm text-indigo-600 hover:underline"
          >
            Sign up without an invite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="text-3xl mb-3">🏋️</div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re invited!</h1>
          {inviterName ? (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{inviterName}</span> invited you
              to join Gym Progress
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              Create your account to get started
            </p>
          )}
        </div>

        <SignupForm defaultInviteCode={code} />

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
