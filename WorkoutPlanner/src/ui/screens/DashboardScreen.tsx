import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout Planner</Text>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigation.navigate('Stats')}
          activeOpacity={0.8}
        >
          <Text style={styles.statsButtonText}>Progress & Stats</Text>
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
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#333',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  statsButtonText: {
    color: '#4CAF50',
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
