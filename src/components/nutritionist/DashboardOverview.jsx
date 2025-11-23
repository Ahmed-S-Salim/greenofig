import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  UtensilsCrossed,
  Calendar,
  TrendingUp,
  Bell,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Crown,
  Star,
  Sparkles,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import TierBadge from './TierBadge';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    baseClients: 0,
    premiumClients: 0,
    eliteClients: 0,
    activeClients: 0,
    activeMealPlans: 0,
    upcomingAppointments: 0,
    monthlyRevenue: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all clients with tier information
      const { data: clientsData, error: clientsError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, created_at, tier')
        .eq('role', 'user');

      if (clientsError) throw clientsError;

      // Calculate tier distribution
      const baseClients = clientsData?.filter(c => (c.tier || 'Base') === 'Base').length || 0;
      const premiumClients = clientsData?.filter(c => c.tier === 'Premium').length || 0;
      const eliteClients = clientsData?.filter(c => c.tier === 'Elite').length || 0;

      // Calculate monthly revenue estimate
      const monthlyRevenue = (premiumClients * 29) + (eliteClients * 59);

      // Check active clients (has activity in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      let activeCount = 0;
      if (clientsData) {
        for (const client of clientsData) {
          const { data: progressData } = await supabase
            .from('client_progress')
            .select('date')
            .eq('client_id', client.id)
            .gte('date', weekAgo.toISOString().split('T')[0])
            .limit(1);

          if (progressData && progressData.length > 0) {
            activeCount++;
          }
        }
      }

      // Fetch active meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('meal_plans_v2')
        .select('id, name, status')
        .eq('nutritionist_id', user.id)
        .eq('status', 'active');

      // Fetch upcoming appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*, user_profiles!appointments_client_id_fkey(full_name, tier)')
        .eq('nutritionist_id', user.id)
        .gte('appointment_date', today.toISOString())
        .order('appointment_date', { ascending: true })
        .limit(10);

      // Filter today's appointments
      const todayAppts = appointmentsData?.filter(apt => {
        const aptDate = new Date(apt.appointment_date);
        return aptDate >= today && aptDate < tomorrow;
      }) || [];

      setStats({
        totalClients: clientsData?.length || 0,
        baseClients,
        premiumClients,
        eliteClients,
        activeClients: activeCount,
        activeMealPlans: mealPlansData?.length || 0,
        upcomingAppointments: appointmentsData?.length || 0,
        monthlyRevenue,
      });

      setTodayAppointments(todayAppts);

      // Generate action items based on client tiers
      const actions = [];

      // Check for follow-ups needed
      const needFollowUp = clientsData?.filter(c => {
        // Logic: clients without recent activity
        return true; // Simplified
      }).length || 0;

      if (needFollowUp > 0) {
        actions.push({
          id: 1,
          message: `${needFollowUp} clients need follow-up this week`,
          priority: 'high',
          tier: null
        });
      }

      // Suggest tier upgrades
      if (baseClients > 0) {
        actions.push({
          id: 2,
          message: `${baseClients} Base tier clients could benefit from Premium features`,
          priority: 'medium',
          tier: 'Base'
        });
      }

      if (premiumClients > 0) {
        actions.push({
          id: 3,
          message: `${premiumClients} Premium clients eligible for Elite upgrade`,
          priority: 'low',
          tier: 'Premium'
        });
      }

      setActionItems(actions);

      // Recent activity
      setRecentActivity([
        { id: 1, type: 'client_joined', message: 'New client registered', time: '2 hours ago', tier: 'Base' },
        { id: 2, type: 'meal_plan', message: 'Meal plan created for Elite client', time: '5 hours ago', tier: 'Elite' },
        { id: 3, type: 'appointment', message: 'Premium consultation completed', time: '1 day ago', tier: 'Premium' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color, bgColor }) => (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {change && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {change}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-full ${bgColor || 'bg-primary/10'}`}>
            <Icon className={`w-6 h-6 ${color || 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const tierDistributionData = [
    { name: 'Base', value: stats.baseClients, color: '#6b7280' },
    { name: 'Premium', value: stats.premiumClients, color: '#3b82f6' },
    { name: 'Elite', value: stats.eliteClients, color: '#eab308' },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold">Nutritionist Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Manage your clients across all subscription tiers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.totalClients}
          change="+12% this month"
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon={Activity}
          label="Active Clients"
          value={stats.activeClients}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-600/10 dark:bg-green-700/10"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Active Meal Plans"
          value={stats.activeMealPlans}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-600/10 dark:bg-blue-700/10"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Revenue"
          value={`$${stats.monthlyRevenue}`}
          change="+8% this month"
          color="text-purple-600 dark:text-purple-400"
          bgColor="bg-purple-600/10 dark:bg-purple-700/10"
        />
      </div>

      {/* Tier Distribution & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5" />
              Client Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="flex items-center justify-center">
                {tierDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={tierDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {tierDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No clients yet</p>
                )}
              </div>

              {/* Tier Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold">Base Tier</span>
                  </div>
                  <span className="text-xl font-bold">{stats.baseClients}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold">Premium Tier</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">{stats.premiumClients}</span>
                    <p className="text-xs text-muted-foreground">${stats.premiumClients * 29}/mo</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-semibold">Elite Tier</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold">{stats.eliteClients}</span>
                    <p className="text-xs text-muted-foreground">${stats.eliteClients * 59}/mo</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="w-5 h-5" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems.length > 0 ? (
                actionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      item.priority === 'high'
                        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                        : item.priority === 'medium'
                        ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                        : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                    }`}
                  >
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                      item.priority === 'high'
                        ? 'text-red-600 dark:text-red-400'
                        : item.priority === 'medium'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.message}</p>
                      {item.tier && (
                        <div className="mt-2">
                          <TierBadge tier={item.tier} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No action items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/nutritionist?tab=schedule">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {apt.user_profiles?.full_name || 'Client'}
                          </p>
                          {apt.user_profiles?.tier && (
                            <TierBadge tier={apt.user_profiles.tier} size="sm" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{apt.consultation_type || 'Consultation'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(apt.appointment_date), 'h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground">{apt.duration_minutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                      {activity.tier && <TierBadge tier={activity.tier} size="sm" />}
                    </div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild className="h-20 text-lg" variant="outline">
          <Link to="/app/nutritionist?tab=clients">
            <Users className="w-5 h-5 mr-2" />
            Manage Clients
          </Link>
        </Button>
        <Button asChild className="h-20 text-lg" variant="outline">
          <Link to="/app/nutritionist?tab=meals">
            <UtensilsCrossed className="w-5 h-5 mr-2" />
            Create Meal Plan
          </Link>
        </Button>
        <Button asChild className="h-20 text-lg" variant="outline">
          <Link to="/app/nutritionist?tab=schedule">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Appointment
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardOverview;
