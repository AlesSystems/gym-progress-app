import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useExerciseStats } from '../hooks/useExerciseStats';
import { useWeightChart, useVolumeChart } from '../hooks/useChartData';
import { TimeRange } from '../../domain/progress/types';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export function ExerciseDetailScreen({ route, navigation }: any) {
  const { exerciseName } = route.params;
  const { workoutHistory } = useWorkoutContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('all');
  const [chartType, setChartType] = useState<'weight' | 'volume'>('weight');
  const { colors, isDarkMode } = useTheme();

  const stats = useExerciseStats(exerciseName, workoutHistory);
  const weightChart = useWeightChart(exerciseName, workoutHistory, selectedTimeRange, []);
  const volumeChart = useVolumeChart(exerciseName, workoutHistory, selectedTimeRange, []);

  const currentChart = chartType === 'weight' ? weightChart : volumeChart;

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

  const renderSimpleChart = () => {
    if (!currentChart || currentChart.dataPoints.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.placeholderText}>No data available for this time range</Text>
        </View>
      );
    }

    const maxValue = Math.max(...currentChart.dataPoints.map(p => p.value));
    const minValue = Math.min(...currentChart.dataPoints.map(p => p.value));
    const range = maxValue - minValue || 1;

    const chartHeight = 200;
    const chartWidth = SCREEN_WIDTH - 80;
    const pointSpacing = currentChart.dataPoints.length > 1 
      ? chartWidth / (currentChart.dataPoints.length - 1) 
      : chartWidth / 2;

    return (
      <View style={styles.chartContainer}>
        <View style={[styles.chart, { height: chartHeight }]}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{maxValue.toFixed(0)}</Text>
            <Text style={styles.axisLabel}>{((maxValue + minValue) / 2).toFixed(0)}</Text>
            <Text style={styles.axisLabel}>{minValue.toFixed(0)}</Text>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            {[0, 1, 2].map(i => (
              <View
                key={i}
                style={[
                  styles.gridLine,
                  { top: (chartHeight / 2) * i - 1 },
                ]}
              />
            ))}

            {/* Data points and lines */}
            {currentChart.dataPoints.map((point, index) => {
              const x = index * pointSpacing;
              const normalizedValue = (point.value - minValue) / range;
              const y = chartHeight - normalizedValue * chartHeight - 8;

              const nextPoint = currentChart.dataPoints[index + 1];
              let lineWidth = 0;
              let lineAngle = 0;

              if (nextPoint) {
                const nextX = (index + 1) * pointSpacing;
                const nextNormalizedValue = (nextPoint.value - minValue) / range;
                const nextY = chartHeight - nextNormalizedValue * chartHeight - 8;

                lineWidth = Math.sqrt(
                  Math.pow(nextX - x, 2) + Math.pow(nextY - y, 2)
                );
                lineAngle = Math.atan2(nextY - y, nextX - x) * (180 / Math.PI);
              }

              return (
                <View key={point.workoutId + index}>
                  {/* Line to next point */}
                  {nextPoint && (
                    <View
                      style={[
                        styles.chartLine,
                        {
                          left: x + 8,
                          top: y + 8,
                          width: lineWidth,
                          transform: [{ rotate: `${lineAngle}deg` }],
                        },
                      ]}
                    />
                  )}
                  {/* Data point */}
                  <View
                    style={[
                      styles.dataPoint,
                      {
                        left: x,
                        top: y,
                      },
                      point.isPR ? styles.prPoint : styles.normalPoint,
                    ]}
                  >
                    {point.isPR && <Text style={styles.prMarker}>★</Text>}
                  </View>
                </View>
              );
            })}

            {/* Trend line */}
            {currentChart.trendLine && (
              <View style={styles.trendLineContainer}>
                {currentChart.dataPoints.map((_, index) => {
                  const x = index * pointSpacing + 8;
                  const trendValue =
                    currentChart.trendLine!.slope * index +
                    currentChart.trendLine!.intercept;
                  const normalizedValue = (trendValue - minValue) / range;
                  const y = chartHeight - normalizedValue * chartHeight;

                  if (index === 0) return null;

                  const prevTrendValue =
                    currentChart.trendLine!.slope * (index - 1) +
                    currentChart.trendLine!.intercept;
                  const prevNormalizedValue = (prevTrendValue - minValue) / range;
                  const prevY = chartHeight - prevNormalizedValue * chartHeight;

                  const prevX = (index - 1) * pointSpacing + 8;
                  const lineWidth = Math.sqrt(
                    Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2)
                  );
                  const lineAngle = Math.atan2(y - prevY, x - prevX) * (180 / Math.PI);

                  return (
                    <View
                      key={`trend-${index}`}
                      style={[
                        styles.trendLine,
                        {
                          left: prevX,
                          top: prevY,
                          width: lineWidth,
                          transform: [{ rotate: `${lineAngle}deg` }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxis}>
          {currentChart.dataPoints.length > 0 && (
            <>
              <Text style={styles.axisLabel}>
                {new Date(currentChart.dataPoints[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.axisLabel}>
                {new Date(currentChart.dataPoints[currentChart.dataPoints.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
            <Text style={styles.backButton}>← Stats</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Exercise Details</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No data available for this exercise</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          <Text style={styles.backButton}>← Stats</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.maxWeight.toFixed(1)} kg</Text>
              <Text style={styles.statLabel}>Max Weight</Text>
              <Text style={styles.statDate}>
                {new Date(stats.maxWeightDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.sessionCount}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statDate}>{stats.frequencyPerWeek.toFixed(1)}/wk</Text>
            </View>
          </View>

          <View style={[styles.statRow, styles.statRowMargin]}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalVolume.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Volume (kg)</Text>
            </View>
            <View style={styles.statBox}>
              <Text
                style={[
                  styles.statValue,
                  { color: getTrendColor(stats.progression.trend) },
                ]}
              >
                {stats.progression.trend === 'improving'
                  ? '↑'
                  : stats.progression.trend === 'declining'
                  ? '↓'
                  : '→'}{' '}
                {stats.progression.trend}
              </Text>
              <Text style={styles.statLabel}>Trend</Text>
            </View>
          </View>
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
                {range === '4w'
                  ? '4W'
                  : range === '3m'
                  ? '3M'
                  : range === '1y'
                  ? '1Y'
                  : 'All'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Type Selector */}
        <View style={styles.chartTypeContainer}>
          <TouchableOpacity
            style={[
              styles.chartTypeButton,
              chartType === 'weight' && styles.chartTypeButtonActive,
            ]}
            onPress={() => setChartType('weight')}
          >
            <Text
              style={[
                styles.chartTypeText,
                chartType === 'weight' && styles.chartTypeTextActive,
              ]}
            >
              Weight Progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chartTypeButton,
              chartType === 'volume' && styles.chartTypeButtonActive,
            ]}
            onPress={() => setChartType('volume')}
          >
            <Text
              style={[
                styles.chartTypeText,
                chartType === 'volume' && styles.chartTypeTextActive,
              ]}
            >
              Volume Progress
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>
            {chartType === 'weight' ? 'Weight Progression' : 'Volume Progression'}
          </Text>
          {renderSimpleChart()}
        </View>

        {/* Additional Info */}
        {stats.progression.rSquared > 0.5 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Progression Insights</Text>
            <Text style={styles.infoText}>
              R² Score: {stats.progression.rSquared.toFixed(2)} (
              {stats.progression.rSquared > 0.7 ? 'Strong' : 'Moderate'} correlation)
            </Text>
            <Text style={styles.infoText}>
              Projected Next PR: {stats.progression.projectedNextPR.toFixed(1)} kg
            </Text>
            <Text style={styles.infoText}>
              Rate of change: {stats.progression.slope > 0 ? '+' : ''}
              {stats.progression.slope.toFixed(2)} kg per session
            </Text>
          </View>
        )}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
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
      ...typography.headline,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 10,
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
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    statDate: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 2,
    },
    timeRangeContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: 8,
      marginBottom: spacing.lg,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeRangeButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    timeRangeButtonActive: {
      backgroundColor: colors.primary,
    },
    timeRangeText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    timeRangeTextActive: {
      color: colors.textOnPrimary,
    },
    chartTypeContainer: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: 8,
      marginBottom: spacing.lg,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartTypeButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    chartTypeButtonActive: {
      backgroundColor: colors.primary,
    },
    chartTypeText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    chartTypeTextActive: {
      color: colors.textOnPrimary,
    },
    chartCard: {
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
    chartTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.lg,
    },
    chartContainer: {
      marginTop: 10,
    },
    chart: {
      flexDirection: 'row',
      position: 'relative',
    },
    yAxis: {
      width: 40,
      justifyContent: 'space-between',
      paddingRight: 8,
    },
    axisLabel: {
      fontSize: 10,
      color: colors.textMuted,
    },
    chartArea: {
      flex: 1,
      position: 'relative',
    },
    gridLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: colors.border,
    },
    dataPoint: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    prMarker: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    chartLine: {
      position: 'absolute',
      height: 2,
      backgroundColor: colors.primary,
      transformOrigin: 'left center',
    },
    trendLineContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    trendLine: {
      position: 'absolute',
      height: 1,
      backgroundColor: colors.warning,
      opacity: 0.6,
      borderStyle: 'dashed',
      transformOrigin: 'left center',
    },
    xAxis: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingLeft: 40,
    },
    chartPlaceholder: {
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: borderRadius.md,
    },
    placeholderText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    infoCard: {
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
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.md,
    },
    infoText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
    },
    headerSpacer: {
      width: 60,
    },
    footerSpacer: {
      height: 40,
    },
    statRowMargin: {
      marginTop: spacing.lg,
    },
    prPoint: {
      backgroundColor: colors.warning, // Gold/Yellow for PRs
    },
    normalPoint: {
      backgroundColor: colors.primary,
    },
  });
}
