import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Flame, Zap, Target, Droplets, Trophy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const StreakTracker = ({ activityType, compact = false }) => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);

  const streakIcons = {
    logging: Zap,
    workouts: Trophy,
    meals: Target,
    water: Droplets
  };

  const Icon = streakIcons[activityType] || Flame;

  const streakColors = {
    logging: 'from-yellow-500 to-orange-500',
    workouts: 'from-blue-500 to-purple-500',
    meals: 'from-green-500 to-emerald-500',
    water: 'from-cyan-500 to-blue-500'
  };

  const color = streakColors[activityType] || 'from-orange-500 to-red-500';

  useEffect(() => {
    if (user?.id) {
      fetchStreak();
    }
  }, [user, activityType]);

  const fetchStreak = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('streak_type', activityType)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Initialize streak
        const { data: newStreak, error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            streak_type: activityType,
            current_streak: 0,
            longest_streak: 0
          })
          .select()
          .single();

        if (!insertError) {
          setStreak(newStreak);
        }
      } else {
        setStreak(data);
      }
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      // Call the database function to update streak
      const { error } = await supabase
        .rpc('update_user_streak', {
          p_user_id: user.id,
          p_streak_type: activityType
        });

      if (!error) {
        // Refetch streak data
        await fetchStreak();

        // Show celebration if streak increased
        setCelebrating(true);
        setTimeout(() => setCelebrating(false), 2000);

        toast({
          title: "Streak Updated! 🔥",
          description: `You're on a ${streak?.current_streak || 0} day streak!`
        });
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-4 h-24"></CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <motion.div
        className={`relative flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r ${color} text-white`}
        animate={celebrating ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Icon className="w-4 h-4" />
        <span className="font-bold text-sm">{streak?.current_streak || 0}</span>
        {celebrating && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: -20 }}
            transition={{ duration: 1 }}
            className="absolute -top-6 left-1/2 transform -translate-x-1/2"
          >
            <span className="text-2xl">🎉</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <Card className="glass-effect overflow-hidden">
      <CardContent className="p-0">
        <div className={`relative bg-gradient-to-r ${color} p-6 text-white`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm opacity-90 capitalize">{activityType} Streak</p>
                <p className="text-3xl font-bold">{streak?.current_streak || 0} days</p>
              </div>
            </div>

            {celebrating && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-5xl"
              >
                🎉
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="opacity-75">Best Streak</p>
              <p className="font-semibold">{streak?.longest_streak || 0} days</p>
            </div>
            <div className="text-right">
              <p className="opacity-75">Last Activity</p>
              <p className="font-semibold">
                {streak?.last_activity_date
                  ? new Date(streak.last_activity_date).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>

          {/* Streak Milestones */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  (streak?.current_streak || 0) >= 3 ? 'bg-white/30' : 'bg-white/10'
                }`}>
                  <span className="text-lg">{(streak?.current_streak || 0) >= 3 ? '🥉' : '🔒'}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">3 days</p>
              </div>
              <div className="text-center flex-1">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  (streak?.current_streak || 0) >= 7 ? 'bg-white/30' : 'bg-white/10'
                }`}>
                  <span className="text-lg">{(streak?.current_streak || 0) >= 7 ? '🥈' : '🔒'}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">7 days</p>
              </div>
              <div className="text-center flex-1">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  (streak?.current_streak || 0) >= 30 ? 'bg-white/30' : 'bg-white/10'
                }`}>
                  <span className="text-lg">{(streak?.current_streak || 0) >= 30 ? '🥇' : '🔒'}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">30 days</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakTracker;
