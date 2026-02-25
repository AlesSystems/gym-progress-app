export default function SessionsLoading() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-5xl w-full mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-9 w-52 rounded-xl bg-secondary" />
          <div className="h-5 w-40 rounded-lg bg-secondary" />
        </div>
        <div className="h-11 w-full md:w-44 rounded-2xl bg-secondary" />
      </div>

      {/* Session cards */}
      <div className="flex flex-col gap-3 md:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
