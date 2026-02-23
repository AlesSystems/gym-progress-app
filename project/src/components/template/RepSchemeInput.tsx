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
      className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
    />
  );
}
