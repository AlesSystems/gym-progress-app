export default function FriendsLoading() {
  return (
    <div className="flex flex-col gap-10 p-6 md:p-12 max-w-4xl w-full mx-auto animate-pulse">
      {/* Header */}
      <header className="px-2 space-y-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-secondary" />
          <div className="h-10 w-44 rounded-lg bg-secondary" />
        </div>
        <div className="h-5 w-56 rounded bg-secondary mt-2" />
      </header>

      {/* Invite code input */}
      <div className="h-12 rounded-xl bg-secondary" />

      {/* Friend cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-[2rem] border border-border bg-card/30 p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-secondary" />
              <div>
                <div className="h-5 w-28 rounded bg-secondary" />
                <div className="h-3 w-20 rounded bg-secondary mt-2" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}
