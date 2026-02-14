import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useAllExerciseStats } from '../hooks/useExerciseStats';
import { ProgressUtils } from '../../domain/progress';
import { TimeRange } from '../../domain/progress/types';

export function StatsScreen({ navigation }: any) {
  const { workoutHistory } = useWorkoutContext();
  const allStats = useAllExerciseStats(workoutHistory);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all');

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
        return '#4CAF50';
      case 'declining':
        return '#F44336';
      case 'plateauing':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#2196F3',
  },
  timeRangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
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
    color: '#2196F3',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  exerciseListCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  exerciseItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
    color: '#666',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  volumeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  volumeLabel: {
    fontSize: 12,
    color: '#666',
  },
  volumeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  projectionLabel: {
    fontSize: 12,
    color: '#2196F3',
  },
  projectionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  headerSpacer: {
    width: 60,
  },
  footerSpacer: {
    height: 40,
  },
});
