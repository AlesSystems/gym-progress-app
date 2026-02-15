import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { WorkoutCard } from '../components/WorkoutCard';
import { CalendarView } from '../components/CalendarView';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';

type ViewMode = 'list' | 'calendar';

export function HistoryScreen({ navigation }: any) {
  const {
    workouts,
    isLoading,
    refreshHistory,
    deleteWorkout,
    duplicateWorkout,
  } = useWorkoutHistory();
  const { colors, isDarkMode } = useTheme();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshHistory();
    setRefreshing(false);
  }, [refreshHistory]);

  const handleDeleteWorkout = useCallback(
    (workoutId: string) => {
      Alert.alert(
        'Delete Workout',
        'Are you sure you want to delete this workout? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteWorkout(workoutId);
            },
          },
        ]
      );
    },
    [deleteWorkout]
  );

  const handleDuplicateWorkout = useCallback(
    async (workoutId: string) => {
      await duplicateWorkout(workoutId);
      Alert.alert('Success', 'Workout duplicated and ready to start!');
    },
    [duplicateWorkout]
  );

  const handleWorkoutPress = useCallback(
    (workoutId: string) => {
      navigation.navigate('WorkoutDetail', { workoutId });
    },
    [navigation]
  );

  const renderWorkoutCard = useCallback(
    ({ item }: any) => (
      <WorkoutCard
        workout={item}
        onPress={() => handleWorkoutPress(item.id)}
        onDelete={() => handleDeleteWorkout(item.id)}
        onDuplicate={() => handleDuplicateWorkout(item.id)}
      />
    ),
    [handleWorkoutPress, handleDeleteWorkout, handleDuplicateWorkout]
  );

  const styles = createStyles(colors, isDarkMode);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No workouts yet</Text>
        <Text style={styles.emptySubtext}>
          Start your first workout to see it here!
        </Text>
      </View>
    ),
    [styles]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Dashboard')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>History</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.viewToggleContainer}>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'list' && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('list')}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'list' && styles.toggleTextActive,
                ]}
              >
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'calendar' && styles.toggleButtonActive,
              ]}
              onPress={() => setViewMode('calendar')}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'calendar' && styles.toggleTextActive,
                ]}
              >
                Calendar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'list' ? (
          <FlatList
            data={workouts}
            renderItem={renderWorkoutCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={ListEmptyComponent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        ) : (
          <CalendarView
            workouts={workouts}
            onWorkoutPress={handleWorkoutPress}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
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
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      paddingVertical: spacing.xs,
    },
    backButtonText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
    title: {
      ...typography.title3,
      color: colors.text,
    },
    headerSpacer: {
      width: 80, // Approximate width of back button to center title
    },
    viewToggleContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
    },
    viewToggle: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: borderRadius.sm - 2,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    toggleTextActive: {
      color: colors.textOnPrimary,
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 100,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
