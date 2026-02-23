"use client";

import DayCell from "./DayCell";
import type { CalendarDayData } from "@/types/calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed
  days: Record<string, CalendarDayData>;
  selectedDate: Date | null;
  onDayClick: (date: Date) => void;
}

function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  // Monday-based week: 0=Mon ... 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    cells.push(d);
  }
  return cells;
}

export default function CalendarGrid({ year, month, days, selectedDate, onDayClick }: CalendarGridProps) {
  const cells = getMonthGrid(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-center text-xs font-semibold text-muted-foreground py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date) => {
          const key = toLocalDateKey(date);
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate
            ? toLocalDateKey(selectedDate) === key
            : false;

          return (
            <DayCell
              key={key}
              date={date}
              dayData={days[key]}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              isSelected={isSelected}
              onClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
