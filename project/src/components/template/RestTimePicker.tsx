"use client";

const PRESETS = [
  { label: "–", value: null },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "4 min", value: 240 },
];

interface RestTimePickerProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function RestTimePicker({ value, onChange }: RestTimePickerProps) {
  const isCustom = value !== null && !PRESETS.some((p) => p.value === value);

  return (
    <div className="flex gap-1">
      <select
        value={isCustom ? "custom" : String(value)}
        onChange={(e) => {
          if (e.target.value === "custom") return;
          onChange(e.target.value === "null" ? null : Number(e.target.value));
        }}
        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
      >
        {PRESETS.map((p) => (
          <option key={String(p.value)} value={String(p.value)}>
            {p.label}
          </option>
        ))}
        {isCustom && <option value="custom">{value}s</option>}
      </select>
    </div>
  );
}
