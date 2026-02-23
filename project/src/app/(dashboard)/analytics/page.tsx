import { LineChart, BarChart, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-10 p-6 md:p-12 max-w-7xl w-full mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-lg font-medium">Deep dive into your performance and progress</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mock Chart Cards with Glassmorphism */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card/40 p-8 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/60">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Volume Load</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Weekly Total</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-sm font-medium text-muted-foreground/30 italic uppercase tracking-[0.2em] animate-pulse">
                Generating Charts...
              </div>
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card/40 p-8 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/60">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Estimated 1RM</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Strength Progress</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-sm font-medium text-muted-foreground/30 italic uppercase tracking-[0.2em] animate-pulse">
                Fetching Data...
              </div>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card/40 p-8 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-primary/30 hover:bg-card/60">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-green-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                <BarChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Workout Frequency</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Consistency Track</p>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-sm font-medium text-muted-foreground/30 italic uppercase tracking-[0.2em] animate-pulse">
                Analyzing Trends...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
