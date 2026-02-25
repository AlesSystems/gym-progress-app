export default function ExercisesLoading() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-7xl w-full mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-9 w-52 rounded-xl bg-secondary" />
          <div className="h-5 w-48 rounded-lg bg-secondary" />
        </div>
        <div className="h-11 w-full md:w-44 rounded-2xl bg-secondary" />
      </div>

      {/* Filter bar */}
      <div className="h-14 rounded-2xl bg-secondary" />

      {/* Exercise grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
