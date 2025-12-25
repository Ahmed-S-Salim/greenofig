import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Droplets, Activity, Moon, Utensils, Dumbbell, Scale, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyHabitsWidget = () => {
  const { userProfile } = useAuth();
  const [habits, setHabits] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (userProfile?.id) {
      fetchTodayHabits();
    }
  }, [userProfile?.id]);

  const fetchTodayHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('habit_date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching habits:', error);
        return;
      }

      if (!data) {
        // Create today's habits record
        const { data: newHabits, error: insertError } = await supabase
          .from('daily_habits')
          .insert({
            user_id: userProfile.id,
            habit_date: today,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating habits:', insertError);
          return;
        }

        setHabits(newHabits);
      } else {
        setHabits(data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in fetchTodayHabits:', error);
      setLoading(false);
    }
  };

  const toggleHabit = async (habitKey) => {
    if (!habits) return;

    const newValue = !habits[habitKey];

    // Optimistic update
    setHabits(prev => ({ ...prev, [habitKey]: newValue }));

    try {
      const { error } = await supabase
        .from('daily_habits')
        .update({
          [habitKey]: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', habits.id);

      if (error) {
        console.error('Error updating habit:', error);
        // Revert on error
        setHabits(prev => ({ ...prev, [habitKey]: !newValue }));
        toast({
          title: 'Error',
          description: 'Failed to update habit',
          variant: 'destructive',
        });
      } else {
        // Show celebration on completion
        if (newValue) {
          toast({
            title: '✅ Habit completed!',
            description: 'Keep up the great work!',
          });
        }
      }
    } catch (error) {
      console.error('Error in toggleHabit:', error);
    }
  };

  const habitsList = [
    { key: 'water_intake_completed', label: 'Drink 8 glasses of water', icon: Droplets, color: 'text-blue-500' },
    { key: 'steps_goal_completed', label: '10,000 steps', icon: Activity, color: 'text-green-500' },
    { key: 'sleep_goal_completed', label: '8 hours of sleep', icon: Moon, color: 'text-purple-500' },
    { key: 'meal_logged', label: 'Log all meals', icon: Utensils, color: 'text-orange-500' },
    { key: 'workout_completed', label: 'Complete workout', icon: Dumbbell, color: 'text-red-500' },
    { key: 'weight_logged', label: 'Log weight', icon: Scale, color: 'text-yellow-500' },
  ];

  const completedCount = habits
    ? habitsList.filter(habit => habits[habit.key]).length
    : 0;

  const completionPercentage = habits
    ? Math.round((completedCount / habitsList.length) * 100)
    : 0;

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Daily Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Daily Habits
          </CardTitle>
          <div className="text-sm font-semibold text-primary">
            {completedCount}/{habitsList.length} completed
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Today's Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {habitsList.map((habit, index) => {
            const Icon = habit.icon;
            const isCompleted = habits?.[habit.key] || false;

            return (
              <motion.div
                key={habit.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCompleted
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Checkbox
                  id={habit.key}
                  checked={isCompleted}
                  onCheckedChange={() => toggleHabit(habit.key)}
                  className="h-5 w-5"
                />
                <label
                  htmlFor={habit.key}
                  className="flex items-center gap-2 flex-1 cursor-pointer"
                >
                  <Icon className={`w-4 h-4 ${habit.color}`} />
                  <span
                    className={`text-sm font-medium ${
                      isCompleted
                        ? 'line-through text-muted-foreground'
                        : 'text-text-primary'
                    }`}
                  >
                    {habit.label}
                  </span>
                </label>
                {isCompleted && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-lg"
                  >
                    ✅
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Celebration Message */}
        {completedCount === habitsList.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🎉</div>
              <div className="font-semibold text-green-400">Perfect Day!</div>
              <div className="text-xs text-green-300/80">
                You've completed all your daily habits!
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyHabitsWidget;
