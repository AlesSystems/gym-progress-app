import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Keyboard,
} from 'react-native';

const COMMON_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-ups',
  'Dips',
  'Lunges',
  'Leg Press',
  'Lat Pulldown',
  'Bicep Curl',
  'Tricep Extension',
  'Leg Curl',
  'Leg Extension',
  'Calf Raise',
];

interface ExercisePickerProps {
  visible: boolean;
  onSelect: (exerciseName: string) => void;
  onClose: () => void;
}

export function ExercisePicker({ visible, onSelect, onClose }: ExercisePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');

  const filteredExercises = COMMON_EXERCISES.filter(ex =>
    ex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (exerciseName: string) => {
    onSelect(exerciseName);
    setSearchQuery('');
    setCustomExerciseName('');
  };

  const handleAddCustom = () => {
    if (customExerciseName.trim()) {
      onSelect(customExerciseName.trim());
      setSearchQuery('');
      setCustomExerciseName('');
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setCustomExerciseName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
          handleClose();
        }}
      >
        <TouchableOpacity
          style={styles.modalContent}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add Exercise</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />

          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.exerciseName}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No exercises found</Text>
              </View>
            }
          />

          <View style={styles.customSection}>
            <Text style={styles.customLabel}>Or add custom exercise:</Text>
            <View style={styles.customInputRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Exercise name"
                value={customExerciseName}
                onChangeText={setCustomExerciseName}
              />
              <TouchableOpacity
                style={[
                  styles.addButton,
                  !customExerciseName.trim() && styles.addButtonDisabled,
                ]}
                onPress={handleAddCustom}
                disabled={!customExerciseName.trim()}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  searchInput: {
    margin: 15,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: 16,
  },
  list: {
    maxHeight: 300,
  },
  exerciseItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  exerciseName: {
    fontSize: 16,
    color: '#333',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  customSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  customLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
