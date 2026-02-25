export default function LeaderboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-3xl w-full mx-auto animate-pulse">
      <div className="h-9 w-40 rounded-xl bg-secondary" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}
