import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import MagicLinkButton from "@/components/auth/MagicLinkButton";

export const metadata = { title: "Sign In – Gym Progress" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  return (
    <div className="rounded-xl bg-card border border-border p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
      </div>

      <LoginForm />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" />
        <span>or sign in without password</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <MagicLinkButton />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
