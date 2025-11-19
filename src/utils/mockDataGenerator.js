/**
 * Mock Data Generator for Tier Preview
 * Generates realistic demo data for previewing user dashboards
 * WITHOUT accessing any real user data
 */

export const generateMockDashboardData = (tier) => {
  const today = new Date().toISOString().split('T')[0];

  // Mock today's metrics
  const mockTodayMetrics = {
    id: 'preview-metrics-1',
    user_id: 'preview-user-id',
    date: today,
    calories: 1450,
    protein_g: 95,
    carbs_g: 150,
    fat_g: 45,
    fiber_g: 28,
    water_ml: 1800,
    steps: 8500,
    exercise_minutes: 45,
    sleep_hours: 7.5,
    weight_kg: 75,
    created_at: new Date().toISOString(),
  };

  // Mock recent activity
  const mockRecentActivity = [
    {
      id: 'activity-1',
      user_id: 'preview-user-id',
      activity_type: 'meal_logged',
      description: 'Logged breakfast: Oatmeal with berries',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'activity-2',
      user_id: 'preview-user-id',
      activity_type: 'workout_completed',
      description: 'Completed 30-min cardio workout',
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'activity-3',
      user_id: 'preview-user-id',
      activity_type: 'weight_logged',
      description: 'Updated weight: 75 kg',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'activity-4',
      user_id: 'preview-user-id',
      activity_type: 'meal_logged',
      description: 'Logged lunch: Grilled chicken salad',
      created_at: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'activity-5',
      user_id: 'preview-user-id',
      activity_type: 'goal_achieved',
      description: 'Achieved daily water goal!',
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Mock streaks
  const mockStreaks = [
    {
      id: 'streak-1',
      user_id: 'preview-user-id',
      streak_type: 'daily_logging',
      current_count: 12,
      best_count: 18,
      last_activity_date: today,
    },
    {
      id: 'streak-2',
      user_id: 'preview-user-id',
      streak_type: 'workout',
      current_count: 5,
      best_count: 14,
      last_activity_date: today,
    },
    {
      id: 'streak-3',
      user_id: 'preview-user-id',
      streak_type: 'water_goal',
      current_count: 7,
      best_count: 21,
      last_activity_date: today,
    },
  ];

  // Mock meal plans (tier-dependent)
  const mockMealPlans = tier === 'free' ? [] : [
    {
      id: 'meal-plan-1',
      user_id: 'preview-user-id',
      name: 'Mediterranean Diet Plan',
      description: 'Healthy, balanced meals inspired by Mediterranean cuisine',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      meals: [
        {
          name: 'Greek Yogurt Parfait',
          type: 'breakfast',
          calories: 320,
          protein_g: 18,
        },
        {
          name: 'Mediterranean Quinoa Bowl',
          type: 'lunch',
          calories: 450,
          protein_g: 22,
        },
        {
          name: 'Grilled Salmon with Vegetables',
          type: 'dinner',
          calories: 520,
          protein_g: 38,
        },
      ],
    },
  ];

  // Mock workout plans (tier-dependent)
  const mockWorkoutPlans = tier === 'free' ? [] : [
    {
      id: 'workout-plan-1',
      user_id: 'preview-user-id',
      name: 'Full Body Strength Training',
      description: '3-day per week full body workout routine',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      workouts: [
        {
          name: 'Day 1: Upper Body',
          exercises: ['Push-ups', 'Dumbbell Rows', 'Shoulder Press'],
          duration_minutes: 45,
        },
        {
          name: 'Day 2: Lower Body',
          exercises: ['Squats', 'Lunges', 'Calf Raises'],
          duration_minutes: 50,
        },
        {
          name: 'Day 3: Core & Cardio',
          exercises: ['Planks', 'Mountain Climbers', 'Burpees'],
          duration_minutes: 40,
        },
      ],
    },
  ];

  // Mock progress data for charts
  const mockProgressData = {
    weightHistory: generateWeightHistory(),
    calorieHistory: generateCalorieHistory(),
    workoutHistory: generateWorkoutHistory(),
  };

  // Mock AI messages remaining (tier-dependent)
  const mockAiMessagesRemaining = {
    free: 3,
    premium: 50,
    ultimate: 200,
    elite: 999,
  }[tier] || 3;

  return {
    todayMetrics: mockTodayMetrics,
    recentActivity: mockRecentActivity,
    streaks: mockStreaks,
    mealPlans: mockMealPlans,
    workoutPlans: mockWorkoutPlans,
    progressData: mockProgressData,
    aiMessagesRemaining: mockAiMessagesRemaining,
  };
};

// Helper: Generate weight history for last 30 days
const generateWeightHistory = () => {
  const history = [];
  const startWeight = 78; // kg
  const targetWeight = 73; // kg
  const days = 30;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate gradual weight loss with some fluctuation
    const progress = (days - i) / days;
    const baseWeight = startWeight - (startWeight - targetWeight) * progress;
    const fluctuation = (Math.random() - 0.5) * 0.5; // ±0.25 kg fluctuation

    history.push({
      date: date.toISOString().split('T')[0],
      weight_kg: Math.round((baseWeight + fluctuation) * 10) / 10,
    });
  }

  return history;
};

// Helper: Generate calorie history for last 30 days
const generateCalorieHistory = () => {
  const history = [];
  const targetCalories = 1500;
  const days = 30;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate calorie intake with variation
    const variation = (Math.random() - 0.5) * 400; // ±200 calories
    const calories = Math.round(targetCalories + variation);

    history.push({
      date: date.toISOString().split('T')[0],
      calories: Math.max(1000, Math.min(2500, calories)),
    });
  }

  return history;
};

// Helper: Generate workout history for last 30 days
const generateWorkoutHistory = () => {
  const history = [];
  const days = 30;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Simulate 3-4 workouts per week
    const shouldHaveWorkout = Math.random() > 0.5;

    if (shouldHaveWorkout) {
      history.push({
        date: date.toISOString().split('T')[0],
        duration_minutes: Math.round(30 + Math.random() * 40),
        type: ['cardio', 'strength', 'yoga', 'hiit'][Math.floor(Math.random() * 4)],
      });
    }
  }

  return history;
};

// Export individual generators if needed
export {
  generateWeightHistory,
  generateCalorieHistory,
  generateWorkoutHistory,
};
