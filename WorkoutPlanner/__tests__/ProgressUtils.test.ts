import { ProgressUtils } from '../src/domain/progress/ProgressUtils';
import { Workout } from '../src/data/models/Workout';

describe('ProgressUtils', () => {
  const mockWorkouts: Workout[] = [
    {
      id: 'w1',
      date: '2024-01-01',
      isCompleted: true,
      exercises: [
        {
          id: 'e1',
          workoutId: 'w1',
          name: 'Bench Press',
          sets: [
            { id: 's1', exerciseId: 'e1', reps: 10, weight: 100, isWarmup: false, order: 0, createdAt: '2024-01-01' },
            { id: 's2', exerciseId: 'e1', reps: 8, weight: 110, isWarmup: false, order: 1, createdAt: '2024-01-01' },
          ],
          notes: '',
          order: 0,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ],
      startTime: '2024-01-01T10:00:00Z',
      endTime: '2024-01-01T11:00:00Z',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'w2',
      date: '2024-01-08',
      isCompleted: true,
      exercises: [
        {
          id: 'e2',
          workoutId: 'w2',
          name: 'Bench Press',
          sets: [
            { id: 's3', exerciseId: 'e2', reps: 10, weight: 105, isWarmup: false, order: 0, createdAt: '2024-01-08' },
            { id: 's4', exerciseId: 'e2', reps: 9, weight: 115, isWarmup: false, order: 1, createdAt: '2024-01-08' },
          ],
          notes: '',
          order: 0,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-08',
        },
      ],
      startTime: '2024-01-08T10:00:00Z',
      endTime: '2024-01-08T11:00:00Z',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-08',
    },
  ];

  describe('getAllSetsForExercise', () => {
    it('should return all sets for a specific exercise', () => {
      const sets = ProgressUtils.getAllSetsForExercise('Bench Press', mockWorkouts);
      expect(sets).toHaveLength(4);
      expect(sets[0].weight).toBe(100);
      expect(sets[1].weight).toBe(110);
    });

    it('should filter out warmup sets', () => {
      const workoutWithWarmup: Workout[] = [
        {
          ...mockWorkouts[0],
          exercises: [
            {
              ...mockWorkouts[0].exercises[0],
              sets: [
                { id: 'sw1', exerciseId: 'e1', reps: 10, weight: 60, isWarmup: true, order: 0, createdAt: '2024-01-01' },
                { id: 's1', exerciseId: 'e1', reps: 10, weight: 100, isWarmup: false, order: 1, createdAt: '2024-01-01' },
              ],
            },
          ],
        },
      ];
      
      const sets = ProgressUtils.getAllSetsForExercise('Bench Press', workoutWithWarmup);
      expect(sets).toHaveLength(1);
      expect(sets[0].weight).toBe(100);
    });

    it('should return empty array for non-existent exercise', () => {
      const sets = ProgressUtils.getAllSetsForExercise('Squat', mockWorkouts);
      expect(sets).toHaveLength(0);
    });
  });

  describe('getMaxWeight', () => {
    it('should return maximum weight lifted', () => {
      const result = ProgressUtils.getMaxWeight('Bench Press', mockWorkouts);
      expect(result).not.toBeNull();
      expect(result?.weight).toBe(115);
      expect(result?.date).toBe('2024-01-08');
    });

    it('should return null for non-existent exercise', () => {
      const result = ProgressUtils.getMaxWeight('Squat', mockWorkouts);
      expect(result).toBeNull();
    });
  });

  describe('getTotalVolume', () => {
    it('should calculate total volume correctly', () => {
      const volume = ProgressUtils.getTotalVolume('Bench Press', mockWorkouts);
      // w1: (10*100 + 8*110) = 1880
      // w2: (10*105 + 9*115) = 2085
      // Total: 3965
      expect(volume).toBe(3965);
    });

    it('should return 0 for non-existent exercise', () => {
      const volume = ProgressUtils.getTotalVolume('Squat', mockWorkouts);
      expect(volume).toBe(0);
    });
  });

  describe('getMaxWeightPerSession', () => {
    it('should return max weight per workout session', () => {
      const sessions = ProgressUtils.getMaxWeightPerSession('Bench Press', mockWorkouts);
      expect(sessions).toHaveLength(2);
      expect(sessions[0].value).toBe(110);
      expect(sessions[0].date).toBe('2024-01-01');
      expect(sessions[1].value).toBe(115);
      expect(sessions[1].date).toBe('2024-01-08');
    });
  });

  describe('getAllExerciseNames', () => {
    it('should return all unique exercise names', () => {
      const names = ProgressUtils.getAllExerciseNames(mockWorkouts);
      expect(names).toEqual(['Bench Press']);
    });

    it('should return sorted unique names', () => {
      const multiExerciseWorkouts: Workout[] = [
        {
          ...mockWorkouts[0],
          exercises: [
            mockWorkouts[0].exercises[0],
            {
              id: 'e3',
              workoutId: 'w1',
              name: 'Squat',
              sets: [],
              notes: '',
              order: 1,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01',
            },
          ],
        },
      ];
      
      const names = ProgressUtils.getAllExerciseNames(multiExerciseWorkouts);
      expect(names).toEqual(['Bench Press', 'Squat']);
    });
  });

  describe('filterByTimeRange', () => {
    it('should filter workouts by 4 weeks', () => {
      const now = new Date();
      const recentWorkouts: Workout[] = [
        { ...mockWorkouts[0], date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { ...mockWorkouts[1], date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      ];
      
      const filtered = ProgressUtils.filterByTimeRange(recentWorkouts, '4w');
      expect(filtered).toHaveLength(1);
    });

    it('should return all workouts for "all" time range', () => {
      const filtered = ProgressUtils.filterByTimeRange(mockWorkouts, 'all');
      expect(filtered).toHaveLength(2);
    });
  });
});
