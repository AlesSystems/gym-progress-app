export interface CalendarCompletedSession {
  id: string;
  name: string | null;
  durationMinutes: number | null;
  totalVolume: number;
  volumeUnit: string | null;
}

export interface CalendarScheduledWorkout {
  id: string;
  title: string | null;
  templateId: string | null;
  status: "planned" | "completed" | "missed";
  notes: string | null;
  completedSessionId: string | null;
}

export interface CalendarDayData {
  completedSessions: CalendarCompletedSession[];
  scheduledWorkouts: CalendarScheduledWorkout[];
}

export interface CalendarResponse {
  from: string;
  to: string;
  days: Record<string, CalendarDayData>;
}
