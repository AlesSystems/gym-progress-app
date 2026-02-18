import { WeightEntry, WeightGoal, WeightStats, WeightTrend, WeightUnit } from '../../data/models/WeightTracking';

const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

export class WeightCalculator {
  static convertWeight(weight: number, from: WeightUnit, to: WeightUnit): number {
    if (from === to) return weight;
    const converted = from === 'lbs' ? weight * LBS_TO_KG : weight * KG_TO_LBS;
    return Math.round(converted * 10) / 10;
  }

  static normalizeEntries(entries: WeightEntry[], targetUnit: WeightUnit): number[] {
    return entries.map(e =>
      e.unit === targetUnit ? e.weight : this.convertWeight(e.weight, e.unit, targetUnit)
    );
  }

  static calculateStats(entries: WeightEntry[], displayUnit: WeightUnit): WeightStats | null {
    if (entries.length === 0) return null;

    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const weights = this.normalizeEntries(sorted, displayUnit);

    const current = weights[weights.length - 1];
    const starting = weights[0];
    const totalChange = Math.round((current - starting) * 10) / 10;
    const percentChange = starting !== 0
      ? Math.round(((current - starting) / starting) * 1000) / 10
      : 0;

    return {
      currentWeight: current,
      startingWeight: starting,
      lowestWeight: Math.min(...weights),
      highestWeight: Math.max(...weights),
      averageWeight: Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10,
      totalChange,
      percentChange,
      trend: this.getTrend(weights),
      entriesCount: entries.length,
    };
  }

  static getTrend(weights: number[]): WeightTrend {
    if (weights.length < 2) return 'stable';

    const recent = weights.slice(-5);
    if (recent.length < 2) return 'stable';

    let increasing = 0;
    let decreasing = 0;

    for (let i = 1; i < recent.length; i++) {
      const diff = recent[i] - recent[i - 1];
      if (diff > 0.1) increasing++;
      else if (diff < -0.1) decreasing++;
    }

    if (increasing > decreasing) return 'increasing';
    if (decreasing > increasing) return 'decreasing';
    return 'stable';
  }

  static getGoalProgress(goal: WeightGoal, currentWeight: number, currentUnit: WeightUnit): number {
    const target = goal.unit === currentUnit
      ? goal.targetWeight
      : this.convertWeight(goal.targetWeight, goal.unit, currentUnit);
    const start = goal.unit === currentUnit
      ? goal.startWeight
      : this.convertWeight(goal.startWeight, goal.unit, currentUnit);

    const totalToChange = Math.abs(target - start);
    if (totalToChange === 0) return 100;

    const changed = Math.abs(currentWeight - start);
    const progress = Math.min((changed / totalToChange) * 100, 100);
    return Math.round(progress);
  }

  static getMotivationalMessage(goal: WeightGoal, currentWeight: number, currentUnit: WeightUnit): string {
    const target = goal.unit === currentUnit
      ? goal.targetWeight
      : this.convertWeight(goal.targetWeight, goal.unit, currentUnit);
    const remaining = Math.abs(currentWeight - target);

    if (remaining < 0.5) return 'You reached your goal! Amazing work!';

    const progress = this.getGoalProgress(goal, currentWeight, currentUnit);
    if (progress >= 75) return 'Almost there! Keep pushing!';
    if (progress >= 50) return 'Halfway there! Great consistency!';
    if (progress >= 25) return 'Good progress! Stay on track!';
    return 'Every step counts. Keep going!';
  }
}
