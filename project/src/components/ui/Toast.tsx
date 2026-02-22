"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast } from "@/hooks/useToast";

const typeStyles: Record<Toast["type"], string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-indigo-50 border-indigo-200 text-indigo-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm",
        "animate-in slide-in-from-right-full duration-300",
        "max-w-sm w-full",
        typeStyles[toast.type]
      )}
      role="alert"
    >
      {toast.emoji && (
        <span className="text-lg leading-none select-none shrink-0 mt-0.5">{toast.emoji}</span>
      )}
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-full p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
