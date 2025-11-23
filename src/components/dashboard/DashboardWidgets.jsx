import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import {
  Target,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Quote,
  Droplets,
  Footprints,
  Moon,
  Utensils,
  Dumbbell,
  Scale
} from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const DashboardWidgets = () => {
  const { user } = useAuth();
  const [weeklyGoal, setWeeklyGoal] = useState(null);
  const [todayHabits, setTodayHabits] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [motivationalQuote, setMotivationalQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  const motivationalQuotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
    { text: "Your health is an investment, not an expense.", author: "Unknown" },
    { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "Don't wish for it, work for it.", author: "Unknown" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "You don't have to be extreme, just consistent.", author: "Unknown" }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchWidgetData();
      // Set random motivational quote
      setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    }
  }, [user]);

  const fetchWidgetData = async () => {
    try {
      setLoading(true);

      // Fetch weekly goal
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());

      const { data: goalData } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .gte('week_start_date', weekStart.toISOString().split('T')[0])
        .lte('week_end_date', weekEnd.toISOString().split('T')[0])
        .single();

      setWeeklyGoal(goalData);

      // Fetch today's habits
      const today = new Date().toISOString().split('T')[0];
      const { data: habitsData } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('habit_date', today)
        .single();

      setTodayHabits(habitsData);

      // Fetch next appointment
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();

      setNextAppointment(appointmentData);
    } catch (error) {
      console.error('Error fetching widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (habitField, value) => {
    const today = new Date().toISOString().split('T')[0];

    try {
      const { error } = await supabase
        .from('daily_habits')
        .upsert({
          user_id: user.id,
          habit_date: today,
          [habitField]: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,habit_date'
        });

      if (!error) {
        setTodayHabits(prev => ({ ...prev, [habitField]: value }));
      }
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const getWeeklyGoalProgress = () => {
    if (!weeklyGoal) return 0;
    return (weeklyGoal.current_value / weeklyGoal.target_value) * 100;
  };

  const getCompletedHabits = () => {
    if (!todayHabits) return 0;
    let completed = 0;
    if (todayHabits.water_intake_completed) completed++;
    if (todayHabits.steps_goal_completed) completed++;
    if (todayHabits.sleep_goal_completed) completed++;
    if (todayHabits.meal_logged) completed++;
    if (todayHabits.workout_completed) completed++;
    if (todayHabits.weight_logged) completed++;
    return completed;
  };

  const getTotalHabits = () => 6;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="glass-effect animate-pulse">
            <CardContent className="p-6 h-32"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Weekly Goal Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              This Week's Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyGoal ? (
              <>
                <p className="text-lg font-bold truncate mb-2">{weeklyGoal.goal_description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {weeklyGoal.current_value}/{weeklyGoal.target_value}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(getWeeklyGoalProgress(), 100)}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No goal set this week</p>
                <Button size="sm" variant="outline">Set Goal</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Habits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Today's Habits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-green-600">
                  {getCompletedHabits()}/{getTotalHabits()}
                </span>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={todayHabits?.water_intake_completed || false}
                    onCheckedChange={(checked) => updateHabit('water_intake_completed', checked)}
                  />
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">8 glasses of water</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={todayHabits?.steps_goal_completed || false}
                    onCheckedChange={(checked) => updateHabit('steps_goal_completed', checked)}
                  />
                  <Footprints className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">10,000 steps</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={todayHabits?.sleep_goal_completed || false}
                    onCheckedChange={(checked) => updateHabit('sleep_goal_completed', checked)}
                  />
                  <Moon className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">7+ hours sleep</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={todayHabits?.meal_logged || false}
                    onCheckedChange={(checked) => updateHabit('meal_logged', checked)}
                  />
                  <Utensils className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Log meals</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={todayHabits?.workout_completed || false}
                    onCheckedChange={(checked) => updateHabit('workout_completed', checked)}
                  />
                  <Dumbbell className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Complete workout</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={todayHabits?.weight_logged || false}
                    onCheckedChange={(checked) => updateHabit('weight_logged', checked)}
                  />
                  <Scale className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">Log weight</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-effect bg-gradient-to-br from-primary/10 to-purple-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Quote className="w-4 h-4" />
              Daily Motivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {motivationalQuote && (
              <div className="space-y-3">
                <p className="text-sm font-medium italic">
                  "{motivationalQuote.text}"
                </p>
                <p className="text-xs text-muted-foreground text-right">
                  — {motivationalQuote.author}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Appointment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="space-y-2">
                <p className="font-semibold">{nextAppointment.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(nextAppointment.scheduled_at), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(nextAppointment.scheduled_at), 'h:mm a')}
                </p>
                <div className="pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-muted-foreground">
                      In {Math.ceil((new Date(nextAppointment.scheduled_at) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No upcoming appointments</p>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardWidgets;
