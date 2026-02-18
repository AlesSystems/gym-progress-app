import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useWeightTracking, TimeRange } from '../hooks/useWeightTracking';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';
import { ActiveWorkoutBanner } from '../components/ActiveWorkoutBanner';
import { WeightUnit, GoalType } from '../../data/models/WeightTracking';
import { WeightCalculator } from '../../domain/weight/WeightCalculator';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '1w', label: '1W' },
  { key: '1m', label: '1M' },
  { key: '3m', label: '3M' },
  { key: 'all', label: 'All' },
];

const GOAL_TYPES: { key: GoalType; label: string }[] = [
  { key: 'lose', label: 'Lose Weight' },
  { key: 'gain', label: 'Gain Muscle' },
  { key: 'maintain', label: 'Maintain' },
];

export function WeightTrackingScreen({ navigation }: any) {
  const {
    entries,
    goal,
    stats,
    isLoading,
    displayUnit,
    addEntry,
    updateEntry,
    deleteEntry,
    saveGoal,
    getEntriesForRange,
  } = useWeightTracking();

  const { isDarkMode, colors } = useTheme();

  const [chartRange, setChartRange] = useState<TimeRange>('1m');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Entry modal state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [entryWeight, setEntryWeight] = useState('');
  const [entryUnit, setEntryUnit] = useState<WeightUnit>(displayUnit);
  const [entryDate, setEntryDate] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  // Goal modal state
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState<WeightUnit>(displayUnit);
  const [goalType, setGoalType] = useState<GoalType>('lose');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  const chartEntries = useMemo(
    () => getEntriesForRange(chartRange),
    [getEntriesForRange, chartRange]
  );

  const recentEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20),
    [entries]
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'decreasing': return '↓';
      case 'increasing': return '↑';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'decreasing': return colors.success;
      case 'increasing': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const openNewEntry = () => {
    setEditingId(null);
    setEntryWeight('');
    setEntryUnit(displayUnit);
    setEntryDate(new Date().toISOString().split('T')[0]);
    setEntryNotes('');
    setShowEntryModal(true);
  };

  const openEditEntry = (entry: typeof entries[0]) => {
    setEditingId(entry.id);
    setEntryWeight(entry.weight.toString());
    setEntryUnit(entry.unit);
    setEntryDate(entry.date);
    setEntryNotes(entry.notes || '');
    setShowEntryModal(true);
  };

  const handleSaveEntry = async () => {
    const weight = parseFloat(entryWeight);
    if (!weight || weight <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight');
      return;
    }

    try {
      if (editingId) {
        await updateEntry(editingId, weight, entryUnit, entryDate, undefined, entryNotes || undefined);
      } else {
        await addEntry(weight, entryUnit, entryDate, undefined, entryNotes || undefined);
      }
      setShowEntryModal(false);
    } catch {
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEntry(id);
          } catch {
            Alert.alert('Error', 'Failed to delete entry');
          }
        },
      },
    ]);
  };

  const handleEntryAction = (entry: typeof entries[0]) => {
    Alert.alert(
      `${entry.weight} ${entry.unit}`,
      formatDateDisplay(entry.date),
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => openEditEntry(entry) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteEntry(entry.id) },
      ]
    );
  };

  const openGoalModal = () => {
    if (goal) {
      setGoalTarget(goal.targetWeight.toString());
      setGoalUnit(goal.unit);
      setGoalType(goal.goalType);
      setGoalTargetDate(goal.targetDate || '');
    } else {
      setGoalTarget('');
      setGoalUnit(displayUnit);
      setGoalType('lose');
      setGoalTargetDate('');
    }
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    const target = parseFloat(goalTarget);
    if (!target || target <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid target weight');
      return;
    }

    const now = new Date().toISOString();
    try {
      await saveGoal({
        targetWeight: target,
        unit: goalUnit,
        goalType,
        startWeight: stats?.currentWeight || target,
        startDate: goal?.startDate || now.split('T')[0],
        targetDate: goalTargetDate || undefined,
        isActive: true,
        createdAt: goal?.createdAt || now,
        updatedAt: now,
      });
      setShowGoalModal(false);
      Alert.alert('Success', 'Goal saved');
    } catch {
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const adjustWeight = (delta: number) => {
    const current = parseFloat(entryWeight) || 0;
    const next = Math.max(0, Math.round((current + delta) * 10) / 10);
    setEntryWeight(next.toString());
  };

  const styles = createStyles(colors, isDarkMode);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.noDataText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Weight Tracker</Text>
          <TouchableOpacity onPress={openGoalModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.settingsIcon}>🎯</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Card */}
          {stats ? (
            <View style={styles.summaryCard}>
              <Text style={styles.cardTitle}>Current Weight</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.currentWeight}>
                  {stats.currentWeight} {displayUnit}
                </Text>
                <View style={[styles.trendBadge, { backgroundColor: getTrendColor(stats.trend) + '20' }]}>
                  <Text style={[styles.trendText, { color: getTrendColor(stats.trend) }]}>
                    {getTrendIcon(stats.trend)} {stats.totalChange > 0 ? '+' : ''}{stats.totalChange} {displayUnit}
                  </Text>
                </View>
              </View>
              <View style={styles.miniStatsRow}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{stats.lowestWeight}</Text>
                  <Text style={styles.miniStatLabel}>Low</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{stats.averageWeight}</Text>
                  <Text style={styles.miniStatLabel}>Avg</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{stats.highestWeight}</Text>
                  <Text style={styles.miniStatLabel}>High</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatValue}>{stats.entriesCount}</Text>
                  <Text style={styles.miniStatLabel}>Entries</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.summaryCard}>
              <Text style={styles.noDataText}>No entries yet. Log your first weight!</Text>
            </View>
          )}

          {/* Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Trend</Text>
            <View style={styles.timeRangeRow}>
              {TIME_RANGES.map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.timeRangeBtn, chartRange === key && styles.timeRangeBtnActive]}
                  onPress={() => setChartRange(key)}
                >
                  <Text style={[styles.timeRangeLabel, chartRange === key && styles.timeRangeLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <WeightChart
              entries={chartEntries}
              displayUnit={displayUnit}
              goalWeight={goal ? (goal.unit === displayUnit ? goal.targetWeight : WeightCalculator.convertWeight(goal.targetWeight, goal.unit, displayUnit)) : undefined}
              colors={colors}
            />
          </View>

          {/* Goal Progress */}
          {goal && stats && (
            <View style={styles.goalCard}>
              <Text style={styles.cardTitle}>Goal Progress</Text>
              <View style={styles.goalInfoRow}>
                <Text style={styles.goalLabel}>
                  Target: {goal.targetWeight} {goal.unit}
                </Text>
                <Text style={styles.goalLabel}>
                  {WeightCalculator.getGoalProgress(goal, stats.currentWeight, displayUnit)}%
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(WeightCalculator.getGoalProgress(goal, stats.currentWeight, displayUnit), 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.motivationalText}>
                {WeightCalculator.getMotivationalMessage(goal, stats.currentWeight, displayUnit)}
              </Text>
            </View>
          )}

          {/* Log Weight Button */}
          <TouchableOpacity style={styles.logButton} onPress={openNewEntry} activeOpacity={0.8}>
            <Text style={styles.logButtonText}>+ Log Weight</Text>
          </TouchableOpacity>

          {/* Recent Entries */}
          <View style={styles.historyCard}>
            <Text style={styles.cardTitle}>Recent Entries</Text>
            {recentEntries.length === 0 ? (
              <Text style={styles.noDataText}>No entries yet</Text>
            ) : (
              recentEntries.map((entry, index) => {
                const prevEntry = recentEntries[index + 1];
                let change: number | null = null;
                if (prevEntry) {
                  const prevWeight = prevEntry.unit === entry.unit
                    ? prevEntry.weight
                    : WeightCalculator.convertWeight(prevEntry.weight, prevEntry.unit, entry.unit);
                  change = Math.round((entry.weight - prevWeight) * 10) / 10;
                }

                return (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.historyItem}
                    onPress={() => handleEntryAction(entry)}
                  >
                    <View style={styles.historyLeft}>
                      <Text style={styles.historyDate}>{formatDateDisplay(entry.date)}</Text>
                      {entry.notes ? (
                        <Text style={styles.historyNotes} numberOfLines={1}>{entry.notes}</Text>
                      ) : null}
                    </View>
                    <View style={styles.historyRight}>
                      <Text style={styles.historyWeight}>
                        {entry.weight} {entry.unit}
                      </Text>
                      {change !== null && (
                        <Text style={[
                          styles.historyChange,
                          { color: change < 0 ? colors.success : change > 0 ? colors.warning : colors.textMuted },
                        ]}>
                          {change > 0 ? '▲' : change < 0 ? '▼' : '='}{Math.abs(change)}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <View style={{ height: spacing.xxxl }} />
        </ScrollView>

        {/* Log Entry Modal */}
        <Modal
          visible={showEntryModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEntryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Weight' : 'Log Weight'}</Text>
              <Text style={styles.modalDate}>
                {entryDate ? new Date(entryDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </Text>

              {/* Weight Input with +/– */}
              <View style={styles.weightInputRow}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustWeight(-0.5)}>
                  <Text style={styles.adjustBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.weightInput}
                  value={entryWeight}
                  onChangeText={setEntryWeight}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustWeight(0.5)}>
                  <Text style={styles.adjustBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Unit Toggle */}
              <View style={styles.unitToggleRow}>
                {(['lbs', 'kg'] as WeightUnit[]).map(u => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.unitBtn, entryUnit === u && styles.unitBtnActive]}
                    onPress={() => setEntryUnit(u)}
                  >
                    <Text style={[styles.unitBtnText, entryUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={entryDate}
                  onChangeText={setEntryDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={entryNotes}
                  onChangeText={setEntryNotes}
                  placeholder="e.g., Morning weight"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowEntryModal(false)}>
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} onPress={handleSaveEntry}>
                  <Text style={styles.modalButtonSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Goal Modal */}
        <Modal
          visible={showGoalModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowGoalModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Weight Goal</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Weight</Text>
                <View style={styles.goalInputRow}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={goalTarget}
                    onChangeText={setGoalTarget}
                    keyboardType="decimal-pad"
                    placeholder="e.g., 175"
                    placeholderTextColor={colors.textMuted}
                  />
                  <View style={styles.unitToggleRow}>
                    {(['lbs', 'kg'] as WeightUnit[]).map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitBtn, goalUnit === u && styles.unitBtnActive]}
                        onPress={() => setGoalUnit(u)}
                      >
                        <Text style={[styles.unitBtnText, goalUnit === u && styles.unitBtnTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Goal Type</Text>
                <View style={styles.goalTypeRow}>
                  {GOAL_TYPES.map(({ key, label }) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.goalTypeBtn, goalType === key && styles.goalTypeBtnActive]}
                      onPress={() => setGoalType(key)}
                    >
                      <Text style={[styles.goalTypeText, goalType === key && styles.goalTypeTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Target Date (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={goalTargetDate}
                  onChangeText={setGoalTargetDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} onPress={() => setShowGoalModal(false)}>
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} onPress={handleSaveGoal}>
                  <Text style={styles.modalButtonSaveText}>Save Goal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <ActiveWorkoutBanner navigation={navigation} currentScreen="WeightTracking" />
      </View>
    </SafeAreaView>
  );
}

/* ─── Inline Chart Component ─── */

function WeightChart({
  entries,
  displayUnit,
  goalWeight,
  colors,
}: {
  entries: { weight: number; unit: string; date: string }[];
  displayUnit: WeightUnit;
  goalWeight?: number;
  colors: any;
}) {
  const CHART_HEIGHT = 160;
  const BAR_MIN_HEIGHT = 4;

  if (entries.length === 0) {
    return (
      <View style={{ height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>No data for this range</Text>
      </View>
    );
  }

  const weights = entries.map(e =>
    e.unit === displayUnit ? e.weight : WeightCalculator.convertWeight(e.weight, e.unit as WeightUnit, displayUnit)
  );

  const allValues = goalWeight ? [...weights, goalWeight] : weights;
  const min = Math.min(...allValues) - 1;
  const max = Math.max(...allValues) + 1;
  const range = max - min || 1;

  const goalY = goalWeight ? ((goalWeight - min) / range) * CHART_HEIGHT : null;

  const maxBars = 30;
  const displayEntries = entries.length > maxBars ? entries.slice(-maxBars) : entries;
  const displayWeights = displayEntries.map(e =>
    e.unit === displayUnit ? e.weight : WeightCalculator.convertWeight(e.weight, e.unit as WeightUnit, displayUnit)
  );

  return (
    <View style={{ height: CHART_HEIGHT + 28, marginTop: 12, position: 'relative' }}>
      {/* Goal line */}
      {goalY !== null && (
        <View
          style={{
            position: 'absolute',
            bottom: 28 + goalY,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: colors.danger,
            zIndex: 2,
          }}
        />
      )}
      {goalY !== null && (
        <Text
          style={{
            position: 'absolute',
            bottom: 28 + goalY + 2,
            right: 0,
            fontSize: 10,
            color: colors.danger,
            zIndex: 3,
          }}
        >
          Goal
        </Text>
      )}

      {/* Bars */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          height: CHART_HEIGHT,
          gap: 2,
          paddingHorizontal: 2,
        }}
      >
        {displayWeights.map((w, i) => {
          const h = Math.max(((w - min) / range) * CHART_HEIGHT, BAR_MIN_HEIGHT);
          const isLatest = i === displayWeights.length - 1;
          return (
            <View
              key={displayEntries[i].date + '-' + i}
              style={{
                flex: 1,
                height: h,
                backgroundColor: isLatest ? colors.primary : colors.primary + '80',
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
                minWidth: 4,
              }}
            />
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }}>
        <Text style={{ fontSize: 10, color: colors.textMuted }}>
          {formatShortDate(displayEntries[0].date)}
        </Text>
        <Text style={{ fontSize: 10, color: colors.textMuted }}>
          {formatShortDate(displayEntries[displayEntries.length - 1].date)}
        </Text>
      </View>
    </View>
  );
}

/* ─── Helpers ─── */

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Styles ─── */

const createStyles = (colors: any, _isDarkMode: boolean) =>
  StyleSheet.create({
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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      fontSize: 28,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      ...typography.title2,
      color: colors.text,
    },
    settingsIcon: {
      fontSize: 24,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    /* Summary */
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    cardTitle: {
      ...typography.headline,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    currentWeight: {
      ...typography.title1,
      color: colors.primary,
      fontWeight: 'bold',
    },
    trendBadge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    trendText: {
      ...typography.callout,
      fontWeight: '600',
    },
    miniStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    miniStat: {
      alignItems: 'center',
    },
    miniStatValue: {
      ...typography.callout,
      color: colors.text,
      fontWeight: '600',
    },
    miniStatLabel: {
      ...typography.caption1,
      color: colors.textSecondary,
      marginTop: 2,
    },
    /* Chart */
    chartCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    timeRangeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    timeRangeBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
    },
    timeRangeBtnActive: {
      backgroundColor: colors.primary,
    },
    timeRangeLabel: {
      ...typography.caption1,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    timeRangeLabelActive: {
      color: colors.textOnPrimary,
    },
    /* Goal */
    goalCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    goalInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    goalLabel: {
      ...typography.callout,
      color: colors.textSecondary,
    },
    progressBarBg: {
      height: 8,
      backgroundColor: colors.background,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 8,
      borderRadius: 4,
    },
    motivationalText: {
      ...typography.footnote,
      color: colors.primary,
      marginTop: spacing.sm,
      fontWeight: '600',
      textAlign: 'center',
    },
    /* Log Button */
    logButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    logButtonText: {
      ...typography.headline,
      color: colors.textOnPrimary,
    },
    /* History */
    historyCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyLeft: {
      flex: 1,
    },
    historyDate: {
      ...typography.callout,
      color: colors.text,
      fontWeight: '600',
    },
    historyNotes: {
      ...typography.caption1,
      color: colors.textMuted,
      marginTop: 2,
    },
    historyRight: {
      alignItems: 'flex-end',
    },
    historyWeight: {
      ...typography.callout,
      color: colors.text,
      fontWeight: '600',
    },
    historyChange: {
      ...typography.caption1,
      fontWeight: '600',
      marginTop: 2,
    },
    noDataText: {
      ...typography.callout,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    /* Modal shared */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.xl,
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      ...typography.title2,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    modalDate: {
      ...typography.callout,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    /* Weight input with +/– */
    weightInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    adjustBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    adjustBtnText: {
      fontSize: 24,
      color: colors.primary,
      fontWeight: '600',
    },
    weightInput: {
      ...typography.title1,
      color: colors.text,
      textAlign: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      paddingVertical: spacing.sm,
      minWidth: 100,
    },
    /* Unit toggle */
    unitToggleRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    unitBtn: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unitBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    unitBtnText: {
      ...typography.callout,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    unitBtnTextActive: {
      color: colors.textOnPrimary,
    },
    /* Goal modal */
    goalInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    goalTypeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    goalTypeBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    goalTypeBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    goalTypeText: {
      ...typography.caption1,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    goalTypeTextActive: {
      color: colors.textOnPrimary,
    },
    /* Shared input styles */
    inputGroup: {
      marginBottom: spacing.lg,
    },
    inputLabel: {
      ...typography.callout,
      color: colors.text,
      marginBottom: spacing.sm,
      fontWeight: '600',
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      ...typography.body,
      color: colors.text,
    },
    textArea: {
      minHeight: 60,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtonCancelText: {
      ...typography.callout,
      color: colors.text,
      fontWeight: '600',
    },
    modalButtonSave: {
      backgroundColor: colors.primary,
    },
    modalButtonSaveText: {
      ...typography.callout,
      color: colors.textOnPrimary,
      fontWeight: '600',
    },
  });
