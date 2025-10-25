import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const PersonalizedInsights = () => {
  const { userProfile } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      generateInsights();
    }
  }, [userProfile?.id]);

  const generateInsights = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const startDate = sevenDaysAgo.toISOString().split('T')[0];

      // Fetch last 7 days of data
      const { data: metrics } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate)
        .order('date', { ascending: true });

      const { data: todayMetrics } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single();

      const { data: recentWorkouts } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate);

      const { data: recentMeals } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate);

      const generatedInsights = analyzeData(metrics || [], todayMetrics, recentWorkouts || [], recentMeals || [], userProfile);
      setInsights(generatedInsights);
      setLoading(false);
    } catch (error) {
      console.error('Error generating insights:', error);
      setLoading(false);
    }
  };

  const analyzeData = (weekMetrics, todayMetrics, workouts, meals, profile) => {
    const insights = [];

    // Weight trend analysis
    const weightData = weekMetrics.filter(m => m.weight_kg);
    if (weightData.length >= 2) {
      const firstWeight = weightData[0].weight_kg;
      const lastWeight = weightData[weightData.length - 1].weight_kg;
      const diff = lastWeight - firstWeight;

      if (Math.abs(diff) > 0.5) {
        insights.push({
          type: diff < 0 ? 'success' : 'info',
          icon: TrendingUp,
          title: diff < 0 ? 'Weight Loss Progress' : 'Weight Gain',
          message: `You've ${diff < 0 ? 'lost' : 'gained'} ${Math.abs(diff).toFixed(1)}kg this week. ${
            diff < 0 ? 'Great work! Keep it up!' : 'This might be muscle gain if you\'re strength training.'
          }`
        });
      }
    }

    // Calorie balance
    if (todayMetrics) {
      const consumed = todayMetrics.calories_consumed || 0;
      const burned = todayMetrics.calories_burned || 0;
      const target = profile.target_calories || 2000;

      if (consumed < target * 0.8) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Low Calorie Intake',
          message: `You've consumed ${consumed} calories today, which is below your goal of ${target}. Consider adding a healthy snack!`
        });
      } else if (consumed > target * 1.2) {
        insights.push({
          type: 'info',
          icon: Info,
          title: 'High Calorie Day',
          message: `You've consumed ${consumed} calories today. If this was planned, great! Otherwise, try balancing tomorrow.`
        });
      }
    }

    // Water intake
    if (todayMetrics) {
      const water = todayMetrics.water_ml || 0;
      if (water < 1500) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Hydration Reminder',
          message: `You've had ${water}ml of water today. Aim for at least 2000ml for optimal hydration!`
        });
      } else if (water >= 2000) {
        insights.push({
          type: 'success',
          icon: CheckCircle2,
          title: 'Great Hydration!',
          message: `You've hit your water goal with ${water}ml today. Keep up the excellent hydration!`
        });
      }
    }

    // Sleep analysis
    const sleepData = weekMetrics.filter(m => m.sleep_hours);
    if (sleepData.length >= 3) {
      const avgSleep = sleepData.reduce((sum, m) => sum + m.sleep_hours, 0) / sleepData.length;

      if (avgSleep < 6.5) {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Insufficient Sleep',
          message: `Your average sleep is ${avgSleep.toFixed(1)} hours. Aim for 7-9 hours for better recovery and health.`
        });
      } else if (avgSleep >= 7 && avgSleep <= 9) {
        insights.push({
          type: 'success',
          icon: CheckCircle2,
          title: 'Excellent Sleep Pattern',
          message: `You're averaging ${avgSleep.toFixed(1)} hours of sleep. This is optimal for recovery and performance!`
        });
      }
    }

    // Workout consistency
    if (workouts.length === 0) {
      insights.push({
        type: 'info',
        icon: Info,
        title: 'Time to Move',
        message: 'No workouts logged this week. Even a 15-minute walk can make a difference! Try our AI workout generator.'
      });
    } else if (workouts.length >= 3) {
      insights.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Active Week!',
        message: `You've completed ${workouts.length} workouts this week. You're crushing your fitness goals!`
      });
    }

    // Meal logging
    if (meals.length === 0) {
      insights.push({
        type: 'info',
        icon: Info,
        title: 'Start Tracking Meals',
        message: 'Logging your meals helps you stay accountable and reach your nutrition goals faster.'
      });
    }

    // Goal-specific insights
    if (profile.health_goals?.includes('lose_weight')) {
      const needsDeficit = (consumed || 0) - (burned || 0) > 0;
      if (needsDeficit && todayMetrics) {
        insights.push({
          type: 'info',
          icon: Info,
          title: 'Calorie Deficit',
          message: 'To lose weight, aim to burn more calories than you consume. Consider adding a workout or reducing portion sizes.'
        });
      }
    }

    if (profile.health_goals?.includes('build_muscle')) {
      const proteinTarget = (profile.weight_kg || 70) * 1.6; // 1.6g per kg
      const avgProtein = weekMetrics.reduce((sum, m) => sum + (m.protein_g || 0), 0) / Math.max(weekMetrics.length, 1);

      if (avgProtein < proteinTarget * 0.8) {
        insights.push({
          type: 'info',
          icon: Info,
          title: 'Increase Protein Intake',
          message: `For muscle building, aim for ${proteinTarget.toFixed(0)}g of protein daily. You're averaging ${avgProtein.toFixed(0)}g.`
        });
      }
    }

    // Default encouragement if no insights
    if (insights.length === 0) {
      insights.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Looking Good!',
        message: 'Keep logging your data to get personalized insights and track your progress effectively.'
      });
    }

    return insights.slice(0, 5); // Limit to 5 insights
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-muted border-border';
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-8 text-center text-muted-foreground">
          Analyzing your data...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Personalized Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getBgColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getIconColor(insight.type)}`} />
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PersonalizedInsights;
