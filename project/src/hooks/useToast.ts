"use client";

import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  emoji?: string;
}

let externalAdd: ((toast: Omit<Toast, "id">) => void) | null = null;

export function useToast() {
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    if (externalAdd) externalAdd(toast);
  }, []);

  const toast = {
    success: (message: string, emoji = "✅") => addToast({ message, type: "success", emoji }),
    error: (message: string, emoji = "❌") => addToast({ message, type: "error", emoji }),
    info: (message: string, emoji = "💡") => addToast({ message, type: "info", emoji }),
    warning: (message: string, emoji = "⚠️") => addToast({ message, type: "warning", emoji }),
  };

  return toast;
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const add = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Register global adder
  externalAdd = add;

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, remove };
}
