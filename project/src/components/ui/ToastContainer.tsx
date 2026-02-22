"use client";

import { useToastState } from "@/hooks/useToast";
import { ToastItem } from "./Toast";

export default function ToastContainer() {
  const { toasts, remove } = useToastState();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  );
}
