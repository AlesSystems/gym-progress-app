"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Clock, Dumbbell, BarChart2 } from "lucide-react";

export interface SessionCardProps {
  id: string;
  name: string | null;
  status: string;
  startedAt: string | Date;
  completedAt?: string | Date | null;
  durationMinutes?: number | null;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  totalVolumeUnit?: string | null;
}

export default function SessionCard({
  id,
  name,
  startedAt,
  durationMinutes,
  exerciseCount,
  totalSets,
  totalVolume,
  totalVolumeUnit,
}: SessionCardProps) {
  return (
    <Link
      href={`/sessions/${id}`}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div>
        <p className="text-xs text-gray-500">{formatDate(startedAt)}</p>
        <h3 className="mt-0.5 text-sm font-semibold text-gray-900 truncate">{name ?? "Workout"}</h3>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        {durationMinutes !== null && durationMinutes !== undefined && (
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {durationMinutes} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <Dumbbell size={12} />
          {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <BarChart2 size={12} />
          {totalSets} sets
        </span>
        {totalVolume > 0 && (
          <span className="ml-auto font-medium text-gray-700">
            {totalVolume.toLocaleString()} {totalVolumeUnit ?? "kg"}
          </span>
        )}
      </div>
    </Link>
  );
}
