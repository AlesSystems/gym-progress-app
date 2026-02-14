import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Workout } from '../../data/models/Workout';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function WorkoutCard({
  workout,
  onPress,
  onDelete,
  onDuplicate,
}: WorkoutCardProps) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatDuration = (startTime?: string, endTime?: string) => {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const calculateTotalSets = () => {
    return workout.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0
    );
  };

  const calculateTotalVolume = () => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets
          .filter(set => !set.isWarmup)
          .reduce((sum, set) => sum + set.reps * set.weight, 0)
      );
    }, 0);
  };

  const handleLongPress = useCallback(() => {
    Alert.alert('Workout Actions', 'Choose an action', [
      { text: 'Duplicate', onPress: onDuplicate },
      { text: 'Delete', onPress: onDelete, style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [onDelete, onDuplicate]);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.date}>
            {formatDate(workout.date)} · {getDayOfWeek(workout.date)}
          </Text>
          <Text style={styles.duration}>
            Duration: {formatDuration(workout.startTime, workout.endTime)}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>💪 {workout.exercises.length}</Text>
          <Text style={styles.statLabel}>exercises</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{calculateTotalSets()}</Text>
          <Text style={styles.statLabel}>sets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>📊 {calculateTotalVolume().toFixed(0)} kg</Text>
          <Text style={styles.statLabel}>total volume</Text>
        </View>
      </View>

      {workout.exercises.length > 0 && (
        <View style={styles.exerciseList}>
          {workout.exercises.slice(0, 3).map(exercise => (
            <Text key={exercise.id} style={styles.exerciseName}>
              • {exercise.name}
            </Text>
          ))}
          {workout.exercises.length > 3 && (
            <Text style={styles.exerciseName}>
              • +{workout.exercises.length - 3} more
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

function createStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    date: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    duration: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    stats: {
      flexDirection: 'row',
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    exerciseList: {
      gap: 4,
    },
    exerciseName: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });
}
