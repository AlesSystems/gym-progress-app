import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  Keyboard,
} from 'react-native';
import { Set } from '../../data/models/Workout';

interface SetInputSheetProps {
  visible: boolean;
  onSave: (reps: number, weight: number, isWarmup: boolean, rpe?: number) => void;
  onClose: () => void;
  defaultValues?: Set | null;
}

export function SetInputSheet({ visible, onSave, onClose, defaultValues }: SetInputSheetProps) {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [isWarmup, setIsWarmup] = useState(false);
  const [rpe, setRpe] = useState('');

  useEffect(() => {
    if (visible && defaultValues) {
      setWeight(defaultValues.weight.toString());
      setReps(defaultValues.reps.toString());
      setIsWarmup(false);
      setRpe('');
    }
  }, [visible, defaultValues]);

  const handleSave = () => {
    const repsNum = parseInt(reps, 10);
    const weightNum = parseFloat(weight);

    if (isNaN(repsNum) || repsNum <= 0) {
      return;
    }

    if (isNaN(weightNum) || weightNum < 0) {
      return;
    }

    const rpeNum = rpe ? parseInt(rpe, 10) : undefined;

    onSave(repsNum, weightNum, isWarmup, rpeNum);
    handleClose();
  };

  const handleClose = () => {
    setReps('');
    setWeight('');
    setIsWarmup(false);
    setRpe('');
    onClose();
  };

  const incrementWeight = (amount: number) => {
    const current = parseFloat(weight) || 0;
    setWeight((current + amount).toString());
  };

  const incrementReps = (amount: number) => {
    const current = parseInt(reps, 10) || 0;
    const newValue = Math.max(0, current + amount);
    setReps(newValue.toString());
  };

  const canSave = reps && weight && !isNaN(parseInt(reps, 10)) && !isNaN(parseFloat(weight));

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
            <Text style={styles.title}>Log Set</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (kg)</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => incrementWeight(-2.5)}
                >
                  <Text style={styles.incrementText}>-2.5</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => incrementWeight(2.5)}
                >
                  <Text style={styles.incrementText}>+2.5</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.quickButtons}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => incrementWeight(5)}
                >
                  <Text style={styles.quickButtonText}>+5</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => incrementWeight(10)}
                >
                  <Text style={styles.quickButtonText}>+10</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reps</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => incrementReps(-1)}
                >
                  <Text style={styles.incrementText}>-1</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="number-pad"
                  placeholder="0"
                />
                <TouchableOpacity
                  style={styles.incrementButton}
                  onPress={() => incrementReps(1)}
                >
                  <Text style={styles.incrementText}>+1</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.switchGroup}>
              <Text style={styles.label}>Warmup Set</Text>
              <Switch
                value={isWarmup}
                onValueChange={setIsWarmup}
                trackColor={{ false: '#E0E0E0', true: '#007AFF' }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>RPE (Optional, 1-10)</Text>
              <TextInput
                style={styles.input}
                value={rpe}
                onChangeText={setRpe}
                keyboardType="number-pad"
                placeholder="Rate of Perceived Exertion"
                maxLength={2}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveButtonText}>Save Set</Text>
          </TouchableOpacity>
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
    paddingBottom: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  content: {
    padding: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    fontSize: 14,
    textAlign: 'center',
    minHeight: 36,
  },
  incrementButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 45,
    alignItems: 'center',
  },
  incrementText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#34C759',
    margin: 12,
    marginTop: 6,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
