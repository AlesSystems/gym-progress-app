export default function CalendarLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-4xl w-full mx-auto animate-pulse">
      <div className="h-9 w-40 rounded-xl bg-secondary" />
      <div className="h-96 rounded-2xl bg-secondary" />
      <div className="h-48 rounded-2xl bg-secondary" />
    </div>
  );
}
