import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Trophy,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
  Crown,
  Gift,
  Sparkles
} from 'lucide-react';

const GamificationSystem = ({ compact = false }) => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);

      // Fetch streaks
      const { data: streaksData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id);

      setStreaks(streaksData || []);

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      setAchievements(achievementsData || []);

      // Fetch level
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setLevel(levelData);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakIcon = (streakType) => {
    switch (streakType) {
      case 'logging': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'workouts': return <Trophy className="w-5 h-5 text-blue-500" />;
      case 'meals': return <Target className="w-5 h-5 text-green-500" />;
      case 'water': return <Sparkles className="w-5 h-5 text-cyan-500" />;
      default: return <Flame className="w-5 h-5 text-orange-500" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'silver': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'gold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'platinum': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getLevelProgress = () => {
    if (!level) return 0;
    const xpForCurrentLevel = Math.pow(level.current_level - 1, 2) * 100;
    const xpForNextLevel = Math.pow(level.current_level, 2) * 100;
    const xpInCurrentLevel = level.total_xp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return (xpInCurrentLevel / xpNeededForLevel) * 100;
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Compact view for dashboard header
    return (
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        {level && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <Crown className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Level {level.current_level}</span>
          </div>
        )}

        {/* Highest Streak */}
        {streaks.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-sm">
              {Math.max(...streaks.map(s => s.current_streak))} day streak
            </span>
          </div>
        )}

        {/* Achievement Count */}
        {achievements.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-sm">{achievements.length} achievements</span>
          </div>
        )}
      </div>
    );
  }

  // Full gamification dashboard
  return (
    <div className="space-y-6">
      {/* Achievement Notification */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-xl shadow-2xl max-w-sm"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{newAchievement.achievement_icon}</div>
              <div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="font-semibold">{newAchievement.achievement_name}</p>
                <p className="text-sm opacity-90">{newAchievement.achievement_description}</p>
                <p className="text-sm font-bold mt-2">+{newAchievement.points_earned} XP</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Progress */}
      {level && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">Level {level.current_level}</p>
                <p className="text-sm text-muted-foreground">{level.level_name}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{level.total_xp} XP</p>
                <p className="text-xs text-muted-foreground">
                  {Math.pow(level.current_level, 2) * 100 - level.total_xp} XP to next level
                </p>
              </div>
            </div>
            <Progress value={getLevelProgress()} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* Streaks */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Your Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {streaks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Start logging activities to build your streaks!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {streaks.map((streak) => (
                <div
                  key={streak.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
                >
                  <div className="flex items-center gap-3">
                    {getStreakIcon(streak.streak_type)}
                    <div>
                      <p className="font-semibold capitalize">{streak.streak_type}</p>
                      <p className="text-xs text-muted-foreground">
                        Longest: {streak.longest_streak} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">
                      {streak.current_streak}
                    </p>
                    <p className="text-xs text-muted-foreground">days</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Achievements ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Complete activities to unlock achievements!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg border border-border hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{achievement.achievement_icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{achievement.achievement_name}</p>
                        <Badge className={getTierColor(achievement.tier)}>
                          {achievement.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.achievement_description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Zap className="w-3 h-3" />
                        <span>+{achievement.points_earned} XP</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSystem;
