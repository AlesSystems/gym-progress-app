import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius } from '../theme';

interface ActiveWorkoutBannerProps {
  navigation: any;
  currentScreen: string;
}

export function ActiveWorkoutBanner({ navigation, currentScreen }: ActiveWorkoutBannerProps) {
  const { activeWorkout } = useWorkoutContext();
  const { colors } = useTheme();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeWorkout && !activeWorkout.isCompleted && currentScreen !== 'ActiveWorkout') {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [activeWorkout, currentScreen]);

  if (!activeWorkout || activeWorkout.isCompleted || currentScreen === 'ActiveWorkout' || !isVisible) {
    return null;
  }

  const formatElapsedTime = (startTime: string): string => {
    const elapsed = currentTime - new Date(startTime).getTime();
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins} min`;
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => navigation.navigate('ActiveWorkout')}
        activeOpacity={0.8}
      >
        <View style={styles.indicator} />
        <View style={styles.content}>
          <Text style={styles.title}>Workout in Progress</Text>
          <Text style={styles.time}>
            {activeWorkout.startTime && formatElapsedTime(activeWorkout.startTime)} • {activeWorkout.exercises.length} exercises
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: any) {
  const bannerStyle: any = {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  };

  // Add platform-specific shadow styles
  if (Platform.OS === 'web') {
    bannerStyle.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  } else {
    bannerStyle.shadowColor = '#000';
    bannerStyle.shadowOffset = { width: 0, height: 4 };
    bannerStyle.shadowOpacity = 0.3;
    bannerStyle.shadowRadius = 8;
    bannerStyle.elevation = 8;
  }

  return StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: spacing.lg,
      left: spacing.lg,
      right: spacing.lg,
      zIndex: 1000,
    },
    banner: bannerStyle,
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    title: {
      color: colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
    },
    time: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 13,
      fontWeight: '500',
    },
    arrow: {
      color: colors.textOnPrimary,
      fontSize: 24,
      fontWeight: '300',
      marginLeft: spacing.sm,
    },
  });
}
