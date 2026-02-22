"use client";

interface TempoInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TempoInput({ value, onChange }: TempoInputProps) {
  return (
    <input
      type="text"
      value={value}
      maxLength={20}
      placeholder='e.g. 3-1-2-0'
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
    />
  );
}
