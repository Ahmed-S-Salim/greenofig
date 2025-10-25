import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Plus, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import QuickLogMeal from '@/components/user/QuickLogMeal';

const NutritionPageFunctional = () => {
  const { userProfile } = useAuth();
  const [meals, setMeals] = useState([]);
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (userProfile?.id) {
      fetchNutritionData();
    }
  }, [userProfile?.id, refreshKey]);

  const fetchNutritionData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's meals
      const { data: mealsData } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .order('consumed_at', { ascending: false });

      setMeals(mealsData || []);

      // Fetch today's metrics
      const { data: metricsData } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single();

      setTodayMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Calculate totals from meals
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein_g || 0),
      carbs: acc.carbs + (meal.carbs_g || 0),
      fats: acc.fats + (meal.fats_g || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  // Get targets from user profile or use defaults
  const targets = {
    calories: userProfile?.target_calories || 2200,
    protein: userProfile?.target_protein || 150,
    carbs: userProfile?.target_carbs || 220,
    fats: userProfile?.target_fats || 70
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Nutrition Tracker</h1>
          <p className="text-text-secondary text-lg">Track your meals and macros</p>
        </div>
        <QuickLogMeal onSuccess={handleRefresh} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-muted-foreground mb-2">Calories</h3>
          <p className="text-3xl font-bold mb-1">{Math.round(totals.calories)}</p>
          <p className="text-sm text-muted-foreground">of {targets.calories} kcal</p>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress(totals.calories, targets.calories)}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-muted-foreground mb-2">Protein</h3>
          <p className="text-3xl font-bold mb-1">{Math.round(totals.protein)}g</p>
          <p className="text-sm text-muted-foreground">of {targets.protein}g</p>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress(totals.protein, targets.protein)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-muted-foreground mb-2">Carbs</h3>
          <p className="text-3xl font-bold mb-1">{Math.round(totals.carbs)}g</p>
          <p className="text-sm text-muted-foreground">of {targets.carbs}g</p>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress(totals.carbs, targets.carbs)}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-muted-foreground mb-2">Fats</h3>
          <p className="text-3xl font-bold mb-1">{Math.round(totals.fats)}g</p>
          <p className="text-sm text-muted-foreground">of {targets.fats}g</p>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress(totals.fats, targets.fats)}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Today's Meals
        </h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-pulse">Loading meals...</div>
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Utensils className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No meals logged today</p>
            <p className="text-sm mt-2">Click "Log Meal" above to add your first meal</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{meal.meal_name || 'Meal'}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{meal.meal_type}</p>
                    {meal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-600 dark:text-orange-300 rounded-full text-sm font-semibold">
                    {meal.calories || 0} kcal
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Protein: <span className="text-foreground font-semibold">{meal.protein_g || 0}g</span>
                  </span>
                  <span className="text-muted-foreground">
                    Carbs: <span className="text-foreground font-semibold">{meal.carbs_g || 0}g</span>
                  </span>
                  <span className="text-muted-foreground">
                    Fats: <span className="text-foreground font-semibold">{meal.fats_g || 0}g</span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {new Date(meal.consumed_at).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NutritionPageFunctional;
