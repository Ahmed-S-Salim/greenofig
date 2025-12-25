import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Target,
  Calendar,
  MessageSquare,
  Clock,
  TrendingDown,
  CreditCard,
  ChevronRight,
  User,
  Scale,
  Check,
  X
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

// Quick Client Alerts Widget
export const ClientAlertsWidget = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const alertsList = [];

      // Fetch clients
      const { data: clients } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, tier, created_at')
        .eq('role', 'user');

      // Fetch last progress for each client
      for (const client of (clients || [])) {
        const { data: lastProgress } = await supabase
          .from('client_progress')
          .select('created_at, weight_kg')
          .eq('user_id', client.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastWeighIn = lastProgress?.[0]?.created_at;
        const daysSinceWeighIn = lastWeighIn ? differenceInDays(new Date(), new Date(lastWeighIn)) : 999;

        // Missed weigh-in (7+ days)
        if (daysSinceWeighIn >= 7) {
          alertsList.push({
            id: `weighin-${client.id}`,
            type: 'missed_weighin',
            priority: daysSinceWeighIn >= 14 ? 'high' : 'medium',
            client,
            message: `No weigh-in for ${daysSinceWeighIn} days`,
            icon: Scale,
            action: 'message'
          });
        }

        // Check for unanswered messages
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id, created_at')
          .eq('sender_id', client.id)
          .eq('recipient_id', user?.id)
          .eq('is_read', false);

        if (unreadMessages && unreadMessages.length > 0) {
          const oldestMessage = unreadMessages.reduce((oldest, msg) =>
            new Date(msg.created_at) < new Date(oldest.created_at) ? msg : oldest
          );
          const daysUnanswered = differenceInDays(new Date(), new Date(oldestMessage.created_at));

          if (daysUnanswered >= 1) {
            alertsList.push({
              id: `message-${client.id}`,
              type: 'unanswered_message',
              priority: daysUnanswered >= 3 ? 'high' : 'medium',
              client,
              message: `${unreadMessages.length} unanswered message${unreadMessages.length > 1 ? 's' : ''} (${daysUnanswered}d)`,
              icon: MessageSquare,
              action: 'message'
            });
          }
        }
      }

      // Sort by priority
      alertsList.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setAlerts(alertsList.slice(0, 10));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (alert) => {
    if (alert.action === 'message') {
      navigate(`/app/nutritionist/messages?conversation=${alert.client.id}`);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          {t('nutritionistDashboard.clientAlerts', 'Client Alerts')}
          {alerts.length > 0 && (
            <Badge variant="destructive">{alerts.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">{t('nutritionistDashboard.loading', 'Loading...')}</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>{t('nutritionistDashboard.noAlertsAllOnTrack', 'No alerts - all clients on track!')}</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  alert.priority === 'high' ? 'bg-red-500/10 border border-red-500/20' :
                  alert.priority === 'medium' ? 'bg-orange-500/10 border border-orange-500/20' :
                  'bg-muted/50'
                }`}
                onClick={() => handleAction(alert)}
              >
                <alert.icon className={`w-4 h-4 ${
                  alert.priority === 'high' ? 'text-red-500' : 'text-orange-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{alert.client.full_name}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Weekly Goal Progress Widget
export const WeeklyGoalProgressWidget = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [goals, setGoals] = useState({ achieved: 0, total: 0, percentage: 0 });
  const [clientGoals, setClientGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyGoals();
  }, []);

  const fetchWeeklyGoals = async () => {
    setLoading(true);
    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const { data: goalsData } = await supabase
        .from('client_goals')
        .select(`
          *,
          client:user_profiles!client_goals_client_id_fkey(full_name, email)
        `)
        .eq('status', 'active')
        .not('target_date', 'is', null);

      // Filter goals with target this week
      const thisWeekGoals = (goalsData || []).filter(goal => {
        const targetDate = new Date(goal.target_date);
        const weekEnd = addDays(weekStart, 7);
        return targetDate >= weekStart && targetDate < weekEnd;
      });

      // Check which goals are on track
      const goalsWithProgress = thisWeekGoals.map(goal => {
        const progress = goal.current_value && goal.target_value
          ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
          : 0;
        return {
          ...goal,
          progress,
          onTrack: progress >= 70
        };
      });

      const achieved = goalsWithProgress.filter(g => g.onTrack).length;
      const total = goalsWithProgress.length;

      setGoals({
        achieved,
        total,
        percentage: total > 0 ? Math.round((achieved / total) * 100) : 0
      });
      setClientGoals(goalsWithProgress.slice(0, 5));
    } catch (error) {
      console.error('Error fetching weekly goals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Target className="w-5 h-5 text-green-500" />
          {t('nutritionistDashboard.weeklyGoalProgress', 'Weekly Goal Progress')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">{t('nutritionistDashboard.loading', 'Loading...')}</div>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-green-500">{goals.percentage}%</div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? `${goals.achieved} من ${goals.total} عميل على المسار` : `${goals.achieved} of ${goals.total} clients on track`}
              </p>
              <Progress value={goals.percentage} className="mt-2 h-2" />
            </div>

            {clientGoals.length > 0 && (
              <div className="space-y-2 mt-4">
                {clientGoals.map(goal => (
                  <div key={goal.id} className="flex items-center gap-2 text-sm">
                    {goal.onTrack ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                    <span className="truncate flex-1">{goal.client?.full_name}</span>
                    <span className="text-muted-foreground">{goal.progress}%</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Upcoming Renewals Widget
export const UpcomingRenewalsWidget = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      // Fetch clients with subscription info
      const { data: clients } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, tier, subscription_end_date, created_at')
        .eq('role', 'user')
        .not('tier', 'eq', 'Base')
        .not('subscription_end_date', 'is', null)
        .order('subscription_end_date', { ascending: true });

      // Filter for renewals in next 30 days
      const now = new Date();
      const thirtyDaysFromNow = addDays(now, 30);

      const upcomingRenewals = (clients || [])
        .filter(client => {
          const endDate = new Date(client.subscription_end_date);
          return endDate >= now && endDate <= thirtyDaysFromNow;
        })
        .map(client => ({
          ...client,
          daysUntilRenewal: differenceInDays(new Date(client.subscription_end_date), now)
        }));

      setRenewals(upcomingRenewals.slice(0, 5));
    } catch (error) {
      console.error('Error fetching renewals:', error);
      // If subscription_end_date column doesn't exist, silently fail
      setRenewals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CreditCard className="w-5 h-5 text-blue-500" />
          {t('nutritionistDashboard.upcomingRenewals', 'Upcoming Renewals')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">{t('nutritionistDashboard.loading', 'Loading...')}</div>
        ) : renewals.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{t('nutritionistDashboard.noRenewalsNext30Days', 'No renewals in the next 30 days')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {renewals.map(client => (
              <div key={client.id} className={`flex items-center gap-3 p-2 rounded-lg bg-muted/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.full_name}</p>
                  <Badge variant="outline" className="text-xs">{client.tier}</Badge>
                </div>
                <div className={isRTL ? 'text-left' : 'text-right'}>
                  <p className={`text-sm font-semibold ${
                    client.daysUntilRenewal <= 7 ? 'text-red-500' :
                    client.daysUntilRenewal <= 14 ? 'text-orange-500' :
                    'text-muted-foreground'
                  }`}>
                    {client.daysUntilRenewal}{isRTL ? 'ي' : 'd'}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('nutritionistDashboard.daysUntilRenewal', 'until renewal')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Action Items Widget
export const ActionItemsWidget = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActionItems();
  }, []);

  const fetchActionItems = async () => {
    setLoading(true);
    try {
      const items = [];

      // Check for appointments today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('*, client:user_profiles!appointments_client_id_fkey(full_name)')
        .eq('date', today)
        .eq('status', 'scheduled');

      if (todayAppointments && todayAppointments.length > 0) {
        items.push({
          id: 'appointments',
          icon: Calendar,
          title: `${todayAppointments.length} appointment${todayAppointments.length > 1 ? 's' : ''} today`,
          description: todayAppointments.map(a => a.client?.full_name).slice(0, 2).join(', '),
          action: () => navigate('/app/nutritionist/schedule'),
          priority: 'high'
        });
      }

      // Check for unread messages
      const { data: unreadMessages, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user?.id)
        .eq('is_read', false);

      if (count && count > 0) {
        items.push({
          id: 'messages',
          icon: MessageSquare,
          title: `${count} unread message${count > 1 ? 's' : ''}`,
          description: 'Review and respond to clients',
          action: () => navigate('/app/nutritionist/messages'),
          priority: 'medium'
        });
      }

      // Check for clients without meal plans
      const { data: clientsWithoutPlans } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'user')
        .not('id', 'in', supabase.from('meal_plans_v2').select('client_id'));

      // This is a simplified check - in production you'd want a proper query

      setActionItems(items.slice(0, 5));
    } catch (error) {
      console.error('Error fetching action items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader className="pb-3">
        <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Bell className="w-5 h-5 text-purple-500" />
          {t('nutritionistDashboard.actionItems', 'Action Items')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">{t('nutritionistDashboard.loading', 'Loading...')}</div>
        ) : actionItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>{t('nutritionistDashboard.allCaughtUp', 'All caught up!')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionItems.map(item => (
              <div
                key={item.id}
                onClick={item.action}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                  item.priority === 'high' ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <item.icon className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Export all widgets
export default {
  ClientAlertsWidget,
  WeeklyGoalProgressWidget,
  UpcomingRenewalsWidget,
  ActionItemsWidget
};
