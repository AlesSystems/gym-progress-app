"use client";

import { cn } from "@/lib/utils";

interface StatusDotProps {
  variant: "completed" | "planned" | "missed";
  className?: string;
}

const variantStyles: Record<StatusDotProps["variant"], string> = {
  completed: "bg-emerald-500",
  planned: "border-2 border-primary bg-transparent",
  missed: "bg-muted-foreground",
};

export default function StatusDot({ variant, className }: StatusDotProps) {
  return (
    <span
      className={cn("inline-block w-1.5 h-1.5 rounded-full", variantStyles[variant], className)}
      aria-hidden="true"
    />
  );
}
