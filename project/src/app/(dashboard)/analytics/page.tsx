import { LineChart, BarChart, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your progress.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Chart Cards */}
        <div className="rounded-2xl border border-border bg-card p-6 h-64 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-5 w-5" />
            <span className="font-medium">Volume Load</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground/20">
            [Chart Placeholder]
          </div>
        </div>
        
        <div className="rounded-2xl border border-border bg-card p-6 h-64 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LineChart className="h-5 w-5" />
            <span className="font-medium">Estimated 1RM</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground/20">
            [Chart Placeholder]
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 h-64 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BarChart className="h-5 w-5" />
            <span className="font-medium">Workout Frequency</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground/20">
            [Chart Placeholder]
          </div>
        </div>
      </div>
    </div>
  );
}
