import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, Target, Flame, Activity } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MacroTracking = () => {
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyMacros, setDailyMacros] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [macroGoals, setMacroGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchMacroGoals();
      fetchDailyMacros(selectedDate);
      fetchWeeklyData();
    }
  }, [userProfile?.id, selectedDate]);

  const fetchMacroGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_macro_goals')
        .select('*')
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMacroGoals({
          calories: data.calories_goal,
          protein: data.protein_goal,
          carbs: data.carbs_goal,
          fat: data.fat_goal,
        });
      }
    } catch (error) {
      console.error('Error fetching macro goals:', error);
    }
  };

  const fetchDailyMacros = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_macros')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', dateStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setDailyMacros(data || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching daily macros:', error);
      setLoading(false);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const { data, error } = await supabase
        .from('daily_macros')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      setWeeklyData(data || []);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  const calculatePercentage = (current, goal) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage < 70) return 'text-yellow-500';
    if (percentage > 110) return 'text-red-500';
    return 'text-green-500';
  };

  const getTrend = (current, goal) => {
    const percentage = (current / goal) * 100;
    if (percentage > 110) return { icon: TrendingUp, color: 'text-red-500', label: 'Over' };
    if (percentage < 70) return { icon: TrendingDown, color: 'text-yellow-500', label: 'Under' };
    return { icon: Target, color: 'text-green-500', label: 'On Track' };
  };

  const COLORS = {
    protein: '#3b82f6', // blue
    carbs: '#22c55e', // green
    fat: '#f59e0b', // orange
  };

  const MacroCard = ({ title, current, goal, unit, icon: Icon, color }) => {
    const percentage = calculatePercentage(current, goal);
    const trend = getTrend(current, goal);
    const TrendIcon = trend.icon;

    return (
      <Card className="glass-effect">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-${color}-500/20`}>
                <Icon className={`w-5 h-5 text-${color}-500`} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{current}</span>
                  <span className="text-sm text-text-secondary">/ {goal} {unit}</span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-1 ${trend.color}`}>
              <TrendIcon className="w-4 h-4" />
              <span className="text-xs font-medium">{trend.label}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">{percentage}%</span>
              <span className={getProgressColor(percentage)}>
                {current - goal > 0 ? '+' : ''}{current - goal} {unit}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>
    );
  };

  const pieChartData = dailyMacros ? [
    { name: 'Protein', value: dailyMacros.protein, color: COLORS.protein },
    { name: 'Carbs', value: dailyMacros.carbs, color: COLORS.carbs },
    { name: 'Fat', value: dailyMacros.fat, color: COLORS.fat },
  ] : [];

  const weeklyChartData = weeklyData.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    calories: day.calories,
    protein: day.protein,
    carbs: day.carbs,
    fat: day.fat,
  }));

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Macro Tracking Dashboard
          </CardTitle>
          <p className="text-sm text-text-secondary">
            Track your daily macronutrients and stay on target with your goals
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Today's Macros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MacroCard
              title="Calories"
              current={dailyMacros?.calories || 0}
              goal={macroGoals.calories}
              unit="kcal"
              icon={Flame}
              color="red"
            />
            <MacroCard
              title="Protein"
              current={dailyMacros?.protein || 0}
              goal={macroGoals.protein}
              unit="g"
              icon={Activity}
              color="blue"
            />
            <MacroCard
              title="Carbs"
              current={dailyMacros?.carbs || 0}
              goal={macroGoals.carbs}
              unit="g"
              icon={Activity}
              color="green"
            />
            <MacroCard
              title="Fat"
              current={dailyMacros?.fat || 0}
              goal={macroGoals.fat}
              unit="g"
              icon={Activity}
              color="orange"
            />
          </div>

          {/* Macro Distribution Pie Chart */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Today's Macro Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}g`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Macro Goals Summary */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Daily Goals Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-text-secondary mb-1">Calories Goal</p>
                  <p className="text-2xl font-bold">{macroGoals.calories}</p>
                  <p className="text-xs text-text-secondary mt-1">kcal/day</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-text-secondary mb-1">Protein Goal</p>
                  <p className="text-2xl font-bold">{macroGoals.protein}g</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {Math.round((macroGoals.protein * 4 / macroGoals.calories) * 100)}% of calories
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-text-secondary mb-1">Carbs Goal</p>
                  <p className="text-2xl font-bold">{macroGoals.carbs}g</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {Math.round((macroGoals.carbs * 4 / macroGoals.calories) * 100)}% of calories
                  </p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-text-secondary mb-1">Fat Goal</p>
                  <p className="text-2xl font-bold">{macroGoals.fat}g</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {Math.round((macroGoals.fat * 9 / macroGoals.calories) * 100)}% of calories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          {/* Weekly Trends */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">7-Day Macro Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="calories" stroke="#ef4444" name="Calories" />
                  <Line type="monotone" dataKey="protein" stroke={COLORS.protein} name="Protein (g)" />
                  <Line type="monotone" dataKey="carbs" stroke={COLORS.carbs} name="Carbs (g)" />
                  <Line type="monotone" dataKey="fat" stroke={COLORS.fat} name="Fat (g)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weekly Bar Chart */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Macro Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="protein" fill={COLORS.protein} name="Protein (g)" />
                  <Bar dataKey="carbs" fill={COLORS.carbs} name="Carbs (g)" />
                  <Bar dataKey="fat" fill={COLORS.fat} name="Fat (g)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MacroTracking;
