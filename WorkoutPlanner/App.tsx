import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from './src/ui/screens/DashboardScreen';
import { ActiveWorkoutScreen } from './src/ui/screens/ActiveWorkoutScreen';
import { HistoryScreen } from './src/ui/screens/HistoryScreen';
import { WorkoutDetailScreen } from './src/ui/screens/WorkoutDetailScreen';
import { StatsScreen } from './src/ui/screens/StatsScreen';
import { ExerciseDetailScreen } from './src/ui/screens/ExerciseDetailScreen';
import { SettingsScreen } from './src/ui/screens/SettingsScreen';
import { NutritionScreen } from './src/ui/screens/NutritionScreen';
import { LeaderboardScreen } from './src/ui/screens/LeaderboardScreen';
import { WeightTrackingScreen } from './src/ui/screens/WeightTrackingScreen';
import { AuthProvider } from './src/ui/context/AuthContext';
import { WorkoutProvider } from './src/ui/context/WorkoutContext';
import { NutritionProvider } from './src/ui/context/NutritionContext';
import { ThemeProvider, useTheme } from './src/ui/context/ThemeContext';
import { AlertProvider } from './src/ui/utils/Alert';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { isDarkMode } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Nutrition" component={NutritionScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="WeightTracking" component={WeightTrackingScreen} />
      </Stack.Navigator>
    </>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <AuthProvider>
            <WorkoutProvider>
              <NutritionProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </NutritionProvider>
            </WorkoutProvider>
          </AuthProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
