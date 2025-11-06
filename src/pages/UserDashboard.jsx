import React, { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Scale, HeartPulse, Dumbbell, Edit, Target, Flame, Droplets, Moon, Utensils, Activity, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import QuickLogWeight from '@/components/user/QuickLogWeight';
import QuickLogMeal from '@/components/user/QuickLogMeal';
import QuickLogWorkout from '@/components/user/QuickLogWorkout';
import QuickLogWater from '@/components/user/QuickLogWater';
import QuickLogSleep from '@/components/user/QuickLogSleep';
import ProgressCharts from '@/components/user/ProgressCharts';
import AiMealPlanGenerator from '@/components/user/AiMealPlanGenerator';
import AiWorkoutPlanner from '@/components/user/AiWorkoutPlanner';
import PersonalizedInsights from '@/components/user/PersonalizedInsights';

const UserDashboard = memo(({ logoUrl }) => {
  const { userProfile } = useAuth();
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (userProfile?.id) {
      fetchDashboardData();
    }
  }, [userProfile?.id, refreshKey]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .maybeSingle();

      if (metricsError && metricsError.code !== 'PGRST116') {
        console.error('Error fetching metrics:', metricsError);
      }

      setTodayMetrics(metrics);

      // Fetch recent activity (last 5)
      const { data: activity } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(activity || []);

      // Fetch streaks
      const { data: streaksData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userProfile.id);

      setStreaks(streaksData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getGoalIcon = (goalId) => {
    switch (goalId) {
      case 'lose_weight': return <Scale className="w-6 h-6 text-primary" />;
      case 'build_muscle': return <Dumbbell className="w-6 h-6 text-primary" />;
      case 'improve_endurance': return <HeartPulse className="w-6 h-6 text-primary" />;
      case 'eat_healthier': return <Edit className="w-6 h-6 text-primary" />;
      case 'increase_energy': return <Zap className="w-6 h-6 text-primary" />;
      default: return <Target className="w-6 h-6 text-primary" />;
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return { bmi: 'N/A', category: 'N/A' };
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) category = 'Normal';
    else if (bmi >= 25 && bmi <= 29.9) category = 'Overweight';
    else category = 'Obese';
    return { bmi, category };
  };

  const { bmi, category } = useMemo(
    () => calculateBMI(userProfile?.weight_kg, userProfile?.height_cm),
    [userProfile?.weight_kg, userProfile?.height_cm]
  );

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }), []);

  return (
    <>
      <Helmet>
        <title>Dashboard - GreenoFig</title>
        <meta name="description" content="Your personal health and wellness dashboard." />
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 px-4 sm:px-0"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Welcome back, <span className="gradient-text">{(userProfile?.full_name || 'User').split(' ')[0]}!</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-text-secondary mt-2">Here's your wellness snapshot for today. Let's make it a great one!</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-effect">
              <CardHeader className="p-4 sm:p-6 lg:p-8">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 p-4 sm:p-6 lg:p-8 pt-0">
                <QuickLogWeight onSuccess={handleRefresh} />
                <QuickLogMeal onSuccess={handleRefresh} />
                <QuickLogWorkout onSuccess={handleRefresh} />
                <QuickLogSleep onSuccess={handleRefresh} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Water Intake - Separate Section */}
          <motion.div variants={itemVariants}>
            <QuickLogWater onSuccess={handleRefresh} />
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 lg:p-8 lg:pb-4">
                <CardTitle className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium">Weight</CardTitle>
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 pt-0 lg:pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
                  {todayMetrics?.weight_kg || userProfile?.weight_kg || 'N/A'}
                  {(todayMetrics?.weight_kg || userProfile?.weight_kg) && ' kg'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayMetrics?.weight_kg ? 'Today\'s weight' : 'Last logged weight'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">BMI</CardTitle>
                <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{bmi}</div>
                <p className="text-xs text-muted-foreground">{category}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Calories Today</CardTitle>
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {todayMetrics?.calories_burned || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Burned • {todayMetrics?.calories_consumed || 0} consumed
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Sleep</CardTitle>
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {todayMetrics?.sleep_hours ? `${todayMetrics.sleep_hours}h` : 'Not logged'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayMetrics?.sleep_quality || 'Log your sleep'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Single Streak Badge - Show inline if only 1 streak */}
        {streaks.length === 1 && (
          <motion.div variants={itemVariants}>
            <Card className="glass-effect">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">{streaks[0].current_streak}</span>
                    <span className="text-sm text-muted-foreground">day</span>
                    <span className="text-sm font-medium capitalize">{streaks[0].streak_type.replace(/_/g, ' ')} streak</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Best: {streaks[0].longest_streak} days
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Streaks Section - Only show as full section if 2+ streaks */}
        {streaks.length >= 2 && (
          <motion.div variants={itemVariants}>
            <Card className="glass-effect">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  Your Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
                {streaks.map(streak => (
                  <div key={streak.id} className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {streak.current_streak}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground capitalize">
                      {streak.streak_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Best: {streak.longest_streak}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Activity Feed */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-effect h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-shrink-0 p-2 rounded-full bg-primary/20">
                        {activity.activity_type === 'logged_meal' && <Utensils className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'completed_workout' && <Dumbbell className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'weight_update' && <Scale className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'sleep_log' && <Moon className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'water_intake' && <Droplets className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity_title}</div>
                        <div className="text-sm text-muted-foreground">{activity.activity_description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet. Start logging your health data!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals */}
          <motion.div variants={itemVariants}>
             <Card className="glass-effect h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold">Your Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {userProfile?.health_goals && userProfile.health_goals.length > 0 ? (
                  userProfile.health_goals.map(goal => (
                    <motion.div
                      key={goal}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 sm:gap-4 bg-muted p-3 rounded-lg"
                    >
                      {getGoalIcon(goal)}
                      <span className="text-sm sm:text-base font-medium text-text-primary capitalize">{goal.replace(/_/g, ' ')}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm sm:text-base text-text-secondary">No goals set yet. Update your profile to add goals!</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Progress Charts */}
        <motion.div variants={itemVariants}>
          <ProgressCharts />
        </motion.div>

        {/* AI Tools & Insights */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={itemVariants}>
            <PersonalizedInsights />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold">AI-Powered Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                <AiMealPlanGenerator onSuccess={handleRefresh} />
                <AiWorkoutPlanner onSuccess={handleRefresh} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
});

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;