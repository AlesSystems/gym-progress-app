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
  TextInput,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';
import { LeaderboardTimeframe, LeaderboardEntry } from '../../data/models/Leaderboard';

export function LeaderboardScreen({ navigation }: any) {
  const { workoutHistory } = useWorkoutContext();
  const { colors, isDarkMode } = useTheme();
  const {
    leaderboard,
    timeframe,
    displayName,
    isLoading,
    error,
    updateDisplayName,
    changeTimeframe,
    refresh,
  } = useLeaderboard(workoutHistory);

  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleSetDisplayName = useCallback(async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    try {
      await updateDisplayName(nameInput.trim());
      setShowNameInput(false);
      setNameInput('');
      Alert.alert('Success', 'Display name updated!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update name');
    }
  }, [nameInput, updateDisplayName]);

  const handleTimeframeChange = useCallback(
    (newTimeframe: LeaderboardTimeframe) => {
      changeTimeframe(newTimeframe);
    },
    [changeTimeframe]
  );

  const currentUserEntry = useMemo(() => {
    return leaderboard?.leaderboard.find(entry => entry.isCurrentUser);
  }, [leaderboard]);

  const renderLeaderboardEntry = useCallback(
    ({ item }: { item: LeaderboardEntry }) => {
      const isTop3 = item.rank <= 3;
      const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '';
      
      return (
        <View
          style={[
            styles.entryCard,
            item.isCurrentUser && styles.currentUserCard,
          ]}
        >
          <View style={styles.entryRank}>
            {isTop3 ? (
              <Text style={styles.medalText}>{medal}</Text>
            ) : (
              <Text style={styles.rankText}>#{item.rank}</Text>
            )}
          </View>
          <View style={styles.entryContent}>
            <Text
              style={[
                styles.displayName,
                item.isCurrentUser && styles.currentUserText,
              ]}
            >
              {item.displayName}
              {item.isCurrentUser && ' (You)'}
            </Text>
            <Text style={styles.statsText}>
              {item.stats.totalWorkouts} workouts · {Math.round(item.stats.totalWeightLifted / 1000)}k lbs · {item.stats.currentStreak} day streak
            </Text>
          </View>
          <Text
            style={[
              styles.scoreText,
              item.isCurrentUser && styles.currentUserScore,
            ]}
          >
            {item.score.toLocaleString()}
          </Text>
        </View>
      );
    },
    [styles]
  );

  const renderHeader = useCallback(() => {
    return (
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        
        {/* Timeframe Filter */}
        <View style={styles.timeframeContainer}>
          {(['daily', 'weekly', 'monthly', 'all-time'] as LeaderboardTimeframe[]).map(tf => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                timeframe === tf && styles.timeframeButtonActive,
              ]}
              onPress={() => handleTimeframeChange(tf)}
            >
              <Text
                style={[
                  styles.timeframeText,
                  timeframe === tf && styles.timeframeTextActive,
                ]}
              >
                {tf === 'all-time' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Display Name Section */}
        {!displayName ? (
          <View style={styles.namePromptCard}>
            <Text style={styles.namePromptTitle}>Join the Competition!</Text>
            <Text style={styles.namePromptText}>
              Set your display name to appear on the leaderboard
            </Text>
            <TouchableOpacity
              style={styles.setPrimaryButton}
              onPress={() => setShowNameInput(true)}
            >
              <Text style={styles.buttonText}>Set Display Name</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userStatsCard}>
            <Text style={styles.userStatsTitle}>Your Stats</Text>
            {currentUserEntry && (
              <>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Rank:</Text>
                  <Text style={styles.statValue}>#{currentUserEntry.rank}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Score:</Text>
                  <Text style={styles.statValue}>{currentUserEntry.score.toLocaleString()} pts</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Workouts:</Text>
                  <Text style={styles.statValue}>{currentUserEntry.stats.totalWorkouts}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Streak:</Text>
                  <Text style={styles.statValue}>{currentUserEntry.stats.currentStreak} days 🔥</Text>
                </View>
              </>
            )}
            <TouchableOpacity
              style={styles.changeNameButton}
              onPress={() => setShowNameInput(true)}
            >
              <Text style={styles.changeNameText}>Change Name</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    );
  }, [styles, displayName, timeframe, currentUserEntry, handleTimeframeChange]);

  if (isLoading && !leaderboard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.content}>
        <FlatList
          data={leaderboard?.leaderboard || []}
          renderItem={renderLeaderboardEntry}
          keyExtractor={(item) => item.userId}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Name Input Modal */}
      {showNameInput && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Display Name</Text>
            <Text style={styles.modalSubtitle}>
              Choose a name to show on the leaderboard (2-20 characters)
            </Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name..."
              placeholderTextColor={colors.textMuted}
              maxLength={20}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowNameInput(false);
                  setNameInput('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonSave}
                onPress={handleSetDisplayName}
              >
                <Text style={styles.modalButtonSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingBottom: spacing.xxxl,
    },
    header: {
      padding: spacing.lg,
    },
    title: {
      ...typography.largeTitle,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    timeframeContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    timeframeButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeframeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timeframeText: {
      ...typography.footnote,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    timeframeTextActive: {
      color: colors.textOnPrimary,
    },
    namePromptCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    namePromptTitle: {
      ...typography.title3,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    namePromptText: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    setPrimaryButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    buttonText: {
      ...typography.headline,
      color: colors.textOnPrimary,
    },
    userStatsCard: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    userStatsTitle: {
      ...typography.title3,
      color: colors.text,
      marginBottom: spacing.md,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    statLabel: {
      ...typography.body,
      color: colors.textSecondary,
    },
    statValue: {
      ...typography.body,
      color: colors.text,
      fontWeight: '600',
    },
    changeNameButton: {
      marginTop: spacing.md,
      alignItems: 'center',
    },
    changeNameText: {
      ...typography.callout,
      color: colors.primary,
    },
    entryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    currentUserCard: {
      backgroundColor: colors.surfaceHighlight,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    entryRank: {
      width: 50,
      alignItems: 'center',
    },
    medalText: {
      fontSize: 24,
    },
    rankText: {
      ...typography.headline,
      color: colors.textSecondary,
    },
    entryContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
    displayName: {
      ...typography.headline,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    currentUserText: {
      color: colors.primary,
    },
    statsText: {
      ...typography.footnote,
      color: colors.textSecondary,
    },
    scoreText: {
      ...typography.title3,
      color: colors.text,
      fontWeight: '600',
    },
    currentUserScore: {
      color: colors.primary,
    },
    backButton: {
      position: 'absolute',
      top: spacing.lg + (StatusBar.currentHeight || 0),
      left: spacing.lg,
      width: 40,
      height: 40,
      borderRadius: borderRadius.round,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 24,
      color: colors.text,
    },
    modal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      ...typography.title2,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    modalSubtitle: {
      ...typography.body,
      color: colors.textSecondary,
      marginBottom: spacing.lg,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      ...typography.body,
      color: colors.text,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    modalButtonCancel: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    modalButtonCancelText: {
      ...typography.headline,
      color: colors.text,
    },
    modalButtonSave: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.sm,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    modalButtonSaveText: {
      ...typography.headline,
      color: colors.textOnPrimary,
    },
  });
}
