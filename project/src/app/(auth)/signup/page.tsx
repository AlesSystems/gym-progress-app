import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import MagicLinkButton from "@/components/auth/MagicLinkButton";

export const metadata = { title: "Sign Up – Gym Progress" };

export default function SignupPage() {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/40 p-10 md:p-12 backdrop-blur-md shadow-2xl space-y-10">
      {/* Decorative inner element */}
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Join the Club</h1>
        <p className="text-muted-foreground font-medium text-lg">Start tracking your evolution</p>
      </div>

      <div className="relative z-10">
        <SignupForm />
      </div>

      <div className="flex items-center gap-4 px-2">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">Rapid Access</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="space-y-6">
        <MagicLinkButton />

        <div className="text-center pt-4">
          <p className="text-sm font-medium text-muted-foreground">
            Already a member?{" "}
            <Link href="/login" className="text-foreground font-black hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
