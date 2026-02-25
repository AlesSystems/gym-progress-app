export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:space-y-8 md:p-8 animate-pulse">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-xl bg-secondary" />
          <div className="h-4 w-40 rounded-lg bg-secondary" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-9 w-32 rounded-full bg-secondary" />
          <div className="h-10 w-10 rounded-full bg-secondary" />
        </div>
      </div>

      {/* Hero */}
      <div className="h-56 md:h-64 rounded-3xl bg-secondary" />

      {/* Quick access grid */}
      <div className="space-y-4">
        <div className="h-6 w-28 rounded-lg bg-secondary" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-secondary" />
          ))}
        </div>
      </div>

      {/* Bottom two cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-56 rounded-2xl bg-secondary" />
        <div className="h-56 rounded-2xl bg-secondary" />
      </div>
    </div>
  );
}
