"use client";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export default function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3">
      <label className="text-sm text-inherit font-medium">Filter by date:</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="From"
        />
        <span className="text-inherit text-sm">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="To"
        />
      </div>
    </div>
  );
}
