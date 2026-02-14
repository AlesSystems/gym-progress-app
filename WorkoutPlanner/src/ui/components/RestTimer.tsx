import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';

interface RestTimerProps {
  visible: boolean;
  duration: number;
  onClose: () => void;
  onSkip: () => void;
}

export function RestTimer({ visible, duration, onClose, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (visible) {
      setTimeLeft(duration);
    }
  }, [visible, duration]);

  useEffect(() => {
    if (!visible || timeLeft <= 0) {
      if (timeLeft <= 0 && visible) {
        onClose();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, timeLeft, onClose]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (seconds: number) => {
    setTimeLeft((prev) => prev + seconds);
  };

  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Rest Timer</Text>
          
          <View style={styles.timerContainer}>
            <View style={styles.progressRing}>
              <View style={[styles.progressFill, { height: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => addTime(-15)}
            >
              <Text style={styles.adjustButtonText}>-15s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => addTime(15)}
            >
              <Text style={styles.adjustButtonText}>+15s</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onSkip}
          >
            <Text style={styles.skipButtonText}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 350,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#007AFF',
    opacity: 0.3,
  },
  timeText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  adjustButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  adjustButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  skipButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
