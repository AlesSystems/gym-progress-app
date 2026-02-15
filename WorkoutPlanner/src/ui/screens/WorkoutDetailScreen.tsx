import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWorkoutDetail } from '../hooks/useWorkoutDetail';
import { ExerciseDetailCard } from '../components/ExerciseDetailCard';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';

export function WorkoutDetailScreen({ route, navigation }: any) {
  const { workoutId } = route.params;
  const {
    workout,
    isLoading,
    deleteWorkout,
    updateWorkout,
    duplicateAsTemplate,
  } = useWorkoutDetail(workoutId);
  const { colors, isDarkMode } = useTheme();

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

  const styles = createStyles(colors, isDarkMode);

  if (isLoading || !workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
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

function createStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      paddingVertical: 8,
    },
    backButtonText: {
      fontSize: 17,
      color: colors.primary,
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
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    metaSection: {
      marginTop: spacing.xl,
    },
    dateText: {
      ...typography.title1,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 16,
    },
    metaItem: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    metaValue: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    notesSection: {
      marginTop: spacing.xl,
    },
    sectionTitle: {
      ...typography.title3,
      color: colors.text,
      marginBottom: spacing.md,
    },
    notesText: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exercisesSection: {
      marginTop: spacing.xl,
    },
  });
}
