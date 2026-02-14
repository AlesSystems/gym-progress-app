import { StatsCalculator } from '../src/domain/progress/StatsCalculator';
import { Workout } from '../src/data/models/Workout';

describe('StatsCalculator', () => {
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
    {
      id: 'w3',
      date: '2024-01-15',
      isCompleted: true,
      exercises: [
        {
          id: 'e3',
          workoutId: 'w3',
          name: 'Bench Press',
          sets: [
            { id: 's5', exerciseId: 'e3', reps: 10, weight: 107, isWarmup: false, order: 0, createdAt: '2024-01-15' },
            { id: 's6', exerciseId: 'e3', reps: 8, weight: 120, isWarmup: false, order: 1, createdAt: '2024-01-15' },
          ],
          notes: '',
          order: 0,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
        },
      ],
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
  ];

  describe('calculateExerciseStats', () => {
    it('should calculate comprehensive stats for an exercise', () => {
      const stats = StatsCalculator.calculateExerciseStats('Bench Press', mockWorkouts);
      
      expect(stats).not.toBeNull();
      expect(stats?.exerciseName).toBe('Bench Press');
      expect(stats?.maxWeight).toBe(120);
      expect(stats?.maxWeightDate).toBe('2024-01-15');
      expect(stats?.sessionCount).toBe(3);
      expect(stats?.totalVolume).toBe(5995); // Sum of all reps * weight
    });

    it('should return null for non-existent exercise', () => {
      const stats = StatsCalculator.calculateExerciseStats('Squat', mockWorkouts);
      expect(stats).toBeNull();
    });

    it('should calculate progression with improving trend', () => {
      const stats = StatsCalculator.calculateExerciseStats('Bench Press', mockWorkouts);
      
      expect(stats).not.toBeNull();
      expect(stats?.progression.trend).toBe('improving');
      expect(stats?.progression.slope).toBeGreaterThan(0);
    });

    it('should calculate frequency per week', () => {
      const stats = StatsCalculator.calculateExerciseStats('Bench Press', mockWorkouts);
      
      expect(stats).not.toBeNull();
      expect(stats?.frequencyPerWeek).toBeGreaterThan(0);
    });
  });

  describe('calculateAllExerciseStats', () => {
    it('should calculate stats for all exercises', () => {
      const multiExerciseWorkouts: Workout[] = [
        ...mockWorkouts,
        {
          id: 'w4',
          date: '2024-01-22',
          isCompleted: true,
          exercises: [
            {
              id: 'e4',
              workoutId: 'w4',
              name: 'Squat',
              sets: [
                { id: 's7', exerciseId: 'e4', reps: 10, weight: 150, isWarmup: false, order: 0, createdAt: '2024-01-22' },
              ],
              notes: '',
              order: 0,
              createdAt: '2024-01-22',
              updatedAt: '2024-01-22',
            },
          ],
          startTime: '2024-01-22T10:00:00Z',
          endTime: '2024-01-22T11:00:00Z',
          createdAt: '2024-01-22',
          updatedAt: '2024-01-22',
        },
      ];
      
      const allStats = StatsCalculator.calculateAllExerciseStats(multiExerciseWorkouts);
      
      expect(allStats).toHaveLength(2);
      expect(allStats[0].exerciseName).toBe('Bench Press'); // Sorted by session count
      expect(allStats[1].exerciseName).toBe('Squat');
    });

    it('should return empty array for no exercises', () => {
      const allStats = StatsCalculator.calculateAllExerciseStats([]);
      expect(allStats).toEqual([]);
    });
  });
});
