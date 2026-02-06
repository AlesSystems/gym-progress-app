import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from './src/ui/screens/DashboardScreen';
import { ActiveWorkoutScreen } from './src/ui/screens/ActiveWorkoutScreen';
import { WorkoutProvider } from './src/ui/context/WorkoutContext';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <WorkoutProvider>
        <NavigationContainer>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </WorkoutProvider>
    </SafeAreaProvider>
  );
}

export default App;
