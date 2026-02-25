import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import ConnectButton from "@/components/invite/ConnectButton";

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

  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session?.user;

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card/40 p-8 max-w-md w-full text-center space-y-4 backdrop-blur-md shadow-2xl">
          <div className="text-3xl">🚫</div>
          <h1 className="text-xl font-bold text-foreground">Invalid Invite</h1>
          <p className="text-sm text-muted-foreground">
            This invite link is invalid or has expired.
          </p>
          <Link
            href="/signup"
            className="inline-block text-sm text-primary hover:underline font-medium"
          >
            Sign up without an invite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10" />
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-border bg-card/40 p-8 max-w-md w-full space-y-6 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="text-center">
          <div className="text-4xl mb-3">🏋️</div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">You&apos;re invited!</h1>
          {inviterName ? (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-bold text-foreground">{inviterName}</span> invited you
              to join Ales GYM
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">
              Create your account to get started
            </p>
          )}
        </div>

        {isLoggedIn ? (
          <>
            <p className="text-sm text-muted-foreground text-center">
              You&apos;re already signed in. Connect with{" "}
              <span className="font-bold text-foreground">{inviterName ?? "this user"}</span> to join their leaderboard.
            </p>
            <ConnectButton code={code} />
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/leaderboard" className="text-primary font-bold hover:text-primary/80 transition-colors">
                Go to leaderboard
              </Link>
            </p>
          </>
        ) : (
          <>
            <SignupForm defaultInviteCode={code} />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={`/login?callbackUrl=/join/${code}`} className="text-primary font-black hover:text-primary/80 transition-colors underline decoration-primary/30 underline-offset-4">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
