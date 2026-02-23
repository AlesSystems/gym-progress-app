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
    <div className="flex flex-col gap-6 md:gap-10 p-4 md:p-12 max-w-7xl w-full mx-auto pb-24 md:pb-12">
      {/* Page header with glassmorphism */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5 shrink-0">
              <Calendar className="h-[22px] w-[22px] md:h-7 md:w-7" />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">Training Calendar</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">Plan and track your workout consistency</p>
        </div>
      </header>

      {/* Main Calendar Container with Glassmorphism */}
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md shadow-2xl p-4 md:p-8 transition-all duration-300">
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-border/50">
          {/* View Toggle */}
          <div className="flex p-1 rounded-2xl bg-secondary/30 backdrop-blur-md border border-border/50 w-full lg:w-fit">
            <button
              onClick={() => setViewMode("month")}
              className={`flex-1 lg:flex-none px-4 md:px-6 py-2 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                viewMode === "month"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`flex-1 lg:flex-none px-4 md:px-6 py-2 text-[10px] md:text-sm font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                viewMode === "week"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Week
            </button>
          </div>

          {/* Navigation with Heading */}
          <div className="flex items-center justify-between lg:justify-end gap-4 md:gap-6 w-full lg:w-auto">
            <button
              onClick={navigatePrev}
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border border-border bg-card/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all active:scale-90"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            
            <div className="text-center min-w-[140px] md:min-w-[200px]">
              <h2 className="text-base md:text-xl font-black text-foreground tracking-tight">{headingLabel}</h2>
              <button
                onClick={goToToday}
                className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-80 transition-opacity mt-1"
              >
                Today
              </button>
            </div>

            <button
              onClick={navigateNext}
              className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl border border-border bg-card/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all active:scale-90"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>

        {/* Legend - simplified and modern */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-6 md:mb-8 opacity-70">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-primary shadow-lg shadow-primary/30" />
            <span>Done</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full border border-primary/60" />
            <span>Plan</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="h-2 w-2 md:h-3 md:w-3 rounded-full bg-muted-foreground/30" />
            <span>Rest</span>
          </div>
        </div>

        {loading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* Calendar grid with animation container */}
        <div className={`transition-opacity duration-300 ${loading ? "opacity-20" : "opacity-100"}`}>
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
        
        {/* Decorative background element */}
        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      </div>

      <p className="text-center text-sm font-medium text-muted-foreground italic">
        Select any day to view detailed logs or schedule your next routine.
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
