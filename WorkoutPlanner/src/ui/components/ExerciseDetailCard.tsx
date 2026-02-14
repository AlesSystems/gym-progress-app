import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Exercise } from '../../data/models/Workout';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';

interface ExerciseDetailCardProps {
  exercise: Exercise;
  isEditing?: boolean;
}

export function ExerciseDetailCard({
  exercise,
  isEditing = false,
}: ExerciseDetailCardProps) {
  const { colors, isDarkMode } = useTheme();
  const styles = createStyles(colors, isDarkMode);

  const calculateVolume = () => {
    return exercise.sets
      .filter(set => !set.isWarmup)
      .reduce((sum, set) => sum + set.reps * set.weight, 0);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>💪 {exercise.name}</Text>
      </View>

      {exercise.sets
        .sort((a, b) => a.order - b.order)
        .map((set, index) => (
          <View key={set.id} style={styles.setRow}>
            <Text style={styles.setNumber}>Set {index + 1}</Text>
            <Text style={styles.setText}>
              {set.reps} reps @ {set.weight} kg
            </Text>
            {set.isWarmup && (
              <View style={styles.warmupBadge}>
                <Text style={styles.warmupText}>W</Text>
              </View>
            )}
            {set.rpe && (
              <Text style={styles.rpeText}>RPE {set.rpe}</Text>
            )}
          </View>
        ))}

      <View style={styles.volumeRow}>
        <Text style={styles.volumeLabel}>Total Volume:</Text>
        <Text style={styles.volumeValue}>{calculateVolume().toFixed(0)} kg</Text>
      </View>

      {exercise.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{exercise.notes}</Text>
        </View>
      )}
    </View>
  );
}

function createStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
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
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      gap: 12,
    },
    setNumber: {
      fontSize: 15,
      color: colors.textSecondary,
      width: 50,
    },
    setText: {
      fontSize: 15,
      color: colors.text,
      flex: 1,
    },
    warmupBadge: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    warmupText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textOnPrimary,
    },
    rpeText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    volumeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    volumeLabel: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    volumeValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    notesContainer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    notesLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    notesText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });
}
