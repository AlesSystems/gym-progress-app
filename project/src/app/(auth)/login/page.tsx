import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import MagicLinkButton from "@/components/auth/MagicLinkButton";

export const metadata = { title: "Sign In – Ales GYM" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-border bg-card/40 p-6 md:p-12 backdrop-blur-md shadow-2xl space-y-8 md:space-y-10">
      {/* Decorative inner element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

      <div className="text-center space-y-1 md:space-y-2">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Welcome Back</h1>
        <p className="text-muted-foreground font-medium text-base md:text-lg">Continue your fitness journey</p>
      </div>

      <div className="relative z-10">
        <LoginForm />
      </div>

      <div className="flex items-center gap-4 px-2">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 whitespace-nowrap">Secure Access</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      <div className="space-y-6">
        <MagicLinkButton />

        <div className="flex flex-col gap-4 text-center">
          <Link href="/forgot-password" title="Reset your password" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
            Recovery Access →
          </Link>
          
          <div className="h-px bg-border/30 w-1/2 mx-auto" />
          
          <p className="text-sm font-medium text-muted-foreground">
            New here?{" "}
            <Link href="/signup" className="text-foreground font-black hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
