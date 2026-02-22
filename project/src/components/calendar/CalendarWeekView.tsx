"use client";

import DayCell from "./DayCell";
import { toLocalDateKey } from "./CalendarGrid";
import type { CalendarDayData } from "@/types/calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface CalendarWeekViewProps {
  weekStart: Date; // Monday of the week
  days: Record<string, CalendarDayData>;
  selectedDate: Date | null;
  onDayClick: (date: Date) => void;
}

export default function CalendarWeekView({ weekStart, days, selectedDate, onDayClick }: CalendarWeekViewProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    cells.push(d);
  }

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((wd, i) => (
          <div key={wd} className="text-center">
            <span className="text-xs font-semibold text-gray-400">{wd}</span>
            <p className="text-xs text-gray-400 mt-0.5">{cells[i].getDate()}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date) => {
          const key = toLocalDateKey(date);
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate ? toLocalDateKey(selectedDate) === key : false;

          return (
            <DayCell
              key={key}
              date={date}
              dayData={days[key]}
              isToday={isToday}
              isCurrentMonth={true}
              isSelected={isSelected}
              onClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
