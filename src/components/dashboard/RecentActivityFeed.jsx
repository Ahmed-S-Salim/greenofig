import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Utensils,
  Dumbbell,
  Droplets,
  Camera,
  MessageCircle,
  Target,
  Award,
  TrendingUp,
  Calendar,
  CheckCircle,
  Star,
  Zap,
  Heart,
  BookOpen,
  Apple,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const RecentActivityFeed = ({ limit = 10, compact = false }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchRecentActivities();
      subscribeToActivities();
    }
  }, [user]);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);

      // Fetch from multiple tables and combine
      const [meals, workouts, water, photos, messages, achievements, goals] = await Promise.all([
        supabase
          .from('meals')
          .select('id, meal_name, meal_time, calories, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('workouts')
          .select('id, workout_name, duration_minutes, calories_burned, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('water_intake')
          .select('id, amount_ml, logged_at')
          .eq('user_id', user.id)
          .order('logged_at', { ascending: false })
          .limit(5),

        supabase
          .from('progress_photos')
          .select('id, photo_url, weight, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),

        supabase
          .from('messages')
          .select('id, message_text, created_at')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(3),

        supabase
          .from('user_achievements')
          .select('id, achievement_name, points_earned, unlocked_at')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false })
          .limit(3),

        supabase
          .from('weekly_goals')
          .select('id, goal_name, target_value, current_value, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      // Transform and combine all activities
      const allActivities = [
        ...(meals.data || []).map(m => ({
          id: `meal-${m.id}`,
          type: 'meal',
          title: `Logged ${m.meal_name}`,
          description: `${m.calories} calories`,
          timestamp: m.created_at,
          icon: Utensils,
          color: 'from-green-500 to-emerald-600',
          data: m
        })),
        ...(workouts.data || []).map(w => ({
          id: `workout-${w.id}`,
          type: 'workout',
          title: w.workout_name,
          description: `${w.duration_minutes} min • ${w.calories_burned} cal burned`,
          timestamp: w.created_at,
          icon: Dumbbell,
          color: 'from-blue-500 to-cyan-600',
          data: w
        })),
        ...(water.data || []).map(w => ({
          id: `water-${w.id}`,
          type: 'water',
          title: 'Logged water',
          description: `${w.amount_ml}ml`,
          timestamp: w.logged_at,
          icon: Droplets,
          color: 'from-cyan-400 to-blue-500',
          data: w
        })),
        ...(photos.data || []).map(p => ({
          id: `photo-${p.id}`,
          type: 'photo',
          title: 'Added progress photo',
          description: p.weight ? `Weight: ${p.weight}kg` : 'Progress tracked',
          timestamp: p.created_at,
          icon: Camera,
          color: 'from-purple-500 to-pink-600',
          data: p
        })),
        ...(messages.data || []).map(m => ({
          id: `message-${m.id}`,
          type: 'message',
          title: 'New message',
          description: m.message_text?.substring(0, 50) + '...',
          timestamp: m.created_at,
          icon: MessageCircle,
          color: 'from-orange-500 to-red-600',
          data: m
        })),
        ...(achievements.data || []).map(a => ({
          id: `achievement-${a.id}`,
          type: 'achievement',
          title: `Unlocked: ${a.achievement_name}`,
          description: `+${a.points_earned} XP`,
          timestamp: a.unlocked_at,
          icon: Award,
          color: 'from-yellow-500 to-orange-600',
          data: a
        })),
        ...(goals.data || []).map(g => ({
          id: `goal-${g.id}`,
          type: 'goal',
          title: `Goal: ${g.goal_name}`,
          description: `${Math.round((g.current_value / g.target_value) * 100)}% complete`,
          timestamp: g.created_at,
          icon: Target,
          color: 'from-indigo-500 to-purple-600',
          data: g
        }))
      ];

      // Sort by timestamp and limit
      const sorted = allActivities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      setActivities(sorted);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivities = () => {
    // Subscribe to real-time updates for new activities
    const channels = [
      supabase.channel(`meals-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'meals',
          filter: `user_id=eq.${user.id}`
        }, () => fetchRecentActivities())
        .subscribe(),

      supabase.channel(`workouts-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'workouts',
          filter: `user_id=eq.${user.id}`
        }, () => fetchRecentActivities())
        .subscribe(),

      supabase.channel(`water-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'water_intake',
          filter: `user_id=eq.${user.id}`
        }, () => fetchRecentActivities())
        .subscribe(),

      supabase.channel(`achievements-feed-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        }, () => fetchRecentActivities())
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {activities.slice(0, 5).map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <div className="text-xs text-muted-foreground flex-shrink-0">
                {getRelativeTime(activity.timestamp)}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-full">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Recent Activity
                <Badge variant="secondary" className="ml-2">
                  {activities.length}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Your latest actions</p>
            </div>
          </div>

          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start logging meals, workouts, or tracking progress!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline Line */}
                      {index < activities.length - 1 && (
                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gradient-to-b from-muted to-transparent" />
                      )}

                      <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all group">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow relative z-10`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm">{activity.title}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                              {getRelativeTime(activity.timestamp)}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </p>

                          {/* Activity-specific extras */}
                          {activity.type === 'achievement' && (
                            <div className="flex items-center gap-1 text-xs">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                                Achievement unlocked!
                              </span>
                            </div>
                          )}

                          {activity.type === 'goal' && activity.data.status === 'completed' && (
                            <div className="flex items-center gap-1 text-xs">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span className="text-green-600 dark:text-green-400 font-semibold">
                                Goal completed!
                              </span>
                            </div>
                          )}

                          {activity.type === 'photo' && activity.data.photo_url && (
                            <div className="mt-2">
                              <img
                                src={activity.data.photo_url}
                                alt="Progress"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* View All Button */}
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button className="w-full text-sm text-primary hover:text-primary/80 font-medium transition-colors">
              View All Activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
