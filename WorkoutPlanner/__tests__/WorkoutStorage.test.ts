import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutStorage } from '../../src/data/storage/WorkoutStorage';
import { Workout } from '../../src/data/models/Workout';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('WorkoutStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockWorkout = (id: string): Workout => ({
    id,
    date: new Date().toISOString(),
    exercises: [],
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe('saveWorkout', () => {
    it('should save a new workout', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const workout = createMockWorkout('w1');

      await WorkoutStorage.saveWorkout(workout);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@workouts',
        JSON.stringify([workout])
      );
    });

    it('should update an existing workout', async () => {
      const existingWorkout = createMockWorkout('w1');
      const updatedWorkout = { ...existingWorkout, isCompleted: true };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([existingWorkout])
      );

      await WorkoutStorage.saveWorkout(updatedWorkout);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@workouts',
        JSON.stringify([updatedWorkout])
      );
    });
  });

  describe('getAllWorkouts', () => {
    it('should return all workouts', async () => {
      const workouts = [createMockWorkout('w1'), createMockWorkout('w2')];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workouts)
      );

      const result = await WorkoutStorage.getAllWorkouts();

      expect(result).toEqual(workouts);
    });

    it('should return empty array when no workouts', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await WorkoutStorage.getAllWorkouts();

      expect(result).toEqual([]);
    });
  });

  describe('getWorkoutById', () => {
    it('should return workout by id', async () => {
      const workout = createMockWorkout('w1');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([workout])
      );

      const result = await WorkoutStorage.getWorkoutById('w1');

      expect(result).toEqual(workout);
    });

    it('should return null when workout not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([createMockWorkout('w1')])
      );

      const result = await WorkoutStorage.getWorkoutById('w2');

      expect(result).toBeNull();
    });
  });

  describe('deleteWorkout', () => {
    it('should delete workout by id', async () => {
      const workouts = [createMockWorkout('w1'), createMockWorkout('w2')];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workouts)
      );

      await WorkoutStorage.deleteWorkout('w1');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@workouts',
        JSON.stringify([workouts[1]])
      );
    });
  });

  describe('active workout management', () => {
    it('should save active workout', async () => {
      const workout = createMockWorkout('w1');

      await WorkoutStorage.saveActiveWorkout(workout);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@active_workout',
        JSON.stringify(workout)
      );
    });

    it('should remove active workout when null', async () => {
      await WorkoutStorage.saveActiveWorkout(null);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@active_workout');
    });

    it('should get active workout', async () => {
      const workout = createMockWorkout('w1');
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workout)
      );

      const result = await WorkoutStorage.getActiveWorkout();

      expect(result).toEqual(workout);
    });

    it('should clear active workout', async () => {
      await WorkoutStorage.clearActiveWorkout();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@active_workout');
    });
  });
});
