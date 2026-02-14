import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useWorkoutContext } from '../context/WorkoutContext';
import { useTheme } from '../context/ThemeContext';

export function DashboardScreen({ navigation }: any) {
  const { activeWorkout, workoutHistory, templates, startWorkout, discardWorkout } = useWorkoutContext();
  const { isDarkMode } = useTheme();
  const [showTemplates, setShowTemplates] = React.useState(false);

  React.useEffect(() => {
    if (activeWorkout && !activeWorkout.isCompleted) {
      const timeSinceStart = activeWorkout.startTime
        ? Date.now() - new Date(activeWorkout.startTime).getTime()
        : 0;
      
      if (timeSinceStart > 0) {
        Alert.alert(
          'Resume Workout',
          `You have an unfinished workout from ${formatTime(timeSinceStart)} ago. Would you like to resume?`,
          [
            { text: 'Discard', onPress: discardWorkout, style: 'destructive' },
            { text: 'Resume', onPress: () => navigation.navigate('ActiveWorkout') },
          ]
        );
      }
    }
  }, []);

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

  const styles = createStyles(isDarkMode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Workout Planner</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
          activeOpacity={0.8}
        >
          <Text style={styles.historyButtonText}>View History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statsButton}
          onPress={() => navigation.navigate('Stats')}
          activeOpacity={0.8}
        >
          <Text style={styles.statsButtonText}>Progress & Stats</Text>
        </TouchableOpacity>

        {lastWorkout && (
          <View style={styles.lastWorkoutCard}>
            <Text style={styles.cardTitle}>Last Workout</Text>
            <Text style={styles.cardDate}>
              {formatDate(lastWorkout.date)}
            </Text>
            <Text style={styles.cardStats}>
              {lastWorkout.exercises.length} exercises • {getTotalSets(lastWorkout)} sets
            </Text>
          </View>
        )}

        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Quick Stats</Text>
          <Text style={styles.statText}>
            Total Workouts: {workoutHistory.filter(w => w.isCompleted).length}
          </Text>
          <Text style={styles.statText}>
            Templates: {templates.length}
          </Text>
        </View>

        {showTemplates && templates.length > 0 && (
          <View style={styles.templatesCard}>
            <Text style={styles.cardTitle}>Select Template</Text>
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
        )}
      </ScrollView>
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

function createStyles(isDarkMode: boolean) {
  const bg = isDarkMode ? '#000000' : '#FFFFFF';
  const bgSecondary = isDarkMode ? '#1C1C1E' : '#F5F5F5';
  const surface = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const text = isDarkMode ? '#FFFFFF' : '#333333';
  const textSecondary = isDarkMode ? '#8E8E93' : '#666666';
  const textMuted = isDarkMode ? '#636366' : '#999999';
  const border = isDarkMode ? '#333333' : '#E0E0E0';

  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: bg,
  },
  container: {
    flex: 1,
    backgroundColor: bgSecondary,
  },
  header: {
    backgroundColor: bg,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 5,
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: text,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsButton: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  statsButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '600',
  },
  lastWorkoutCard: {
    backgroundColor: surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsCard: {
    backgroundColor: surface,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: text,
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 16,
    color: textSecondary,
    marginBottom: 5,
  },
  cardStats: {
    fontSize: 14,
    color: textMuted,
  },
  statText: {
    fontSize: 16,
    color: textSecondary,
    marginBottom: 5,
  },
  templatesCard: {
    backgroundColor: surface,
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateButton: {
    backgroundColor: bgSecondary,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: text,
  },
  templateInfo: {
    fontSize: 14,
    color: textSecondary,
    marginTop: 4,
  },
  cancelTemplateButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
  },
  cancelTemplateText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
}
