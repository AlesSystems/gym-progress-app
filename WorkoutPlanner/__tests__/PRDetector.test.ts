import { PRDetector } from '../../src/domain/workout/PRDetector';
import { Workout, Set } from '../../src/data/models/Workout';

describe('PRDetector', () => {
  const createSet = (
    id: string,
    exerciseId: string,
    reps: number,
    weight: number,
    isWarmup: boolean = false
  ): Set => ({
    id,
    exerciseId,
    reps,
    weight,
    isWarmup,
    order: 0,
    createdAt: new Date().toISOString(),
  });

  const createWorkout = (
    id: string,
    exerciseName: string,
    sets: Set[]
  ): Workout => ({
    id,
    date: new Date().toISOString(),
    exercises: [
      {
        id: 'ex1',
        workoutId: id,
        name: exerciseName,
        sets,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    isCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe('detectPRs', () => {
    it('should detect max weight PR', () => {
      const history: Workout[] = [
        createWorkout('w1', 'Bench Press', [
          createSet('s1', 'ex1', 10, 100),
          createSet('s2', 'ex1', 8, 105),
        ]),
      ];

      const newSet = createSet('s3', 'ex1', 5, 110);
      const prs = PRDetector.detectPRs('Bench Press', newSet, history);

      expect(prs).toHaveLength(2);
      expect(prs.some(pr => pr.type === 'max_weight' && pr.value === 110)).toBe(true);
    });

    it('should detect max volume PR', () => {
      const history: Workout[] = [
        createWorkout('w1', 'Bench Press', [
          createSet('s1', 'ex1', 10, 100), // volume = 1000
        ]),
      ];

      const newSet = createSet('s2', 'ex1', 11, 100); // volume = 1100
      const prs = PRDetector.detectPRs('Bench Press', newSet, history);

      expect(prs.some(pr => pr.type === 'max_volume' && pr.value === 1100)).toBe(true);
    });

    it('should detect max reps PR at same weight', () => {
      const history: Workout[] = [
        createWorkout('w1', 'Bench Press', [
          createSet('s1', 'ex1', 10, 100),
        ]),
      ];

      const newSet = createSet('s2', 'ex1', 12, 100);
      const prs = PRDetector.detectPRs('Bench Press', newSet, history);

      expect(prs.some(pr => pr.type === 'max_reps' && pr.value === 12)).toBe(true);
    });

    it('should not detect PR when no improvement', () => {
      const history: Workout[] = [
        createWorkout('w1', 'Bench Press', [
          createSet('s1', 'ex1', 10, 100),
        ]),
      ];

      const newSet = createSet('s2', 'ex1', 8, 90);
      const prs = PRDetector.detectPRs('Bench Press', newSet, history);

      expect(prs).toHaveLength(0);
    });

    it('should ignore warmup sets in history', () => {
      const history: Workout[] = [
        createWorkout('w1', 'Bench Press', [
          createSet('s1', 'ex1', 10, 60, true), // warmup
          createSet('s2', 'ex1', 10, 100),
        ]),
      ];

      const newSet = createSet('s3', 'ex1', 10, 105);
      const prs = PRDetector.detectPRs('Bench Press', newSet, history);

      expect(prs.some(pr => pr.type === 'max_weight' && pr.value === 105)).toBe(true);
    });

    it('should return empty array when no history', () => {
      const history: Workout[] = [];
      const newSet = createSet('s1', 'ex1', 10, 100);
      const prs = PRDetector.detectPRs('Bench Press', newSet, history);

      expect(prs).toHaveLength(0);
    });

    it('should be case insensitive for exercise names', () => {
      const history: Workout[] = [
        createWorkout('w1', 'bench press', [
          createSet('s1', 'ex1', 10, 100),
        ]),
      ];

      const newSet = createSet('s2', 'ex1', 10, 105);
      const prs = PRDetector.detectPRs('BENCH PRESS', newSet, history);

      expect(prs.some(pr => pr.type === 'max_weight')).toBe(true);
    });
  });
});
