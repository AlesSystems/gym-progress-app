"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { EXERCISE_TYPES, MOVEMENT_CATEGORIES } from "@/lib/validations/exercise";

export default function ExerciseFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const current = (key: string) => searchParams.get(key) ?? "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <input
        type="search"
        placeholder="Search exercises…"
        defaultValue={current("search")}
        onChange={(e) => update("search", e.target.value)}
        className="h-9 rounded-lg border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-52"
      />

      {/* Type */}
      <select
        value={current("type")}
        onChange={(e) => update("type", e.target.value)}
        className="h-9 rounded-lg border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All types</option>
        {EXERCISE_TYPES.map((t) => (
          <option key={t} value={t} className="capitalize">
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </option>
        ))}
      </select>

      {/* Category */}
      <select
        value={current("category")}
        onChange={(e) => update("category", e.target.value)}
        className="h-9 rounded-lg border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All categories</option>
        {MOVEMENT_CATEGORIES.map((c) => (
          <option key={c} value={c} className="capitalize">
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </option>
        ))}
      </select>

      {/* Source */}
      <select
        value={current("source")}
        onChange={(e) => update("source", e.target.value)}
        className="h-9 rounded-lg border border-gray-300 px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">System + Custom</option>
        <option value="system">System only</option>
        <option value="custom">Custom only</option>
      </select>
    </div>
  );
}
