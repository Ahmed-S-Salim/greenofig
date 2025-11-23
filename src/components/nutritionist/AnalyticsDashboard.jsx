import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Target,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30'); // days

  // Analytics data
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    activeClients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    averageSuccessRate: 0,
    totalRevenue: 0
  });

  const [clientProgressData, setClientProgressData] = useState([]);
  const [appointmentTrends, setAppointmentTrends] = useState([]);
  const [goalDistribution, setGoalDistribution] = useState([]);
  const [complianceData, setComplianceData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchClientProgress(),
        fetchAppointmentTrends(),
        fetchGoalDistribution(),
        fetchComplianceData(),
        fetchTopPerformers(),
        fetchRevenueData()
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

    // Get total and active clients
    const { data: clients } = await supabase
      .from('user_profiles')
      .select('id, role, created_at')
      .eq('role', 'user');

    const totalClients = clients?.length || 0;
    const activeClients = clients?.filter(c =>
      new Date(c.created_at) >= daysAgo
    ).length || 0;

    // Get appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', daysAgo.toISOString());

    const totalAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter(a =>
      a.status === 'completed'
    ).length || 0;

    // Calculate success rate from client progress
    const { data: progress } = await supabase
      .from('client_progress')
      .select('*')
      .gte('date', daysAgo.toISOString());

    const successRate = progress?.length > 0
      ? (progress.filter(p => p.weight_kg && p.weight_kg > 0).length / progress.length) * 100
      : 0;

    setMetrics({
      totalClients,
      activeClients,
      totalAppointments,
      completedAppointments,
      averageSuccessRate: Math.round(successRate),
      totalRevenue: totalAppointments * 75 // Placeholder calculation
    });
  };

  const fetchClientProgress = async () => {
    const daysAgo = subDays(new Date(), parseInt(timeRange));

    const { data } = await supabase
      .from('client_progress')
      .select(`
        *,
        user_profiles!client_progress_user_id_fkey(full_name)
      `)
      .gte('date', daysAgo.toISOString())
      .order('date', { ascending: true });

    if (data) {
      // Group by date and calculate averages
      const groupedData = data.reduce((acc, entry) => {
        const date = format(new Date(entry.date), 'MMM dd');
        if (!acc[date]) {
          acc[date] = { date, totalWeight: 0, count: 0 };
        }
        if (entry.weight_kg) {
          acc[date].totalWeight += entry.weight_kg;
          acc[date].count += 1;
        }
        return acc;
      }, {});

      const chartData = Object.values(groupedData).map(item => ({
        date: item.date,
        avgWeight: item.count > 0 ? (item.totalWeight / item.count).toFixed(1) : 0
      }));

      setClientProgressData(chartData);
    }
  };

  const fetchAppointmentTrends = async () => {
    const daysAgo = subDays(new Date(), parseInt(timeRange));

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', daysAgo.toISOString())
      .order('appointment_date', { ascending: true });

    if (data) {
      // Group by date
      const groupedData = data.reduce((acc, appt) => {
        const date = format(new Date(appt.appointment_date), 'MMM dd');
        if (!acc[date]) {
          acc[date] = { date, scheduled: 0, completed: 0, cancelled: 0 };
        }
        if (appt.status === 'scheduled') acc[date].scheduled += 1;
        if (appt.status === 'completed') acc[date].completed += 1;
        if (appt.status === 'cancelled') acc[date].cancelled += 1;
        return acc;
      }, {});

      setAppointmentTrends(Object.values(groupedData));
    }
  };

  const fetchGoalDistribution = async () => {
    const { data: healthData } = await supabase
      .from('client_health_data')
      .select('goals');

    if (healthData) {
      const goalCounts = healthData.reduce((acc, client) => {
        const goals = client.goals || [];
        goals.forEach(goal => {
          acc[goal] = (acc[goal] || 0) + 1;
        });
        return acc;
      }, {});

      const pieData = Object.entries(goalCounts).map(([name, value]) => ({
        name: name.replace('_', ' ').toUpperCase(),
        value
      }));

      setGoalDistribution(pieData);
    }
  };

  const fetchComplianceData = async () => {
    const daysAgo = subDays(new Date(), parseInt(timeRange));

    const { data } = await supabase
      .from('habit_logs')
      .select(`
        *,
        client_habits!habit_logs_habit_id_fkey(habit_name)
      `)
      .gte('log_date', daysAgo.toISOString())
      .order('log_date', { ascending: true });

    if (data) {
      // Calculate daily compliance rate
      const groupedData = data.reduce((acc, log) => {
        const date = format(new Date(log.log_date), 'MMM dd');
        if (!acc[date]) {
          acc[date] = { date, total: 0, completed: 0 };
        }
        acc[date].total += 1;
        if (log.completed) acc[date].completed += 1;
        return acc;
      }, {});

      const chartData = Object.values(groupedData).map(item => ({
        date: item.date,
        rate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0
      }));

      setComplianceData(chartData);
    }
  };

  const fetchTopPerformers = async () => {
    const daysAgo = subDays(new Date(), parseInt(timeRange));

    const { data } = await supabase
      .from('client_progress')
      .select(`
        user_id,
        weight_kg,
        date,
        user_profiles!client_progress_user_id_fkey(full_name, email)
      `)
      .gte('date', daysAgo.toISOString())
      .order('date', { ascending: true });

    if (data) {
      // Calculate progress for each client
      const clientProgress = data.reduce((acc, entry) => {
        if (!acc[entry.user_id]) {
          acc[entry.user_id] = {
            userId: entry.user_id,
            name: entry.user_profiles?.full_name || 'Unknown',
            email: entry.user_profiles?.email || '',
            weights: []
          };
        }
        if (entry.weight_kg) {
          acc[entry.user_id].weights.push(entry.weight_kg);
        }
        return acc;
      }, {});

      const performers = Object.values(clientProgress)
        .map(client => {
          const weights = client.weights;
          if (weights.length < 2) return null;

          const startWeight = weights[0];
          const endWeight = weights[weights.length - 1];
          const change = startWeight - endWeight;
          const percentChange = ((change / startWeight) * 100).toFixed(1);

          return {
            ...client,
            weightChange: change.toFixed(1),
            percentChange: parseFloat(percentChange)
          };
        })
        .filter(Boolean)
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
        .slice(0, 5);

      setTopPerformers(performers);
    }
  };

  const fetchRevenueData = async () => {
    const daysAgo = subDays(new Date(), parseInt(timeRange));

    const { data } = await supabase
      .from('appointments')
      .select('appointment_date, consultation_type')
      .eq('status', 'completed')
      .gte('appointment_date', daysAgo.toISOString())
      .order('appointment_date', { ascending: true });

    if (data) {
      // Group by week and calculate revenue
      const groupedData = data.reduce((acc, appt) => {
        const date = format(new Date(appt.appointment_date), 'MMM dd');
        if (!acc[date]) {
          acc[date] = { date, revenue: 0 };
        }
        // Pricing: initial = $100, follow_up = $75, check_in = $50
        const price = appt.consultation_type === 'initial' ? 100
          : appt.consultation_type === 'check_in' ? 50 : 75;
        acc[date].revenue += price;
        return acc;
      }, {});

      setRevenueData(Object.values(groupedData));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Analytics data refreshed'
    });
  };

  const handleExportReport = () => {
    // Placeholder for export functionality
    toast({
      title: 'Export Started',
      description: 'Generating analytics report...'
    });
  };

  // Using HSL values that match our theme
  const COLORS = [
    'hsl(142, 76%, 36%)',  // green-500
    'hsl(217, 91%, 60%)',  // blue-500
    'hsl(38, 92%, 50%)',   // amber-500
    'hsl(0, 84%, 60%)',    // red-500
    'hsl(258, 90%, 66%)',  // violet-500
    'hsl(330, 81%, 60%)'   // pink-500
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Track performance and client success metrics
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground whitespace-nowrap"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="whitespace-nowrap"
          >
            <RefreshCw className={`h-4 w-4 mr-2 flex-shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button onClick={handleExportReport} className="whitespace-nowrap">
            <Download className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Export</span> Report
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          icon={Users}
          title="Total Clients"
          value={metrics.totalClients}
          change={`+${metrics.activeClients} this period`}
          trend="up"
          color="blue"
        />
        <MetricCard
          icon={Calendar}
          title="Appointments"
          value={metrics.totalAppointments}
          change={`${metrics.completedAppointments} completed`}
          trend="up"
          color="green"
        />
        <MetricCard
          icon={Target}
          title="Success Rate"
          value={`${metrics.averageSuccessRate}%`}
          change="Average client progress"
          trend="up"
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Average Client Progress
            </h3>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={clientProgressData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="stroke-muted-foreground" />
              <YAxis className="stroke-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area
                type="monotone"
                dataKey="avgWeight"
                stroke="hsl(217, 91%, 60%)"
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Appointment Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Appointment Trends
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="stroke-muted-foreground" />
              <YAxis className="stroke-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Legend />
              <Bar dataKey="scheduled" fill="hsl(217, 91%, 60%)" name="Scheduled" />
              <Bar dataKey="completed" fill="hsl(142, 76%, 36%)" name="Completed" />
              <Bar dataKey="cancelled" fill="hsl(0, 84%, 60%)" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Goal Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Client Goals Distribution
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={goalDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(217, 91%, 60%)"
                dataKey="value"
              >
                {goalDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Compliance Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Client Compliance Rate
            </h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="stroke-muted-foreground" />
              <YAxis className="stroke-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 36%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Performers & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Top Performers
            </h3>
            <Award className="h-5 w-5 text-yellow-500" />
          </div>

          {topPerformers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No progress data available</p>
          ) : (
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={performer.userId}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {performer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      performer.weightChange > 0
                        ? 'text-destructive'
                        : 'text-primary'
                    }`}>
                      {performer.weightChange > 0 ? '+' : ''}{performer.weightChange} kg
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.abs(performer.percentChange)}% change
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-xl shadow-lg p-6 border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Revenue Trends
            </h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold text-foreground">
              ${metrics.totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total revenue this period</p>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="stroke-muted-foreground" />
              <YAxis className="stroke-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(142, 76%, 36%)"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ icon: Icon, title, value, change, trend, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-primary/10 text-primary',
    purple: 'bg-violet-500/10 text-violet-500',
    red: 'bg-destructive/10 text-destructive'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-xl shadow-lg p-6 border border-border"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-card-foreground mb-2">
            {value}
          </p>
          <div className="flex items-center gap-1 text-sm">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-primary" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={trend === 'up' ? 'text-primary' : 'text-destructive'}>
              {change}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
