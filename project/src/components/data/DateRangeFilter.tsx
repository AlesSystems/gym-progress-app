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
      <label className="text-sm text-gray-600 font-medium">Filter by date:</label>
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="From"
        />
        <span className="text-gray-400 text-sm">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="To"
        />
      </div>
    </div>
  );
}
