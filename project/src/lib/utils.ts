import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: { code: string; message: string; details?: unknown }
) {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(error && { error }),
    timestamp: new Date().toISOString(),
  };
}
