import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Vibration,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { ExercisePicker } from '../components/ExercisePicker';
import { SetInputSheet } from '../components/SetInputSheet';
import { RestTimer } from '../components/RestTimer';
import { TemplateNameModal } from '../components/TemplateNameModal';
import { SettingsStorage, AppSettings } from '../../data/storage/SettingsStorage';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';

export function ActiveWorkoutScreen({ navigation }: any) {
  const {
    activeWorkout,
    addExercise,
    addSet,
    deleteSet,
    deleteExercise,
    finishWorkout,
    saveAsTemplate,
  } = useWorkoutContext();
  const { colors, isDarkMode } = useTheme();

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [showSetInput, setShowSetInput] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await SettingsStorage.getSettings();
    setSettings(loaded);
  };

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
    } else if (settings?.vibrationEnabled) {
      Vibration.vibrate(50);
    }

    if (!isWarmup && settings?.restTimerEnabled) {
      setShowRestTimer(true);
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

  const handleFinishWorkout = async () => {
    if (activeWorkout.exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise before finishing.');
      return;
    }

    Alert.alert('Finish Workout', 'Are you ready to finish this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Save as Template',
        onPress: () => setShowTemplateModal(true),
      },
      {
        text: 'Finish',
        onPress: async () => {
          await finishWorkout();
          navigation.navigate('Dashboard');
        },
      },
    ]);
  };

  const handleSaveTemplate = async (templateName: string) => {
    await saveAsTemplate(templateName);
    setShowTemplateModal(false);
    Alert.alert(
      'Template Saved',
      'Workout saved as template successfully!',
      [
        {
          text: 'Finish Workout',
          onPress: async () => {
            await finishWorkout();
            navigation.navigate('Dashboard');
          },
        },
        {
          text: 'Continue Workout',
          style: 'cancel',
        },
      ]
    );
  };

  const getLastSetValues = (exerciseId: string) => {
    const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.sets.length === 0) return null;
    return exercise.sets[exercise.sets.length - 1];
  };

  const styles = createStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
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

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
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
                <View style={styles.setNumberContainer}>
                  <Text style={styles.setNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.setText}>
                  {set.weight} kg × {set.reps} reps
                </Text>
                {set.isWarmup && <Text style={styles.warmupBadge}>WARMUP</Text>}
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

      {settings && (
        <RestTimer
          visible={showRestTimer}
          duration={settings.defaultRestTime}
          onClose={() => setShowRestTimer(false)}
          onSkip={() => setShowRestTimer(false)}
        />
      )}

      <TemplateNameModal
        visible={showTemplateModal}
        onSave={handleSaveTemplate}
        onCancel={() => setShowTemplateModal(false)}
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

function createStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary, // Match header color for status bar area
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xl, // Add some top padding if safe area doesn't cover it fully
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textOnPrimary,
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textOnPrimary,
  },
  headerTime: {
    fontSize: 14,
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginTop: 2,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for footer
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '300',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  setText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  warmupBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#FF9800',
    marginRight: 10,
    overflow: 'hidden',
  },
  deleteSetButton: {
    fontSize: 18,
    color: colors.danger,
    fontWeight: '300',
    paddingHorizontal: 10,
  },
  addSetButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: isDarkMode ? colors.background : '#F0F0F0',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addSetButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  addExerciseButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  addExerciseButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  finishButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
}
