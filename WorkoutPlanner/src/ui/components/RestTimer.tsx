import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Vibration,
  AppState,
  Platform,
} from 'react-native';

interface RestTimerProps {
  visible: boolean;
  duration: number;
  onClose: () => void;
  onSkip: () => void;
}

export function RestTimer({ visible, duration, onClose, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const startTimeRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (visible) {
      const now = Date.now();
      startTimeRef.current = now;
      targetTimeRef.current = now + duration * 1000;
      setTimeLeft(duration);
    } else {
      startTimeRef.current = null;
      targetTimeRef.current = null;
    }
  }, [visible, duration]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        visible &&
        targetTimeRef.current
      ) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || timeLeft <= 0) {
      if (timeLeft <= 0 && visible) {
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 200, 100, 200]);
        }
        onClose();
      }
      return;
    }

    const interval = setInterval(() => {
      if (targetTimeRef.current) {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [visible, timeLeft, onClose]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const addTime = (seconds: number) => {
    if (targetTimeRef.current) {
      targetTimeRef.current += seconds * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((targetTimeRef.current - now) / 1000));
      setTimeLeft(remaining);
    }
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
            
            <View style={styles.progressIndicator}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
            
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
    padding: 16,
    alignItems: 'center',
    width: '85%',
    maxWidth: 260,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: 90,
    height: 90,
  },
  progressRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007AFF',
    zIndex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
    gap: 6,
  },
  progressIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  adjustButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  skipButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
