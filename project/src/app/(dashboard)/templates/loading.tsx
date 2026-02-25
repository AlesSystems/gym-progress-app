export default function TemplatesLoading() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-7xl w-full mx-auto animate-pulse">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="h-9 w-56 rounded-xl bg-secondary" />
          <div className="h-5 w-52 rounded-lg bg-secondary" />
        </div>
        <div className="h-11 w-full md:w-48 rounded-2xl bg-secondary" />
      </div>

      {/* Tabs */}
      <div className="h-12 w-full md:w-64 rounded-2xl bg-secondary" />

      {/* Template cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
