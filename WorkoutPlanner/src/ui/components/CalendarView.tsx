import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Workout } from '../../data/models/Workout';

interface CalendarViewProps {
  workouts: Workout[];
  onWorkoutPress: (workoutId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

interface CalendarDay {
  date: Date;
  workouts: Workout[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export function CalendarView({
  workouts,
  onWorkoutPress,
  onRefresh,
  refreshing,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate.toISOString().split('T')[0] === dateStr;
      });

      days.push({
        date: new Date(currentDate),
        workouts: dayWorkouts,
        isToday: currentDate.getTime() === today.getTime(),
        isCurrentMonth: currentDate.getMonth() === month,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, workouts]);

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>{monthName}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.calendar}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day.isToday && styles.todayCell,
              !day.isCurrentMonth && styles.otherMonthCell,
            ]}
            onPress={() => {
              if (day.workouts.length === 1) {
                onWorkoutPress(day.workouts[0].id);
              } else if (day.workouts.length > 1) {
                // For multiple workouts, could show a modal/bottom sheet
                // For now, just navigate to the first one
                onWorkoutPress(day.workouts[0].id);
              }
            }}
            disabled={day.workouts.length === 0}
          >
            <Text
              style={[
                styles.dayNumber,
                !day.isCurrentMonth && styles.otherMonthText,
                day.isToday && styles.todayText,
              ]}
            >
              {day.date.getDate()}
            </Text>
            {day.workouts.length > 0 && (
              <View style={styles.workoutIndicator}>
                {day.workouts.length === 1 ? (
                  <View style={styles.dot} />
                ) : (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{day.workouts.length}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 32,
    color: '#007AFF',
    fontWeight: '300',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e93',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#1c1c1e',
    borderRadius: 8,
  },
  otherMonthCell: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 16,
    color: '#fff',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  otherMonthText: {
    color: '#636366',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});
