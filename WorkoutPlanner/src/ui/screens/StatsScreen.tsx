import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useAllExerciseStats } from '../hooks/useExerciseStats';
import { ProgressUtils } from '../../domain/progress';
import { TimeRange } from '../../domain/progress/types';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { ActiveWorkoutBanner } from '../components/ActiveWorkoutBanner';

export function StatsScreen({ navigation }: any) {
  const { workoutHistory } = useWorkoutContext();
  const allStats = useAllExerciseStats(workoutHistory);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all');
  const { colors, isDarkMode } = useTheme();

  const exerciseNames = ProgressUtils.getAllExerciseNames(workoutHistory);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '↑';
      case 'declining':
        return '↓';
      case 'plateauing':
        return '→';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return colors.success;
      case 'declining':
        return colors.danger;
      case 'plateauing':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const styles = createStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.backButton}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Progress & Stats</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['4w', '3m', '1y', 'all'] as TimeRange[]).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  selectedTimeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === '4w' ? '4 Weeks' : range === '3m' ? '3 Months' : range === '1y' ? '1 Year' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {/* Overall Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Overall Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{workoutHistory.filter(w => w.isCompleted).length}</Text>
                <Text style={styles.summaryLabel}>Total Workouts</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{exerciseNames.length}</Text>
                <Text style={styles.summaryLabel}>Unique Exercises</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{allStats.length}</Text>
                <Text style={styles.summaryLabel}>Tracked</Text>
              </View>
            </View>
          </View>

          {/* Exercise Stats List */}
          <View style={styles.exerciseListCard}>
            <Text style={styles.sectionTitle}>Exercise Progress</Text>
            {allStats.length === 0 ? (
              <Text style={styles.emptyText}>No exercise data yet. Complete workouts to see stats.</Text>
            ) : (
              allStats.map(stats => (
                <TouchableOpacity
                  key={stats.exerciseName}
                  style={styles.exerciseItem}
                  onPress={() => {
                    navigation.navigate('ExerciseDetail', { exerciseName: stats.exerciseName });
                  }}
                >
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{stats.exerciseName}</Text>
                    <View style={styles.trendBadge}>
                      <Text
                        style={[
                          styles.trendIcon,
                          { color: getTrendColor(stats.progression.trend) },
                        ]}
                      >
                        {getTrendIcon(stats.progression.trend)}
                      </Text>
                      <Text style={styles.trendText}>{stats.progression.trend}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Max Weight</Text>
                      <Text style={styles.statValue}>{stats.maxWeight.toFixed(1)} kg</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Sessions</Text>
                      <Text style={styles.statValue}>{stats.sessionCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Frequency</Text>
                      <Text style={styles.statValue}>{stats.frequencyPerWeek.toFixed(1)}/wk</Text>
                    </View>
                  </View>

                  <View style={styles.volumeRow}>
                    <Text style={styles.volumeLabel}>Total Volume:</Text>
                    <Text style={styles.volumeValue}>{stats.totalVolume.toLocaleString()} kg</Text>
                  </View>

                  {stats.progression.rSquared > 0.5 && (
                    <View style={styles.projectionRow}>
                      <Text style={styles.projectionLabel}>Projected Next PR:</Text>
                      <Text style={styles.projectionValue}>
                        {stats.progression.projectedNextPR.toFixed(1)} kg
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Footer Spacing */}
          <View style={styles.footerSpacer} />
        </ScrollView>
        <ActiveWorkoutBanner navigation={navigation} currentScreen="Stats" />
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
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      ...typography.title3,
      color: colors.text,
    },
    headerSpacer: {
      width: 80,
    },
    timeRangeContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: 8,
    },
    timeRangeButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeRangeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timeRangeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    timeRangeTextActive: {
      color: colors.textOnPrimary,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      ...typography.headline,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    exerciseListCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyText: {
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
      fontStyle: 'italic',
      paddingVertical: 20,
    },
    exerciseItem: {
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.background : '#f5f5f5',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    trendIcon: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    trendText: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    statItem: {
      flex: 1,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    volumeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    volumeLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    volumeValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    projectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    projectionLabel: {
      fontSize: 12,
      color: colors.primary,
    },
    projectionValue: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    footerSpacer: {
      height: 40,
    },
  });
}
