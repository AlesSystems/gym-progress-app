import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Exercise } from '../../data/models/Workout';

interface ExerciseDetailCardProps {
  exercise: Exercise;
  isEditing?: boolean;
}

export function ExerciseDetailCard({
  exercise,
  isEditing = false,
}: ExerciseDetailCardProps) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  setNumber: {
    fontSize: 15,
    color: '#8e8e93',
    width: 50,
  },
  setText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
  },
  warmupBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  warmupText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  rpeText: {
    fontSize: 13,
    color: '#8e8e93',
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2e',
  },
  volumeLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  volumeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2c2c2e',
  },
  notesLabel: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});
