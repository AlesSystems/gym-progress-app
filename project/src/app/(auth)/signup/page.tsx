import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import MagicLinkButton from "@/components/auth/MagicLinkButton";

export const metadata = { title: "Sign Up – Gym Progress" };

export default function SignupPage() {
  return (
    <div className="rounded-xl bg-card border border-border p-8 space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start tracking your gym progress
        </p>
      </div>

      <SignupForm />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" />
        <span>or sign up without password</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <MagicLinkButton />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
