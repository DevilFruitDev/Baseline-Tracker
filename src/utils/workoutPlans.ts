import { WorkoutPlan } from '../types';

const WORKOUT_PLANS_KEY = 'baseline_tracker_workout_plans';

export function getAllWorkoutPlans(): WorkoutPlan[] {
  try {
    const plansStr = localStorage.getItem(WORKOUT_PLANS_KEY);
    if (!plansStr) return [];
    return JSON.parse(plansStr);
  } catch (error) {
    console.error('Failed to load workout plans:', error);
    return [];
  }
}

export function getWorkoutPlanById(id: string): WorkoutPlan | null {
  const plans = getAllWorkoutPlans();
  return plans.find(p => p.id === id) || null;
}

export function getActiveWorkoutPlan(): WorkoutPlan | null {
  const plans = getAllWorkoutPlans();
  return plans.find(p => p.isActive) || null;
}

export function saveWorkoutPlan(plan: WorkoutPlan): void {
  const plans = getAllWorkoutPlans();
  const existingIndex = plans.findIndex(p => p.id === plan.id);

  // If setting a plan as active, deactivate all others
  if (plan.isActive) {
    plans.forEach(p => p.isActive = false);
  }

  if (existingIndex >= 0) {
    plans[existingIndex] = plan;
  } else {
    plans.push(plan);
  }

  // Sort by created date (newest first)
  plans.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

  localStorage.setItem(WORKOUT_PLANS_KEY, JSON.stringify(plans));
}

export function deleteWorkoutPlan(id: string): void {
  const plans = getAllWorkoutPlans();
  const filtered = plans.filter(p => p.id !== id);
  localStorage.setItem(WORKOUT_PLANS_KEY, JSON.stringify(filtered));
}

export function generateWorkoutPlanId(): string {
  return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function markWorkoutComplete(planId: string, dayName: string, notes?: string): void {
  const plan = getWorkoutPlanById(planId);
  if (!plan) return;

  const completedWorkouts = plan.completedWorkouts || [];
  completedWorkouts.push({
    date: new Date().toISOString(),
    dayName,
    notes,
  });

  saveWorkoutPlan({
    ...plan,
    completedWorkouts,
  });
}

export function getWorkoutStats(planId: string): {
  totalWorkouts: number;
  completedWorkouts: number;
  currentStreak: number;
  lastWorkoutDate?: string;
} {
  const plan = getWorkoutPlanById(planId);
  if (!plan) return { totalWorkouts: 0, completedWorkouts: 0, currentStreak: 0 };

  const totalWorkouts = plan.weeklySchedule.length;
  const completedWorkouts = plan.completedWorkouts?.length || 0;

  // Calculate streak
  let currentStreak = 0;
  if (plan.completedWorkouts && plan.completedWorkouts.length > 0) {
    const sorted = [...plan.completedWorkouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const workoutDate = new Date(sorted[i].date);
      workoutDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    totalWorkouts,
    completedWorkouts,
    currentStreak,
    lastWorkoutDate: plan.completedWorkouts?.[plan.completedWorkouts.length - 1]?.date,
  };
}
