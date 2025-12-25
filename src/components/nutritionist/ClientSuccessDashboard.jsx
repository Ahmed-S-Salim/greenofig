import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Activity,
  Award,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  Flame,
  Scale,
  Dumbbell,
  BarChart3,
  PieChart
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

const ClientSuccessDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalClients: 0,
    activeClients: 0,
    goalsAchieved: 0,
    avgSuccessRate: 0,
    totalWeightLoss: 0,
    avgEngagement: 0
  });
  const [clientProgress, setClientProgress] = useState([]);
  const [goalDistribution, setGoalDistribution] = useState([]);
  const [engagementData, setEngagementData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClients(),
        fetchOverallStats(),
        fetchClientProgress(),
        fetchGoalDistribution(),
        fetchEngagementData()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          id, full_name, email, tier, created_at,
          goal_type, current_weight_kg, target_weight_kg
        `)
        .eq('role', 'user')
        .order('full_name');

      if (error) throw error;

      // Fetch progress data for each client
      const clientsWithProgress = await Promise.all((data || []).map(async (client) => {
        const { data: progressData } = await supabase
          .from('client_progress')
          .select('*')
          .eq('user_id', client.id)
          .order('created_at', { ascending: false })
          .limit(30);

        const { data: goalsData } = await supabase
          .from('client_goals')
          .select('*')
          .eq('client_id', client.id);

        const weightChange = progressData && progressData.length > 1
          ? parseFloat(progressData[progressData.length - 1]?.weight_kg || 0) - parseFloat(progressData[0]?.weight_kg || 0)
          : 0;

        const completedGoals = goalsData?.filter(g => g.status === 'completed').length || 0;
        const totalGoals = goalsData?.length || 0;
        const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        return {
          ...client,
          progress: progressData || [],
          goals: goalsData || [],
          weightChange,
          successRate,
          completedGoals,
          totalGoals,
          lastActive: progressData?.[0]?.created_at || client.created_at
        };
      }));

      setClients(clientsWithProgress);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchOverallStats = async () => {
    try {
      const { data: clientsData } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('role', 'user');

      const totalClients = clientsData?.length || 0;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      const { data: activeData } = await supabase
        .from('client_progress')
        .select('user_id')
        .gte('created_at', cutoffDate.toISOString());

      const activeClients = new Set(activeData?.map(p => p.user_id)).size;

      const { data: goalsData } = await supabase
        .from('client_goals')
        .select('status');

      const completedGoals = goalsData?.filter(g => g.status === 'completed').length || 0;
      const totalGoals = goalsData?.length || 1;

      const { data: progressData } = await supabase
        .from('client_progress')
        .select('weight_kg, user_id')
        .order('created_at', { ascending: true });

      // Calculate total weight loss across all clients
      let totalWeightLoss = 0;
      const userWeights = {};
      progressData?.forEach(p => {
        if (!userWeights[p.user_id]) {
          userWeights[p.user_id] = { first: parseFloat(p.weight_kg), last: parseFloat(p.weight_kg) };
        } else {
          userWeights[p.user_id].last = parseFloat(p.weight_kg);
        }
      });

      Object.values(userWeights).forEach(w => {
        const loss = w.first - w.last;
        if (loss > 0) totalWeightLoss += loss;
      });

      setOverallStats({
        totalClients,
        activeClients,
        goalsAchieved: completedGoals,
        avgSuccessRate: Math.round((completedGoals / totalGoals) * 100),
        totalWeightLoss: Math.round(totalWeightLoss * 10) / 10,
        avgEngagement: totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }
  };

  const fetchClientProgress = async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      const { data, error } = await supabase
        .from('client_progress')
        .select('created_at, weight_kg')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by week
      const weeklyData = {};
      (data || []).forEach(entry => {
        const date = new Date(entry.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { weights: [], count: 0 };
        }
        weeklyData[weekKey].weights.push(parseFloat(entry.weight_kg));
        weeklyData[weekKey].count++;
      });

      const chartData = Object.entries(weeklyData).map(([week, data]) => ({
        week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgWeight: Math.round((data.weights.reduce((a, b) => a + b, 0) / data.weights.length) * 10) / 10,
        entries: data.count
      }));

      setClientProgress(chartData);
    } catch (error) {
      console.error('Error fetching client progress:', error);
    }
  };

  const fetchGoalDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('client_goals')
        .select('goal_type, status');

      if (error) throw error;

      const distribution = {};
      (data || []).forEach(goal => {
        const type = goal.goal_type || 'Other';
        if (!distribution[type]) {
          distribution[type] = { total: 0, completed: 0 };
        }
        distribution[type].total++;
        if (goal.status === 'completed') {
          distribution[type].completed++;
        }
      });

      const chartData = Object.entries(distribution).map(([type, data]) => ({
        name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        total: data.total,
        completed: data.completed,
        rate: Math.round((data.completed / data.total) * 100)
      }));

      setGoalDistribution(chartData);
    } catch (error) {
      console.error('Error fetching goal distribution:', error);
    }
  };

  const fetchEngagementData = async () => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      // Fetch various engagement metrics
      const { data: progressData } = await supabase
        .from('client_progress')
        .select('created_at')
        .gte('created_at', cutoffDate.toISOString());

      const { data: mealsData } = await supabase
        .from('meals')
        .select('created_at')
        .gte('created_at', cutoffDate.toISOString());

      const { data: messagesData } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', cutoffDate.toISOString());

      // Group by week
      const weeklyEngagement = {};
      const processData = (data, type) => {
        (data || []).forEach(entry => {
          const date = new Date(entry.created_at);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];

          if (!weeklyEngagement[weekKey]) {
            weeklyEngagement[weekKey] = { progress: 0, meals: 0, messages: 0 };
          }
          weeklyEngagement[weekKey][type]++;
        });
      };

      processData(progressData, 'progress');
      processData(mealsData, 'meals');
      processData(messagesData, 'messages');

      const chartData = Object.entries(weeklyEngagement)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([week, data]) => ({
          week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          ...data
        }));

      setEngagementData(chartData);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}/10`}>
            <Icon className={`w-6 h-6 text-${color}`} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center mt-3 text-sm ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4 mr-1" /> : trend < 0 ? <ArrowDown className="w-4 h-4 mr-1" /> : <Minus className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            Client Success Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Track client outcomes and engagement</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clients"
          value={overallStats.totalClients}
          icon={Users}
          subtitle={`${overallStats.activeClients} active`}
        />
        <StatCard
          title="Goals Achieved"
          value={overallStats.goalsAchieved}
          icon={Target}
          subtitle={`${overallStats.avgSuccessRate}% success rate`}
        />
        <StatCard
          title="Total Weight Loss"
          value={`${overallStats.totalWeightLoss} kg`}
          icon={Scale}
          subtitle="Across all clients"
        />
        <StatCard
          title="Client Engagement"
          value={`${overallStats.avgEngagement}%`}
          icon={Activity}
          subtitle="Active in selected period"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Average Client Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={clientProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgWeight"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Avg Weight (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="entries"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Log Entries"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Goal Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Goal Achievement by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
                <Bar dataKey="total" fill="#e5e7eb" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Client Engagement Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#10b981" name="Progress Logs" />
              <Bar dataKey="meals" fill="#3b82f6" name="Meal Logs" />
              <Bar dataKey="messages" fill="#f59e0b" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Client Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Client Leaderboard
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredClients
              .sort((a, b) => b.successRate - a.successRate)
              .slice(0, 10)
              .map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-muted-foreground/20'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{client.full_name}</h4>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={client.tier === 'Elite' ? 'default' : client.tier === 'Premium' ? 'secondary' : 'outline'}>
                      {client.tier || 'Base'}
                    </Badge>
                  </div>
                  <div className="w-32">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Success</span>
                      <span className="font-semibold">{client.successRate}%</span>
                    </div>
                    <Progress value={client.successRate} className="h-2" />
                  </div>
                  <div className="text-right w-24">
                    <p className={`text-sm font-semibold ${client.weightChange < 0 ? 'text-green-500' : client.weightChange > 0 ? 'text-red-500' : ''}`}>
                      {client.weightChange > 0 ? '+' : ''}{client.weightChange.toFixed(1)} kg
                    </p>
                    <p className="text-xs text-muted-foreground">Weight Change</p>
                  </div>
                  <div className="text-right w-20">
                    <p className="text-sm font-semibold">{client.completedGoals}/{client.totalGoals}</p>
                    <p className="text-xs text-muted-foreground">Goals</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSuccessDashboard;
