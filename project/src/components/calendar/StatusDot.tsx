"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  variant: "completed" | "planned" | "missed";
  className?: string;
}

const variantStyles: Record<StatusDotProps["variant"], string> = {
  completed: "bg-indigo-500",
  planned: "border-2 border-indigo-400 bg-transparent",
  missed: "bg-gray-300",
};

export default function StatusDot({ variant, className }: StatusDotProps) {
  return (
    <span
      className={cn("inline-block w-1.5 h-1.5 rounded-full", variantStyles[variant], className)}
      aria-hidden="true"
    />
  );
}
