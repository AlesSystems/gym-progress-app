import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
  SafeAreaView,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { ExercisePicker } from '../components/ExercisePicker';
import { SetInputSheet } from '../components/SetInputSheet';

export function ActiveWorkoutScreen({ navigation }: any) {
  const {
    activeWorkout,
    addExercise,
    addSet,
    deleteSet,
    deleteExercise,
    finishWorkout,
  } = useWorkoutContext();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showSetInput, setShowSetInput] = useState(false);

  useEffect(() => {
    if (!activeWorkout) {
      navigation.navigate('Dashboard');
    }
  }, [activeWorkout, navigation]);

  if (!activeWorkout) {
    return null;
  }

  const handleAddExercise = async (exerciseName: string) => {
    await addExercise(exerciseName);
    setShowExercisePicker(false);
  };

  const handleAddSet = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setShowSetInput(true);
  };

  const handleSaveSet = async (
    reps: number,
    weight: number,
    isWarmup: boolean,
    rpe?: number
  ) => {
    if (!selectedExerciseId) return;

    const result = await addSet(selectedExerciseId, reps, weight, isWarmup, rpe);
    setShowSetInput(false);
    setSelectedExerciseId(null);

    if (result?.prs && result.prs.length > 0) {
      Vibration.vibrate([0, 100, 50, 100]);
      Alert.alert('🎉 Personal Record!', `You set ${result.prs.length} PR(s)!`);
    } else {
      Vibration.vibrate(50);
    }
  };

  const handleDeleteSet = (exerciseId: string, setId: string) => {
    Alert.alert('Delete Set', 'Are you sure you want to delete this set?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteSet(exerciseId, setId), style: 'destructive' },
    ]);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    Alert.alert('Delete Exercise', 'Are you sure you want to delete this exercise?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteExercise(exerciseId), style: 'destructive' },
    ]);
  };

  const handleFinishWorkout = () => {
    if (activeWorkout.exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise before finishing.');
      return;
    }

    Alert.alert('Finish Workout', 'Are you ready to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          await finishWorkout();
          navigation.navigate('Dashboard');
        },
      },
    ]);
  };

  const getLastSetValues = (exerciseId: string) => {
    const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.sets.length === 0) return null;
    return exercise.sets[exercise.sets.length - 1];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Active Workout</Text>
            <Text style={styles.headerTime}>
              {activeWorkout.startTime && formatElapsedTime(activeWorkout.startTime)}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

      <ScrollView style={styles.content}>
        {activeWorkout.exercises.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No exercises yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add Exercise" to get started</Text>
          </View>
        )}

        {activeWorkout.exercises.map(exercise => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteExercise(exercise.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <Text style={styles.setText}>
                  {set.weight} kg × {set.reps} reps
                </Text>
                {set.isWarmup && <Text style={styles.warmupBadge}>W</Text>}
                <TouchableOpacity
                  onPress={() => handleDeleteSet(exercise.id, set.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteSetButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(exercise.id)}
            >
              <Text style={styles.addSetButtonText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={() => setShowExercisePicker(true)}
        >
          <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishWorkout}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <ExercisePicker
        visible={showExercisePicker}
        onSelect={handleAddExercise}
        onClose={() => setShowExercisePicker(false)}
      />

      <SetInputSheet
        visible={showSetInput}
        onSave={handleSaveSet}
        onClose={() => {
          setShowSetInput(false);
          setSelectedExerciseId(null);
        }}
        defaultValues={selectedExerciseId ? getLastSetValues(selectedExerciseId) : null}
      />
    </View>
    </SafeAreaView>
  );
}

function formatElapsedTime(startTime: string): string {
  const elapsed = Date.now() - new Date(startTime).getTime();
  const minutes = Math.floor(elapsed / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }
  return `${mins} min`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#007AFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 5,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  deleteButton: {
    fontSize: 24,
    color: '#FF3B30',
    fontWeight: '300',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 30,
  },
  setText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  warmupBadge: {
    backgroundColor: '#FFE5B4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#FF8C00',
    marginRight: 10,
  },
  deleteSetButton: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: '300',
    paddingHorizontal: 10,
  },
  addSetButton: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
  },
  addSetButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 10,
  },
  addExerciseButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
