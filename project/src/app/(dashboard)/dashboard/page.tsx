import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  History,
  LayoutList,
  LineChart,
  Settings,
  User,
  Zap,
  Calendar,
  Trophy,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - in a real app, this would come from your API/database
  const userName = "Esmer"; // Replace with actual user name
  const activeStreak = 5;
  const lastWorkout = "Upper Body Power";
  const lastWorkoutDate = "Yesterday";

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 md:p-8">
      {/* Header Section */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight text-foreground">
            Good morning, {userName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to crush your goals today?
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2 text-sm font-medium text-secondary-foreground ring-1 ring-border/50">
            <Zap className="h-4 w-4 text-orange-500 fill-orange-500" />
            <span>{activeStreak} Day Streak</span>
          </div>
          <Link href="/profile">
            <div className="h-10 w-10 rounded-full bg-secondary ring-1 ring-border flex items-center justify-center hover:ring-primary/50 transition-all">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        </div>
      </header>

      {/* Hero / Quick Action Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background p-1 ring-1 ring-border/50">
        <div className="relative z-10 flex flex-col items-center justify-center gap-6 rounded-[22px] bg-background/40 p-8 text-center backdrop-blur-sm md:p-12">
          <div className="rounded-full bg-primary/10 p-4 ring-1 ring-primary/20">
            <Dumbbell className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Start Workout
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Pick up where you left off or start a fresh session.
            </p>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3 sm:flex-row">
            <Button size="lg" className="w-full text-base h-12 rounded-xl" asChild>
              <Link href="/workouts/start">Empty Session</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full text-base h-12 rounded-xl bg-background/50 backdrop-blur-md hover:bg-background/80"
              asChild
            >
              <Link href="/templates">From Template</Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </section>

      {/* Core Features Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Quick Access</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Templates"
            subtitle="Manage your routines"
            icon={LayoutList}
            href="/templates"
            accentColor="text-blue-500"
          />
          <DashboardCard
            title="History"
            subtitle="View past sessions"
            icon={History}
            href="/sessions"
            accentColor="text-green-500"
          />
          <DashboardCard
            title="Exercises"
            subtitle="Browse library"
            icon={Dumbbell}
            href="/exercises"
            accentColor="text-purple-500"
          />
          <DashboardCard
            title="Analytics"
            subtitle="Track your progress"
            icon={LineChart}
            href="/analytics"
            accentColor="text-orange-500"
          />
        </div>
      </section>

      {/* Secondary Grid / Info */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity Mini-List */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </h3>
            <Link href="/sessions" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {/* Mock Item 1 */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{lastWorkout}</p>
                  <p className="text-xs text-muted-foreground">{lastWorkoutDate}</p>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                45 min
              </div>
            </div>
            {/* Mock Item 2 */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Leg Day Hypertrophy</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
              <div className="text-xs font-medium text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                62 min
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Goals */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4 text-muted-foreground" />
              Weekly Volume
            </h3>
          </div>
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {/* Mock Bars */}
            {[40, 70, 30, 85, 50, 20, 60].map((h, i) => (
              <div key={i} className="w-full bg-secondary rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 w-full bg-primary/80 rounded-t-sm transition-all hover:bg-primary"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground px-1">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>
      </section>
    </div>
  );
}
