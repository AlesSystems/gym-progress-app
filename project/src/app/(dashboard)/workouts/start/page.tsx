import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

export default function StartWorkoutPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-2xl mx-auto">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-medium tracking-tight">New Session</h1>
      </header>

      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Play className="h-8 w-8 ml-1" />
          </div>
          <h2 className="text-xl font-medium">Ready to start?</h2>
          <p className="text-muted-foreground">
            This will create a new empty workout session.
          </p>
          <Button size="lg" className="w-full max-w-xs">
            Start Now
          </Button>
        </div>
      </div>
    </div>
  );
}
