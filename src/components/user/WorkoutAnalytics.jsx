import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Zap, Award, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const WorkoutAnalytics = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [workoutData, setWorkoutData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [personalRecords, setPersonalRecords] = useState([]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchWorkoutAnalytics();
    }
  }, [userProfile?.id, timeRange]);

  const fetchWorkoutAnalytics = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      setWorkoutData(data || []);
      calculateAnalytics(data || []);
      findPersonalRecords(data || []);
    } catch (error) {
      console.error('Error fetching workout analytics:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToLoadWorkoutAnalytics') || 'Failed to load workout analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (data) => {
    if (data.length === 0) {
      setAnalytics(null);
      return;
    }

    const totalWorkouts = data.length;
    const totalDuration = data.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const totalCalories = data.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const avgDuration = Math.round(totalDuration / totalWorkouts);
    const avgCalories = Math.round(totalCalories / totalWorkouts);

    const workoutsByType = data.reduce((acc, w) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {});

    const intensityDistribution = data.reduce((acc, w) => {
      acc[w.intensity || 'moderate'] = (acc[w.intensity || 'moderate'] || 0) + 1;
      return acc;
    }, {});

    const weeklyFrequency = Math.round((totalWorkouts / parseInt(timeRange)) * 7);

    setAnalytics({
      totalWorkouts,
      totalDuration,
      totalCalories,
      avgDuration,
      avgCalories,
      workoutsByType,
      intensityDistribution,
      weeklyFrequency,
    });
  };

  const findPersonalRecords = (data) => {
    const records = [];

    const maxDuration = Math.max(...data.map(w => w.duration_minutes || 0));
    const maxCalories = Math.max(...data.map(w => w.calories_burned || 0));
    const maxDistance = Math.max(...data.map(w => w.distance_km || 0));

    if (maxDuration > 0) {
      const workout = data.find(w => w.duration_minutes === maxDuration);
      records.push({
        title: 'Longest Workout',
        value: `${maxDuration} min`,
        date: workout?.date,
        icon: '⏱️',
      });
    }

    if (maxCalories > 0) {
      const workout = data.find(w => w.calories_burned === maxCalories);
      records.push({
        title: 'Most Calories Burned',
        value: `${maxCalories} kcal`,
        date: workout?.date,
        icon: '🔥',
      });
    }

    if (maxDistance > 0) {
      const workout = data.find(w => w.distance_km === maxDistance);
      records.push({
        title: 'Longest Distance',
        value: `${maxDistance.toFixed(1)} km`,
        date: workout?.date,
        icon: '🏃',
      });
    }

    const consecutiveDays = calculateConsecutiveDays(data);
    if (consecutiveDays > 0) {
      records.push({
        title: 'Best Streak',
        value: `${consecutiveDays} days`,
        icon: '🔥',
      });
    }

    setPersonalRecords(records);
  };

  const calculateConsecutiveDays = (data) => {
    if (data.length === 0) return 0;

    const dates = [...new Set(data.map(w => w.date))].sort();
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const workoutTypeChartData = analytics ? Object.keys(analytics.workoutsByType).map(type => ({
    type,
    count: analytics.workoutsByType[type],
  })) : [];

  const intensityChartData = analytics ? Object.keys(analytics.intensityDistribution).map(intensity => ({
    intensity,
    count: analytics.intensityDistribution[intensity],
  })) : [];

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="w-6 h-6 text-primary" />
                {t('workoutAnalytics') || 'Workout Analytics'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('workoutAnalyticsDescription') || 'Advanced performance metrics and insights'}
              </p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('last7Days') || 'Last 7 Days'}</SelectItem>
                <SelectItem value="30">{t('last30Days') || 'Last 30 Days'}</SelectItem>
                <SelectItem value="90">{t('last90Days') || 'Last 90 Days'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{analytics.totalWorkouts}</div>
                <p className="text-xs text-text-secondary mt-1">{t('totalWorkouts') || 'Total Workouts'}</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{analytics.totalDuration}</div>
                <p className="text-xs text-text-secondary mt-1">{t('totalMinutes') || 'Total Minutes'}</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{analytics.totalCalories}</div>
                <p className="text-xs text-text-secondary mt-1">{t('caloriesBurned') || 'Calories Burned'}</p>
              </CardContent>
            </Card>
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{analytics.weeklyFrequency}</div>
                <p className="text-xs text-text-secondary mt-1">{t('workoutsPerWeek') || 'Workouts/Week'}</p>
              </CardContent>
            </Card>
          </div>

          {personalRecords.length > 0 && (
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  {t('personalRecords') || 'Personal Records'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {personalRecords.map((record, idx) => (
                    <div key={idx} className="p-4 bg-muted rounded-lg text-center">
                      <div className="text-3xl mb-2">{record.icon}</div>
                      <p className="font-semibold">{record.value}</p>
                      <p className="text-xs text-text-secondary">{record.title}</p>
                      {record.date && (
                        <p className="text-xs text-text-secondary mt-1">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t('overview') || 'Overview'}</TabsTrigger>
              <TabsTrigger value="types">{t('types') || 'Types'}</TabsTrigger>
              <TabsTrigger value="intensity">{t('intensity') || 'Intensity'}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg">{t('workoutTrends') || 'Workout Trends'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="duration_minutes" stroke="#22c55e" name="Duration (min)" />
                      <Line type="monotone" dataKey="calories_burned" stroke="#ef4444" name="Calories" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types" className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg">{t('workoutsByType') || 'Workouts by Type'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workoutTypeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="intensity" className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="text-lg">{t('intensityDistribution') || 'Intensity Distribution'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={intensityChartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="intensity" />
                      <PolarRadiusAxis />
                      <Radar name="Workouts" dataKey="count" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="glass-effect">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
            <p className="text-text-secondary">{t('noWorkoutData') || 'No workout data available for this period'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkoutAnalytics;
