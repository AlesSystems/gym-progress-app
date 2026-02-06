import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';

export function DashboardScreen({ navigation }: any) {
  const { activeWorkout, workoutHistory, startWorkout, discardWorkout } = useWorkoutContext();

  React.useEffect(() => {
    if (activeWorkout && !activeWorkout.isCompleted) {
      const timeSinceStart = activeWorkout.startTime
        ? Date.now() - new Date(activeWorkout.startTime).getTime()
        : 0;
      
      if (timeSinceStart > 0) {
        Alert.alert(
          'Resume Workout',
          `You have an unfinished workout from ${formatTime(timeSinceStart)} ago. Would you like to resume?`,
          [
            { text: 'Discard', onPress: discardWorkout, style: 'destructive' },
            { text: 'Resume', onPress: () => navigation.navigate('ActiveWorkout') },
          ]
        );
      }
    }
  }, []);

  const handleStartWorkout = async () => {
    await startWorkout();
    navigation.navigate('ActiveWorkout');
  };

  const lastWorkout = workoutHistory
    .filter(w => w.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Workout Planner</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>

        {lastWorkout && (
          <View style={styles.lastWorkoutCard}>
            <Text style={styles.cardTitle}>Last Workout</Text>
            <Text style={styles.cardDate}>
              {formatDate(lastWorkout.date)}
            </Text>
            <Text style={styles.cardStats}>
              {lastWorkout.exercises.length} exercises • {getTotalSets(lastWorkout)} sets
            </Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <Text style={styles.statText}>
            Total Workouts: {workoutHistory.filter(w => w.isCompleted).length}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTotalSets(workout: any): number {
  return workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  lastWorkoutCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  cardStats: {
    fontSize: 14,
    color: '#999',
  },
  statText: {
    fontSize: 16,
    color: '#666',
  },
});
