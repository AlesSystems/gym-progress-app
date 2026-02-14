import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useWorkoutDetail } from '../hooks/useWorkoutDetail';
import { ExerciseDetailCard } from '../components/ExerciseDetailCard';

export function WorkoutDetailScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const {
    workout,
    isLoading,
    deleteWorkout,
    updateWorkout,
    duplicateAsTemplate,
  } = useWorkoutDetail(workoutId);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!workout && !isLoading) {
      navigation.goBack();
    }
  }, [workout, isLoading, navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout();
            navigation.goBack();
          },
        },
      ]
    );
  }, [deleteWorkout, navigation]);

  const handleUseAsTemplate = useCallback(async () => {
    await duplicateAsTemplate();
    Alert.alert('Success', 'Workout template created!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('ActiveWorkout'),
      },
    ]);
  }, [duplicateAsTemplate, navigation]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const calculateTotalVolume = () => {
    if (!workout) return 0;
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets
          .filter(set => !set.isWarmup)
          .reduce((sum, set) => sum + set.reps * set.weight, 0)
      );
    }, 0);
  };

  if (isLoading || !workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← History</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleUseAsTemplate}
            >
              <Text style={styles.iconButtonText}>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <Text style={styles.iconButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.metaSection}>
          <Text style={styles.dateText}>{formatDate(workout.date)}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>
                {formatDuration(workout.startTime, workout.endTime)}
              </Text>
            </View>
            {workout.bodyweight && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Bodyweight</Text>
                <Text style={styles.metaValue}>{workout.bodyweight} kg</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Total Volume</Text>
              <Text style={styles.metaValue}>
                {calculateTotalVolume().toFixed(0)} kg
              </Text>
            </View>
          </View>
        </View>

        {workout.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{workout.notes}</Text>
          </View>
        )}

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>
            Exercises ({workout.exercises.length})
          </Text>
          {workout.exercises
            .sort((a, b) => a.order - b.order)
            .map(exercise => (
              <ExerciseDetailCard
                key={exercise.id}
                exercise={exercise}
                isEditing={isEditing}
              />
            ))}
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  metaSection: {
    marginTop: 20,
  },
  dateText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  metaLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  notesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  notesText: {
    fontSize: 15,
    color: '#8e8e93',
    lineHeight: 22,
    backgroundColor: '#1c1c1e',
    padding: 16,
    borderRadius: 12,
  },
  exercisesSection: {
    marginTop: 24,
  },
});
