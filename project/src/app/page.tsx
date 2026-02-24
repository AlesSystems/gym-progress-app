import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dumbbell, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center space-y-8 bg-background">
      <div className="rounded-full bg-primary/10 p-6 ring-1 ring-primary/20 animate-pulse">
        <Dumbbell className="h-16 w-16 text-primary" strokeWidth={1.5} />
      </div>
      
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
          Ales GYM
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your workouts, visualize your progress, and crush your goals.
          Simple, professional, effective.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Button size="lg" className="w-full text-base h-12 rounded-xl" asChild>
          <Link href="/login">
            Login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="w-full text-base h-12 rounded-xl" asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
