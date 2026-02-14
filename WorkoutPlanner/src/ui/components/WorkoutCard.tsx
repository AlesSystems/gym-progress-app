import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Workout } from '../../data/models/Workout';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  date: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#8e8e93',
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2c2c2e',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8e8e93',
  },
  exerciseList: {
    gap: 4,
  },
  exerciseName: {
    fontSize: 14,
    color: '#8e8e93',
  },
});
