"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import CalendarGrid, { toLocalDateKey } from "@/components/calendar/CalendarGrid";
import CalendarWeekView from "@/components/calendar/CalendarWeekView";
import DayDetailSheet from "@/components/calendar/DayDetailSheet";
import ScheduleForm from "@/components/calendar/ScheduleForm";
import type { CalendarDayData, CalendarResponse, CalendarScheduledWorkout } from "@/types/calendar";

type ViewMode = "month" | "week";

function getMonthRange(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0);
  return { from: toLocalDateKey(from), to: toLocalDateKey(to) };
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekRange(weekStart: Date) {
  const to = new Date(weekStart);
  to.setDate(weekStart.getDate() + 6);
  return { from: toLocalDateKey(weekStart), to: toLocalDateKey(to) };
}

export default function CalendarClient() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [weekStart, setWeekStart] = useState<Date>(getMondayOfWeek(today));

  const [calendarData, setCalendarData] = useState<Record<string, CalendarDayData>>({});
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [scheduleFormDate, setScheduleFormDate] = useState<Date | null>(null);
  const [editEntry, setEditEntry] = useState<CalendarScheduledWorkout | null>(null);

  const fetchCalendar = useCallback(async (from: string, to: string) => {
    try {
      const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
      const json: { success: boolean; data: CalendarResponse } = await res.json();
      if (json.success) {
        setCalendarData((prev) => ({ ...prev, ...json.data.days }));
      }
    } catch {
      // silently ignore
    }
  }, []);

  // Fetch current range + adjacent range on view/navigation change
  useEffect(() => {
    setLoading(true);
    if (viewMode === "month") {
      const range = getMonthRange(currentYear, currentMonth);
      fetchCalendar(range.from, range.to).finally(() => setLoading(false));

      // Pre-fetch adjacent months
      const prevD = new Date(currentYear, currentMonth - 1, 1);
      const nextD = new Date(currentYear, currentMonth + 1, 1);
      fetchCalendar(
        toLocalDateKey(new Date(prevD.getFullYear(), prevD.getMonth(), 1)),
        toLocalDateKey(new Date(prevD.getFullYear(), prevD.getMonth() + 1, 0))
      );
      fetchCalendar(
        toLocalDateKey(new Date(nextD.getFullYear(), nextD.getMonth(), 1)),
        toLocalDateKey(new Date(nextD.getFullYear(), nextD.getMonth() + 1, 0))
      );
    } else {
      const range = getWeekRange(weekStart);
      fetchCalendar(range.from, range.to).finally(() => setLoading(false));

      // Pre-fetch adjacent weeks
      const prevWeek = new Date(weekStart);
      prevWeek.setDate(weekStart.getDate() - 7);
      const nextWeek = new Date(weekStart);
      nextWeek.setDate(weekStart.getDate() + 7);
      fetchCalendar(toLocalDateKey(prevWeek), toLocalDateKey(new Date(prevWeek.getTime() + 6 * 86400000)));
      fetchCalendar(toLocalDateKey(nextWeek), toLocalDateKey(new Date(nextWeek.getTime() + 6 * 86400000)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentYear, currentMonth, weekStart]);

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setWeekStart(getMondayOfWeek(today));
  };

  const navigatePrev = () => {
    if (viewMode === "month") {
      const d = new Date(currentYear, currentMonth - 1, 1);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      const prev = new Date(weekStart);
      prev.setDate(weekStart.getDate() - 7);
      setWeekStart(prev);
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      const d = new Date(currentYear, currentMonth + 1, 1);
      setCurrentYear(d.getFullYear());
      setCurrentMonth(d.getMonth());
    } else {
      const next = new Date(weekStart);
      next.setDate(weekStart.getDate() + 7);
      setWeekStart(next);
    }
  };

  const headingLabel = viewMode === "month"
    ? new Date(currentYear, currentMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : (() => {
        const end = new Date(weekStart);
        end.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
      })();

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRefresh = () => {
    // Re-fetch current range
    setCalendarData((prev) => {
      const newData = { ...prev };
      if (viewMode === "month") {
        const range = getMonthRange(currentYear, currentMonth);
        // Remove stale data for current range so it re-fetches
        const from = new Date(range.from);
        const to = new Date(range.to);
        for (const key of Object.keys(newData)) {
          const d = new Date(key);
          if (d >= from && d <= to) delete newData[key];
        }
      }
      return newData;
    });
    const range = viewMode === "month"
      ? getMonthRange(currentYear, currentMonth)
      : getWeekRange(weekStart);
    fetchCalendar(range.from, range.to);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl w-full">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
          <Calendar size={18} className="text-accent-foreground" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Calendar</h1>
      </div>

      {/* Controls */}
      <div className="rounded-xl bg-card border border-border p-4">
        {/* View toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex rounded-lg bg-secondary p-0.5">
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === "month"
                  ? "bg-card shadow text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === "week"
                  ? "bg-card shadow text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={goToToday}
            className="text-xs font-semibold text-primary hover:opacity-80 transition-opacity px-3 py-1.5 rounded-lg hover:bg-primary/10"
          >
            Today
          </button>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={navigatePrev}
            aria-label="Previous"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-sm font-semibold text-foreground">{headingLabel}</h2>
          <button
            onClick={navigateNext}
            aria-label="Next"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 pl-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border-2 border-primary/60" />
            Planned
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
            Missed
          </span>
        </div>

        {loading && (
          <div className="flex justify-center py-2">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Calendar grid */}
        {viewMode === "month" ? (
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            days={calendarData}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        ) : (
          <CalendarWeekView
            weekStart={weekStart}
            days={calendarData}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tap any day to view details or schedule a workout
      </p>

      {/* Day detail sheet */}
      {selectedDate && (
        <DayDetailSheet
          date={selectedDate}
          dayData={calendarData[toLocalDateKey(selectedDate)]}
          onClose={() => setSelectedDate(null)}
          onAddPlan={(date) => {
            setScheduleFormDate(date);
            setEditEntry(null);
            setSelectedDate(null);
          }}
          onEditEntry={(entry) => {
            setEditEntry(entry);
            setScheduleFormDate(selectedDate);
            setSelectedDate(null);
          }}
          onRefresh={handleRefresh}
        />
      )}

      {/* Schedule form */}
      {scheduleFormDate && (
        <ScheduleForm
          initialDate={scheduleFormDate}
          editEntry={editEntry}
          onClose={() => {
            setScheduleFormDate(null);
            setEditEntry(null);
          }}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
