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
      className="w-full h-10 rounded-xl border border-border bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
    />
  );
}
