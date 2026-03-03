export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl w-full mx-auto animate-pulse">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-secondary" />
          <div className="h-9 w-36 rounded-lg bg-secondary" />
        </div>
        <div className="h-4 w-56 rounded bg-secondary ml-[52px] mt-1" />
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="h-9 w-9 rounded-xl bg-secondary" />
            <div className="h-7 w-20 rounded bg-secondary" />
            <div className="h-3 w-24 rounded bg-secondary" />
          </div>
        ))}
      </div>

      {/* Chart row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-secondary" />
              <div>
                <div className="h-4 w-28 rounded bg-secondary" />
                <div className="h-3 w-36 rounded bg-secondary mt-1" />
              </div>
            </div>
            <div className="h-[200px] rounded-xl bg-secondary/50" />
          </div>
        ))}
      </div>

      {/* Chart row 2 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-secondary" />
              <div>
                <div className="h-4 w-28 rounded bg-secondary" />
                <div className="h-3 w-36 rounded bg-secondary mt-1" />
              </div>
            </div>
            <div className="h-[200px] rounded-xl bg-secondary/50" />
          </div>
        ))}
      </div>

      {/* Chart row 3 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-3xl border border-border bg-card/60 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-secondary" />
              <div>
                <div className="h-4 w-28 rounded bg-secondary" />
                <div className="h-3 w-36 rounded bg-secondary mt-1" />
              </div>
            </div>
            <div className="h-[200px] rounded-xl bg-secondary/50" />
          </div>
        ))}
      </div>
    </div>
  );
}
