import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useNutritionContext } from '../context/NutritionContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';

export function NutritionScreen({ navigation }: any) {
  const { goals, saveEntry, saveGoals, getEntryByDate } = useNutritionContext();
  const { isDarkMode, colors } = useTheme();
  
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [notes, setNotes] = useState('');
  
  const [goalCalories, setGoalCalories] = useState(goals?.dailyCalories.toString() || '');
  const [goalProtein, setGoalProtein] = useState(goals?.dailyProtein.toString() || '');

  const todayEntry = getEntryByDate(new Date().toISOString().split('T')[0]);

  const handleSaveEntry = async () => {
    const cal = parseInt(calories, 10);
    const prot = parseInt(protein, 10);

    if (!cal || cal <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid calories');
      return;
    }

    if (!prot || prot < 0) {
      Alert.alert('Invalid Input', 'Please enter valid protein amount');
      return;
    }

    try {
      await saveEntry(selectedDate, cal, prot, notes);
      setCalories('');
      setProtein('');
      setNotes('');
      setShowEntryModal(false);
      Alert.alert('Success', 'Nutrition entry saved');
    } catch {
      Alert.alert('Error', 'Failed to save entry');
    }
  };

  const handleSaveGoals = async () => {
    const cal = parseInt(goalCalories, 10);
    const prot = parseInt(goalProtein, 10);

    if (!cal || cal <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid calorie goal');
      return;
    }

    if (!prot || prot < 0) {
      Alert.alert('Invalid Input', 'Please enter valid protein goal');
      return;
    }

    try {
      await saveGoals(cal, prot);
      setShowGoalsModal(false);
      Alert.alert('Success', 'Goals saved');
    } catch {
      Alert.alert('Error', 'Failed to save goals');
    }
  };

  const openEntryModal = (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    setSelectedDate(targetDate);
    
    const existingEntry = getEntryByDate(targetDate);
    if (existingEntry) {
      setCalories(existingEntry.calories.toString());
      setProtein(existingEntry.protein.toString());
      setNotes(existingEntry.notes || '');
    } else {
      setCalories('');
      setProtein('');
      setNotes('');
    }
    
    setShowEntryModal(true);
  };

  const openGoalsModal = () => {
    setGoalCalories(goals?.dailyCalories.toString() || '2500');
    setGoalProtein(goals?.dailyProtein.toString() || '150');
    setShowGoalsModal(true);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  const weekEntries = last7Days.map(date => ({
    date,
    entry: getEntryByDate(date),
  }));

  const weeklyCalories = weekEntries.reduce((sum, { entry }) => sum + (entry?.calories || 0), 0);
  const weeklyProtein = weekEntries.reduce((sum, { entry }) => sum + (entry?.protein || 0), 0);
  const avgDailyCalories = Math.round(weeklyCalories / 7);
  const avgDailyProtein = Math.round(weeklyProtein / 7);

  const styles = createStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nutrition</Text>
          <TouchableOpacity onPress={openGoalsModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.settingsIcon}>🎯</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {goals && (
            <View style={styles.goalsCard}>
              <Text style={styles.goalsTitle}>Daily Goals</Text>
              <View style={styles.goalsRow}>
                <View style={styles.goalItem}>
                  <Text style={styles.goalValue}>{goals.dailyCalories}</Text>
                  <Text style={styles.goalLabel}>Calories</Text>
                </View>
                <View style={styles.goalItem}>
                  <Text style={styles.goalValue}>{goals.dailyProtein}g</Text>
                  <Text style={styles.goalLabel}>Protein</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text style={styles.todayTitle}>Today</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => openEntryModal()}
              >
                <Text style={styles.addButtonText}>
                  {todayEntry ? 'Edit' : 'Log'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {todayEntry ? (
              <View>
                <View style={styles.todayStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{todayEntry.calories}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                    {goals && (
                      <Text style={styles.statProgress}>
                        {Math.round((todayEntry.calories / goals.dailyCalories) * 100)}%
                      </Text>
                    )}
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{todayEntry.protein}g</Text>
                    <Text style={styles.statLabel}>Protein</Text>
                    {goals && (
                      <Text style={styles.statProgress}>
                        {Math.round((todayEntry.protein / goals.dailyProtein) * 100)}%
                      </Text>
                    )}
                  </View>
                </View>
                {todayEntry.notes && (
                  <Text style={styles.notesText}>{todayEntry.notes}</Text>
                )}
              </View>
            ) : (
              <Text style={styles.noDataText}>No entry logged today</Text>
            )}
          </View>

          <View style={styles.weekCard}>
            <Text style={styles.weekTitle}>Last 7 Days</Text>
            <View style={styles.weekStats}>
              <View style={styles.weekStatItem}>
                <Text style={styles.weekStatLabel}>Avg Calories</Text>
                <Text style={styles.weekStatValue}>{avgDailyCalories}</Text>
              </View>
              <View style={styles.weekStatItem}>
                <Text style={styles.weekStatLabel}>Avg Protein</Text>
                <Text style={styles.weekStatValue}>{avgDailyProtein}g</Text>
              </View>
            </View>

            <View style={styles.weekList}>
              {weekEntries.reverse().map(({ date, entry }) => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <TouchableOpacity
                    key={date}
                    style={styles.weekItem}
                    onPress={() => openEntryModal(date)}
                  >
                    <View style={styles.weekItemLeft}>
                      <Text style={styles.weekItemDay}>{dayName}</Text>
                      <Text style={styles.weekItemDate}>{dateStr}</Text>
                    </View>
                    {entry ? (
                      <View style={styles.weekItemRight}>
                        <Text style={styles.weekItemValue}>{entry.calories} cal</Text>
                        <Text style={styles.weekItemValue}>{entry.protein}g protein</Text>
                      </View>
                    ) : (
                      <Text style={styles.weekItemEmpty}>Not logged</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <Modal
          visible={showEntryModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEntryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log Nutrition</Text>
              <Text style={styles.modalDate}>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="e.g., 2500"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  placeholder="e.g., 150"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowEntryModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveEntry}
                >
                  <Text style={styles.modalButtonSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showGoalsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowGoalsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Daily Goals</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Calorie Goal</Text>
                <TextInput
                  style={styles.input}
                  value={goalCalories}
                  onChangeText={setGoalCalories}
                  keyboardType="numeric"
                  placeholder="e.g., 2500"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Protein Goal (g)</Text>
                <TextInput
                  style={styles.input}
                  value={goalProtein}
                  onChangeText={setGoalProtein}
                  keyboardType="numeric"
                  placeholder="e.g., 150"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowGoalsModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveGoals}
                >
                  <Text style={styles.modalButtonSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

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
    goalsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    goalsTitle: {
      ...typography.headline,
      color: colors.text,
      marginBottom: spacing.md,
    },
    goalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    goalItem: {
      alignItems: 'center',
    },
    goalValue: {
      ...typography.title1,
      color: colors.primary,
      fontWeight: 'bold',
    },
    goalLabel: {
      ...typography.footnote,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    todayCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
    },
    todayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    todayTitle: {
      ...typography.headline,
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.sm,
    },
    addButtonText: {
      color: colors.textOnPrimary,
      ...typography.callout,
      fontWeight: '600',
    },
    todayStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.sm,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      ...typography.title2,
      color: colors.text,
      fontWeight: 'bold',
    },
    statLabel: {
      ...typography.footnote,
      color: colors.textSecondary,
      marginTop: spacing.xs,
    },
    statProgress: {
      ...typography.caption1,
      color: colors.primary,
      marginTop: spacing.xs,
      fontWeight: '600',
    },
    notesText: {
      ...typography.callout,
      color: colors.textSecondary,
      marginTop: spacing.md,
      fontStyle: 'italic',
    },
    noDataText: {
      ...typography.callout,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    weekCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    weekTitle: {
      ...typography.headline,
      color: colors.text,
      marginBottom: spacing.md,
    },
    weekStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.md,
    },
    weekStatItem: {
      alignItems: 'center',
    },
    weekStatLabel: {
      ...typography.footnote,
      color: colors.textSecondary,
    },
    weekStatValue: {
      ...typography.title3,
      color: colors.text,
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    weekList: {
      marginTop: spacing.sm,
    },
    weekItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    weekItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    weekItemDay: {
      ...typography.callout,
      color: colors.text,
      fontWeight: '600',
      width: 40,
    },
    weekItemDate: {
      ...typography.callout,
      color: colors.textSecondary,
    },
    weekItemRight: {
      alignItems: 'flex-end',
    },
    weekItemValue: {
      ...typography.callout,
      color: colors.text,
    },
    weekItemEmpty: {
      ...typography.callout,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
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
      minHeight: 80,
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
