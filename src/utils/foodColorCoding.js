/**
 * Food Color Coding System (Noom-style)
 * Classifies foods by calorie density for behavior change
 *
 * Green: Low calorie density (0.0-0.7 cal/g) - Eat freely
 * Yellow: Medium calorie density (0.7-2.4 cal/g) - Eat moderately
 * Red: High calorie density (2.4+ cal/g) - Eat sparingly
 *
 * This psychological approach helps users make better choices without strict rules
 */

/**
 * Calculate calorie density (calories per gram)
 */
export const calculateCalorieDensity = (calories, servingSizeGrams) => {
  if (!servingSizeGrams || servingSizeGrams === 0) return 0;
  return calories / servingSizeGrams;
};

/**
 * Classify food into Green/Yellow/Red based on calorie density
 */
export const getFoodColor = (calories, servingSizeGrams) => {
  const density = calculateCalorieDensity(calories, servingSizeGrams);

  if (density <= 0.7) return 'green';
  if (density <= 2.4) return 'yellow';
  return 'red';
};

/**
 * Get color metadata
 */
export const getFoodColorInfo = (color) => {
  const colorInfo = {
    green: {
      name: 'Green Foods',
      description: 'Low calorie density - Eat freely!',
      guidance: 'Fill up on these nutrient-dense, lower-calorie foods',
      examples: 'Most fruits, non-starchy vegetables, broths, low-fat dairy',
      color: 'text-green-600',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      icon: '🥬',
      emoji: '✅',
      calorieRange: '0.0-0.7 cal/g',
      advice: 'These foods are your best friends! They provide volume and nutrients with fewer calories.',
    },
    yellow: {
      name: 'Yellow Foods',
      description: 'Medium calorie density - Eat moderately',
      guidance: 'Include these foods in reasonable portions',
      examples: 'Lean proteins, whole grains, legumes, starchy vegetables',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      icon: '🍗',
      emoji: '⚖️',
      calorieRange: '0.7-2.4 cal/g',
      advice: 'These foods form the foundation of balanced meals. Watch portion sizes.',
    },
    red: {
      name: 'Red Foods',
      description: 'High calorie density - Eat sparingly',
      guidance: 'Enjoy these foods in small amounts',
      examples: 'Nuts, seeds, oils, fried foods, sweets, processed snacks',
      color: 'text-red-600',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500',
      icon: '🍰',
      emoji: '⚠️',
      calorieRange: '2.4+ cal/g',
      advice: 'Not forbidden! Just be mindful of portions. A little goes a long way calorie-wise.',
    },
  };

  return colorInfo[color] || colorInfo.yellow;
};

/**
 * Auto-classify common foods by name/category
 * Used when exact calorie data is not available
 */
export const classifyFoodByName = (foodName, category = '') => {
  const name = foodName.toLowerCase();
  const cat = category.toLowerCase();

  // Green foods (vegetables, fruits, lean proteins)
  const greenKeywords = [
    'vegetable', 'lettuce', 'spinach', 'kale', 'broccoli', 'cucumber', 'tomato',
    'pepper', 'carrot', 'celery', 'zucchini', 'mushroom', 'asparagus',
    'apple', 'orange', 'berr', 'melon', 'peach', 'pear', 'grape',
    'low-fat', 'skim', 'fat-free',
    'soup', 'broth'
  ];

  // Red foods (fried, processed, high-fat, sweets)
  const redKeywords = [
    'fried', 'fries', 'chip', 'cookie', 'cake', 'candy', 'chocolate',
    'ice cream', 'donut', 'pastry', 'bacon', 'sausage',
    'butter', 'oil', 'mayo', 'cream cheese',
    'nut', 'seed', 'peanut', 'almond',
    'pizza', 'burger',
    'soda', 'juice'
  ];

  // Check green keywords
  if (greenKeywords.some(keyword => name.includes(keyword) || cat.includes(keyword))) {
    return 'green';
  }

  // Check red keywords
  if (redKeywords.some(keyword => name.includes(keyword) || cat.includes(keyword))) {
    return 'red';
  }

  // Default to yellow (whole grains, lean meats, dairy, legumes)
  return 'yellow';
};

/**
 * Get daily budget recommendations (Noom-style)
 * Based on total daily calorie target
 */
export const getDailyColorBudget = (dailyCalorieTarget) => {
  return {
    green: {
      percentage: 30,
      calories: Math.round(dailyCalorieTarget * 0.30),
      description: '30% of daily calories from green foods (minimum)',
    },
    yellow: {
      percentage: 45,
      calories: Math.round(dailyCalorieTarget * 0.45),
      description: '45% of daily calories from yellow foods',
    },
    red: {
      percentage: 25,
      calories: Math.round(dailyCalorieTarget * 0.25),
      description: '25% of daily calories from red foods (maximum)',
    },
  };
};

/**
 * Calculate user's color distribution for the day
 */
export const calculateDailyColorDistribution = (mealLogs) => {
  const distribution = {
    green: 0,
    yellow: 0,
    red: 0,
    total: 0,
  };

  mealLogs.forEach(meal => {
    const color = meal.food_color || getFoodColor(meal.calories, meal.serving_size_grams || 100);
    const calories = meal.calories || 0;

    distribution[color] += calories;
    distribution.total += calories;
  });

  // Calculate percentages
  const percentages = {
    green: distribution.total > 0 ? Math.round((distribution.green / distribution.total) * 100) : 0,
    yellow: distribution.total > 0 ? Math.round((distribution.yellow / distribution.total) * 100) : 0,
    red: distribution.total > 0 ? Math.round((distribution.red / distribution.total) * 100) : 0,
  };

  return {
    calories: distribution,
    percentages,
    total: distribution.total,
  };
};

/**
 * Get feedback based on color distribution
 */
export const getColorDistributionFeedback = (percentages, calorieTarget) => {
  const { green, yellow, red } = percentages;

  // Excellent distribution
  if (green >= 30 && red <= 25 && yellow >= 40) {
    return {
      status: 'excellent',
      message: '🎉 Perfect balance! You\'re nailing the color distribution.',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    };
  }

  // Good distribution
  if (green >= 20 && red <= 30) {
    return {
      status: 'good',
      message: '👍 Good job! Try to add a few more green foods.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    };
  }

  // Too much red
  if (red > 35) {
    return {
      status: 'warning',
      message: '⚠️ High red food intake. Try swapping some for green or yellow options.',
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    };
  }

  // Not enough green
  if (green < 15) {
    return {
      status: 'warning',
      message: '🥬 Add more green foods! They help you feel full with fewer calories.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    };
  }

  // Default
  return {
    status: 'neutral',
    message: '💡 Keep tracking! Aim for 30% green, 45% yellow, 25% red.',
    color: 'text-text-primary',
    bgColor: 'bg-background/50',
  };
};

/**
 * Get portion size guidance based on food color
 */
export const getPortionGuidance = (color) => {
  const guidance = {
    green: {
      title: 'Eat Freely',
      description: 'Fill half your plate with green foods',
      portion: 'Large portions encouraged',
      visual: '🥗🥗🥗 (Fill up!)',
    },
    yellow: {
      title: 'Moderate Portions',
      description: 'About a quarter of your plate',
      portion: 'Fist-sized or palm-sized portions',
      visual: '👊 (One fist or palm)',
    },
    red: {
      title: 'Small Portions',
      description: 'Use sparingly for flavor and satisfaction',
      portion: 'Thumb-sized or 1-2 tablespoons',
      visual: '👍 (One thumb)',
    },
  };

  return guidance[color] || guidance.yellow;
};
