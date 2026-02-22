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

// Prisma Decimal fields serialize to strings in JSON; convert them to numbers.
export function serializeSet<T extends { weight?: unknown; rpe?: unknown }>(set: T): T {
  return {
    ...set,
    weight: set.weight != null ? Number(set.weight) : null,
    rpe: set.rpe != null ? Number(set.rpe) : null,
  };
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
