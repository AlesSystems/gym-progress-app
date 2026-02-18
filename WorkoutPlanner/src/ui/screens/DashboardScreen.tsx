import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useTheme } from '../context/ThemeContext';
import { spacing, borderRadius, typography } from '../theme';
import { Alert } from '../utils/Alert';
import { ActiveWorkoutBanner } from '../components/ActiveWorkoutBanner';

export function DashboardScreen({ navigation }: any) {
  const { activeWorkout, workoutHistory, templates, startWorkout, discardWorkout } = useWorkoutContext();
  const { isDarkMode, colors } = useTheme();
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [hasShownResumeDialog, setHasShownResumeDialog] = React.useState(false);

  React.useEffect(() => {
    // Show resume dialog when coming back to Dashboard with an active workout
    if (activeWorkout && !activeWorkout.isCompleted && !hasShownResumeDialog) {
      const timeSinceStart = activeWorkout.startTime
        ? Date.now() - new Date(activeWorkout.startTime).getTime()
        : 0;
      
      if (timeSinceStart > 0) {
        Alert.alert(
          'Resume Workout',
          `You have an unfinished workout from ${formatTime(timeSinceStart)} ago. Would you like to resume?`,
          [
            { 
              text: 'Discard', 
              onPress: () => {
                discardWorkout();
                setHasShownResumeDialog(false);
              }, 
              style: 'destructive' 
            },
            { 
              text: 'Resume', 
              onPress: () => navigation.navigate('ActiveWorkout') 
            },
          ]
        );
        setHasShownResumeDialog(true);
      }
    }
    
    // Reset the flag when there's no active workout
    if (!activeWorkout) {
      setHasShownResumeDialog(false);
    }
  }, [activeWorkout, hasShownResumeDialog, navigation, discardWorkout]);

  const handleStartWorkout = async () => {
    if (templates.length > 0) {
      Alert.alert(
        'Start Workout',
        'Would you like to start from a template or create a new workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'New Workout', onPress: startNewWorkout },
          { text: 'Use Template', onPress: () => setShowTemplates(true) },
        ]
      );
    } else {
      await startNewWorkout();
    }
  };

  const startNewWorkout = async () => {
    await startWorkout();
    navigation.navigate('ActiveWorkout');
  };

  const startFromTemplate = async (templateId: string) => {
    await startWorkout(templateId);
    setShowTemplates(false);
    navigation.navigate('ActiveWorkout');
  };

  const lastWorkout = workoutHistory
    .filter(w => w.isCompleted)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const styles = createStyles(colors, isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome Back</Text>
            <Text style={styles.title}>Workout Planner</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
          <Text style={styles.startButtonSubtext}>Start a new empty session</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('History')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionButtonText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Stats')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionButtonText}>Stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Nutrition')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>🍎</Text>
            <Text style={styles.actionButtonText}>Nutrition</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionButtonText}>Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('WeightTracking')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>⚖️</Text>
            <Text style={styles.actionButtonText}>Weight</Text>
          </TouchableOpacity>
        </View>

        {lastWorkout && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Session</Text>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Workout</Text>
                <Text style={styles.cardDate}>{formatDate(lastWorkout.date)}</Text>
              </View>
              <Text style={styles.cardStats}>
                {lastWorkout.exercises.length} Exercises • {getTotalSets(lastWorkout)} Sets
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { marginRight: spacing.sm }]}>
              <Text style={styles.statValue}>{workoutHistory.filter(w => w.isCompleted).length}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={[styles.statCard, { marginLeft: spacing.sm }]}>
              <Text style={styles.statValue}>{templates.length}</Text>
              <Text style={styles.statLabel}>Templates</Text>
            </View>
          </View>
        </View>

        {showTemplates && templates.length > 0 && (
          <View style={styles.templatesOverlay}>
            <View style={styles.templatesCard}>
              <Text style={styles.overlayTitle}>Select Template</Text>
              {templates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateButton}
                  onPress={() => startFromTemplate(template.id)}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateInfo}>
                    {template.exercises.length} exercises
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.cancelTemplateButton}
                onPress={() => setShowTemplates(false)}
              >
                <Text style={styles.cancelTemplateText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      <ActiveWorkoutBanner navigation={navigation} currentScreen="Dashboard" />
      </View>
    </SafeAreaView>
  );
}

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTotalSets(workout: any): number {
  return workout.exercises.reduce((sum: number, ex: any) => sum + ex.sets.length, 0);
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.subheadline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.largeTitle,
    color: colors.text,
  },
  settingsButton: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
  },
  settingsIcon: {
    fontSize: 20,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  startButton: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  startButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  leaderboardButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.title3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardStats: {
    fontSize: 14,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  templatesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  templatesCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  overlayTitle: {
    ...typography.title2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  templateButton: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  templateInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cancelTemplateButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelTemplateText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
}
