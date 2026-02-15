export interface NutritionEntry {
  id: string;
  date: string;
  calories: number;
  protein: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionGoal {
  dailyCalories: number;
  dailyProtein: number;
}
