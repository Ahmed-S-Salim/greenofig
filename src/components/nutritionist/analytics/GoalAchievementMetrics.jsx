import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Award,
  Users,
  Calendar,
  Zap,
  Trophy
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const GOAL_TYPES = [
  { value: 'weight_loss', label: 'Weight Loss', icon: TrendingUp, color: '#10b981' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: Award, color: '#8b5cf6' },
  { value: 'maintenance', label: 'Maintenance', icon: CheckCircle2, color: '#3b82f6' },
  { value: 'performance', label: 'Performance', icon: Zap, color: '#f59e0b' }
];

const TIME_PERIODS = [
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '180', label: 'Last 6 Months' },
  { value: 'all', label: 'All Time' }
];

const GoalAchievementMetrics = ({ nutritionistId, compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('90');
  const [selectedGoalType, setSelectedGoalType] = useState('all');
  const [metricsData, setMetricsData] = useState({
    overall: {
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      successRate: 0,
      avgDaysToComplete: 0,
      onTrackGoals: 0
    },
    byType: {},
    completionTimeline: [],
    progressDistribution: [],
    topPerformers: []
  });

  useEffect(() => {
    if (nutritionistId) {
      fetchGoalMetrics();
    }
  }, [nutritionistId, selectedPeriod, selectedGoalType]);

  const fetchGoalMetrics = async () => {
    try {
      setLoading(true);

      const days = selectedPeriod === 'all' ? 99999 : parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch all goals for nutritionist's clients
      const { data: goals, error: goalsError } = await supabase
        .from('client_goals')
        .select(`
          *,
          user_profiles!inner (
            id,
            full_name,
            nutritionist_clients!inner (
              nutritionist_id
            )
          )
        `)
        .eq('user_profiles.nutritionist_clients.nutritionist_id', nutritionistId)
        .gte('created_at', startDate.toISOString());

      if (goalsError) throw goalsError;

      // Filter by goal type if specified
      const filteredGoals = selectedGoalType === 'all'
        ? goals
        : goals.filter(g => g.goal_type === selectedGoalType);

      // Calculate overall metrics
      const totalGoals = filteredGoals.length;
      const completedGoals = filteredGoals.filter(g => g.status === 'completed').length;
      const activeGoals = filteredGoals.filter(g => g.status === 'active').length;
      const successRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      // Calculate average days to complete
      const completedWithDates = filteredGoals.filter(g =>
        g.status === 'completed' && g.completed_at
      );

      const avgDaysToComplete = completedWithDates.length > 0
        ? completedWithDates.reduce((sum, goal) => {
            const start = new Date(goal.created_at);
            const end = new Date(goal.completed_at);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0) / completedWithDates.length
        : 0;

      // Count on-track goals (progress >= 75% of expected)
      const now = new Date();
      const onTrackGoals = filteredGoals.filter(g => {
        if (g.status !== 'active') return false;

        const progress = (g.current_value / g.target_value) * 100;
        const start = new Date(g.created_at);
        const target = new Date(g.target_date);
        const totalDays = Math.ceil((target - start) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
        const expectedProgress = (daysPassed / totalDays) * 100;

        return progress >= expectedProgress * 0.75;
      }).length;

      // Metrics by goal type
      const byType = {};
      GOAL_TYPES.forEach(type => {
        const typeGoals = filteredGoals.filter(g => g.goal_type === type.value);
        const typeCompleted = typeGoals.filter(g => g.status === 'completed').length;

        byType[type.value] = {
          total: typeGoals.length,
          completed: typeCompleted,
          active: typeGoals.filter(g => g.status === 'active').length,
          successRate: typeGoals.length > 0 ? (typeCompleted / typeGoals.length) * 100 : 0
        };
      });

      // Completion timeline (weekly)
      const completionTimeline = [];
      const weeksInPeriod = Math.ceil(days / 7);

      for (let i = weeksInPeriod - 1; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekCompleted = filteredGoals.filter(g =>
          g.status === 'completed' &&
          g.completed_at &&
          new Date(g.completed_at) >= weekStart &&
          new Date(g.completed_at) < weekEnd
        ).length;

        const weekStarted = filteredGoals.filter(g =>
          new Date(g.created_at) >= weekStart &&
          new Date(g.created_at) < weekEnd
        ).length;

        completionTimeline.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          completed: weekCompleted,
          started: weekStarted
        });
      }

      // Progress distribution
      const progressDistribution = [
        {
          range: '0-25%',
          count: activeGoals.filter(g => {
            const progress = (g.current_value / g.target_value) * 100;
            return progress < 25;
          }).length,
          color: '#ef4444'
        },
        {
          range: '25-50%',
          count: activeGoals.filter(g => {
            const progress = (g.current_value / g.target_value) * 100;
            return progress >= 25 && progress < 50;
          }).length,
          color: '#f59e0b'
        },
        {
          range: '50-75%',
          count: activeGoals.filter(g => {
            const progress = (g.current_value / g.target_value) * 100;
            return progress >= 50 && progress < 75;
          }).length,
          color: '#3b82f6'
        },
        {
          range: '75-100%',
          count: activeGoals.filter(g => {
            const progress = (g.current_value / g.target_value) * 100;
            return progress >= 75 && progress < 100;
          }).length,
          color: '#10b981'
        },
        {
          range: '100%+',
          count: activeGoals.filter(g => {
            const progress = (g.current_value / g.target_value) * 100;
            return progress >= 100;
          }).length,
          color: '#8b5cf6'
        }
      ];

      // Top performers (clients with most completed goals)
      const clientGoalMap = {};
      filteredGoals.forEach(goal => {
        const clientId = goal.user_id;
        const clientName = goal.user_profiles.full_name;

        if (!clientGoalMap[clientId]) {
          clientGoalMap[clientId] = {
            id: clientId,
            name: clientName,
            completed: 0,
            total: 0
          };
        }

        clientGoalMap[clientId].total++;
        if (goal.status === 'completed') {
          clientGoalMap[clientId].completed++;
        }
      });

      const topPerformers = Object.values(clientGoalMap)
        .filter(client => client.completed > 0)
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 10);

      setMetricsData({
        overall: {
          totalGoals,
          completedGoals,
          activeGoals,
          successRate,
          avgDaysToComplete,
          onTrackGoals
        },
        byType,
        completionTimeline,
        progressDistribution,
        topPerformers
      });
    } catch (error) {
      console.error('Error fetching goal metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Goal Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {metricsData.overall.successRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              {metricsData.overall.completedGoals} of {metricsData.overall.totalGoals} goals achieved
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                Goal Achievement Metrics
              </CardTitle>
              <CardDescription>
                Track client success rates and goal completion patterns
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedGoalType} onValueChange={setSelectedGoalType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  {GOAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Total Goals</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {metricsData.overall.totalGoals}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Completed</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {metricsData.overall.completedGoals}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Active Goals</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {metricsData.overall.activeGoals}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {metricsData.overall.successRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Days</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {Math.round(metricsData.overall.avgDaysToComplete)}
              </div>
              <p className="text-xs text-gray-600 mt-1">To complete</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">On Track</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                {metricsData.overall.onTrackGoals}
              </div>
              <p className="text-xs text-orange-600 mt-1">
                {metricsData.overall.activeGoals > 0
                  ? `${((metricsData.overall.onTrackGoals / metricsData.overall.activeGoals) * 100).toFixed(0)}% of active`
                  : '0% of active'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Completion Timeline</CardTitle>
            <CardDescription>Weekly goal starts vs completions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metricsData.completionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="started" fill="#3b82f6" name="Started" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Active Goals Progress Distribution</CardTitle>
            <CardDescription>Where clients are in their goal journey</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metricsData.progressDistribution}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.range}: ${entry.count}`}
                >
                  {metricsData.progressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Success by Goal Type */}
      <Card>
        <CardHeader>
          <CardTitle>Success Rate by Goal Type</CardTitle>
          <CardDescription>Compare achievement rates across different goal types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {GOAL_TYPES.map(type => {
              const data = metricsData.byType[type.value] || { total: 0, completed: 0, successRate: 0 };

              return (
                <div key={type.value}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" style={{ color: type.color }} />
                      <span className="font-medium">{type.label}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">{data.completed}</span>
                      <span className="text-gray-600">/{data.total} completed</span>
                      <Badge className="ml-2" style={{
                        backgroundColor: `${type.color}20`,
                        color: type.color,
                        border: `1px solid ${type.color}`
                      }}>
                        {data.successRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${data.successRate}%`,
                        backgroundColor: type.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{data.active} active</span>
                    <span>{data.successRate.toFixed(0)}% success rate</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Goal Achievers
          </CardTitle>
          <CardDescription>Clients with the most completed goals</CardDescription>
        </CardHeader>
        <CardContent>
          {metricsData.topPerformers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed goals yet
            </div>
          ) : (
            <div className="space-y-3">
              {metricsData.topPerformers.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                      'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-gray-600">
                        {client.total} total goals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">
                      {client.completed}
                    </div>
                    <div className="text-xs text-gray-600">
                      {((client.completed / client.total) * 100).toFixed(0)}% success
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalAchievementMetrics;
