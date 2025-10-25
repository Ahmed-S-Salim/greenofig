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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    activeMealPlans: 0,
    upcomingAppointments: 0,
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
      // Fetch total clients (users assigned to this nutritionist)
      const { data: clientsData, error: clientsError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, created_at')
        .eq('role', 'user');

      if (clientsError) throw clientsError;

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
        .select('*, user_profiles!appointments_client_id_fkey(full_name)')
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
        activeClients: clientsData?.length || 0, // TODO: Add logic for active vs inactive
        activeMealPlans: mealPlansData?.length || 0,
        upcomingAppointments: appointmentsData?.length || 0,
      });

      setTodayAppointments(todayAppts);

      // Mock recent activity (TODO: implement real activity feed)
      setRecentActivity([
        { id: 1, type: 'client_joined', message: 'New client registered', time: '2 hours ago' },
        { id: 2, type: 'meal_plan', message: 'Meal plan created for Sarah Johnson', time: '5 hours ago' },
        { id: 3, type: 'appointment', message: 'Consultation completed with Mike Chen', time: '1 day ago' },
      ]);

      // Mock action items (TODO: implement real logic)
      setActionItems([
        { id: 1, message: '3 clients need follow-up this week', priority: 'high' },
        { id: 2, message: '2 meal plans pending review', priority: 'medium' },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, change, color }) => (
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
          <div className={`p-4 rounded-full ${color || 'bg-primary/10'}`}>
            <Icon className={`w-6 h-6 ${color ? 'text-primary-foreground' : 'text-primary'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.totalClients}
          change="+12% this month"
        />
        <StatCard
          icon={UtensilsCrossed}
          label="Active Meal Plans"
          value={stats.activeMealPlans}
          color="bg-green-600 dark:bg-green-700"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Appointments"
          value={stats.upcomingAppointments}
          color="bg-blue-600 dark:bg-blue-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Client Success Rate"
          value="87%"
          change="+5% this month"
          color="bg-purple-600 dark:bg-purple-700"
        />
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
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                      <div>
                        <p className="font-semibold text-foreground">{apt.user_profiles?.full_name || 'Client'}</p>
                        <p className="text-sm text-muted-foreground">{apt.consultation_type || 'Consultation'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{format(new Date(apt.appointment_date), 'h:mm a')}</p>
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
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    item.priority === 'high'
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                      : 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'
                  }`}
                >
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                    item.priority === 'high' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                  <p className="text-sm text-foreground">{item.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
