"use client";

interface RepSchemeInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RepSchemeInput({ value, onChange }: RepSchemeInputProps) {
  return (
    <input
      type="text"
      value={value}
      maxLength={10}
      placeholder='e.g. 8-12'
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
    />
  );
}
