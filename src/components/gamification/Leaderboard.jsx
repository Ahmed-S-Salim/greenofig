import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Calendar, Users, Award, Zap, Target, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Leaderboard = ({ compact = false }) => {
  const { user } = useAuth();
  const [period, setPeriod] = useState('weekly'); // weekly, monthly, all-time
  const [leaderboardType, setLeaderboardType] = useState('xp'); // xp, achievements, streaks
  const [topUsers, setTopUsers] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchLeaderboard();
    }
  }, [user, period, leaderboardType]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          username,
          avatar_url,
          user_levels (
            current_level,
            total_xp,
            level_name
          )
        `);

      // Fetch based on leaderboard type
      if (leaderboardType === 'xp') {
        const { data, error } = await query
          .not('user_levels', 'is', null)
          .order('user_levels(total_xp)', { ascending: false })
          .limit(100);

        if (!error) {
          processXPLeaderboard(data);
        }
      } else if (leaderboardType === 'achievements') {
        await fetchAchievementLeaderboard();
      } else if (leaderboardType === 'streaks') {
        await fetchStreakLeaderboard();
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const processXPLeaderboard = (data) => {
    const filtered = filterByPeriod(data);
    const sorted = filtered.sort((a, b) => {
      const aXP = a.user_levels?.[0]?.total_xp || 0;
      const bXP = b.user_levels?.[0]?.total_xp || 0;
      return bXP - aXP;
    });

    setTopUsers(sorted.slice(0, 50));

    // Find current user's rank
    const userIndex = sorted.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      setUserRank({
        rank: userIndex + 1,
        user: sorted[userIndex],
        total: sorted.length
      });
    }
  };

  const fetchAchievementLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        user_id,
        achievement_id,
        unlocked_at,
        points_earned,
        user_profiles (
          id,
          full_name,
          username,
          avatar_url
        )
      `);

    if (!error) {
      // Group by user and count achievements
      const userAchievements = {};
      data.forEach(achievement => {
        const userId = achievement.user_id;
        if (!userAchievements[userId]) {
          userAchievements[userId] = {
            user: achievement.user_profiles,
            count: 0,
            totalPoints: 0,
            achievements: []
          };
        }
        userAchievements[userId].count++;
        userAchievements[userId].totalPoints += achievement.points_earned || 0;
        userAchievements[userId].achievements.push(achievement);
      });

      // Convert to array and sort
      const leaderboard = Object.entries(userAchievements).map(([userId, data]) => ({
        id: userId,
        ...data.user,
        achievementCount: data.count,
        achievementPoints: data.totalPoints
      }));

      const filtered = filterByPeriod(leaderboard, 'achievements');
      const sorted = filtered.sort((a, b) => b.achievementCount - a.achievementCount);

      setTopUsers(sorted.slice(0, 50));

      // Find user rank
      const userIndex = sorted.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        setUserRank({
          rank: userIndex + 1,
          user: sorted[userIndex],
          total: sorted.length
        });
      }
    }
  };

  const fetchStreakLeaderboard = async () => {
    const { data, error } = await supabase
      .from('user_streaks')
      .select(`
        user_id,
        streak_type,
        current_streak,
        longest_streak,
        user_profiles (
          id,
          full_name,
          username,
          avatar_url
        )
      `);

    if (!error) {
      // Group by user and sum all streaks
      const userStreaks = {};
      data.forEach(streak => {
        const userId = streak.user_id;
        if (!userStreaks[userId]) {
          userStreaks[userId] = {
            user: streak.user_profiles,
            totalStreak: 0,
            longestStreak: 0
          };
        }
        userStreaks[userId].totalStreak += streak.current_streak || 0;
        userStreaks[userId].longestStreak = Math.max(
          userStreaks[userId].longestStreak,
          streak.longest_streak || 0
        );
      });

      // Convert to array and sort
      const leaderboard = Object.entries(userStreaks).map(([userId, data]) => ({
        id: userId,
        ...data.user,
        totalStreak: data.totalStreak,
        longestStreak: data.longestStreak
      }));

      const sorted = leaderboard.sort((a, b) => b.totalStreak - a.totalStreak);

      setTopUsers(sorted.slice(0, 50));

      // Find user rank
      const userIndex = sorted.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        setUserRank({
          rank: userIndex + 1,
          user: sorted[userIndex],
          total: sorted.length
        });
      }
    }
  };

  const filterByPeriod = (data, type = 'xp') => {
    if (period === 'all-time') return data;

    const now = new Date();
    const cutoffDate = new Date();

    if (period === 'weekly') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    // For achievements, filter by unlock date
    if (type === 'achievements') {
      return data.filter(user => {
        return user.achievements?.some(a => new Date(a.unlocked_at) >= cutoffDate);
      });
    }

    // For XP and streaks, we'd need updated_at columns to filter properly
    // For now, return all data
    return data;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getStatValue = (user) => {
    if (leaderboardType === 'xp') {
      return user.user_levels?.[0]?.total_xp || 0;
    } else if (leaderboardType === 'achievements') {
      return user.achievementCount || 0;
    } else if (leaderboardType === 'streaks') {
      return user.totalStreak || 0;
    }
    return 0;
  };

  const getStatLabel = () => {
    if (leaderboardType === 'xp') return 'XP';
    if (leaderboardType === 'achievements') return 'Achievements';
    if (leaderboardType === 'streaks') return 'Total Streak';
    return '';
  };

  const getLeaderboardIcon = () => {
    if (leaderboardType === 'xp') return <Zap className="w-5 h-5" />;
    if (leaderboardType === 'achievements') return <Award className="w-5 h-5" />;
    if (leaderboardType === 'streaks') return <Flame className="w-5 h-5" />;
    return <Trophy className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {topUsers.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5"
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankBadgeColor(index + 1)}`}>
              {getRankIcon(index + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.full_name || user.username || 'Anonymous'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{getStatValue(user).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Leaderboard
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {topUsers.length} users
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Compete with the community
              </p>
            </div>
          </div>

          {/* Your Rank */}
          {userRank && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Rank</p>
              <p className="text-2xl font-bold text-primary">#{userRank.rank}</p>
              <p className="text-xs text-muted-foreground">of {userRank.total} users</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <Tabs value={period} onValueChange={setPeriod} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly" className="text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="all-time" className="text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard Type */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            size="sm"
            variant={leaderboardType === 'xp' ? 'default' : 'outline'}
            onClick={() => setLeaderboardType('xp')}
          >
            <Zap className="w-4 h-4 mr-2" />
            XP
          </Button>
          <Button
            size="sm"
            variant={leaderboardType === 'achievements' ? 'default' : 'outline'}
            onClick={() => setLeaderboardType('achievements')}
          >
            <Award className="w-4 h-4 mr-2" />
            Achievements
          </Button>
          <Button
            size="sm"
            variant={leaderboardType === 'streaks' ? 'default' : 'outline'}
            onClick={() => setLeaderboardType('streaks')}
          >
            <Flame className="w-4 h-4 mr-2" />
            Streaks
          </Button>
        </div>

        {/* Top 3 Podium */}
        {topUsers.length >= 3 && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-2 sm:gap-4">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mb-2 ring-4 ring-gray-300">
                  <AvatarImage src={topUsers[1].avatar_url} />
                  <AvatarFallback>{topUsers[1].full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="bg-gradient-to-r from-gray-300 to-gray-500 text-white px-3 sm:px-4 py-6 sm:py-8 rounded-t-xl text-center min-w-[80px] sm:min-w-[100px]">
                  <Medal className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold mb-1 truncate">{topUsers[1].full_name || topUsers[1].username}</p>
                  <p className="text-lg sm:text-xl font-bold">{getStatValue(topUsers[1]).toLocaleString()}</p>
                  <p className="text-xs opacity-80">{getStatLabel()}</p>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 mb-2 ring-4 ring-yellow-400">
                  <AvatarImage src={topUsers[0].avatar_url} />
                  <AvatarFallback>{topUsers[0].full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 sm:px-4 py-8 sm:py-12 rounded-t-xl text-center min-w-[90px] sm:min-w-[120px]">
                  <Crown className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold mb-1 truncate">{topUsers[0].full_name || topUsers[0].username}</p>
                  <p className="text-xl sm:text-2xl font-bold">{getStatValue(topUsers[0]).toLocaleString()}</p>
                  <p className="text-xs opacity-80">{getStatLabel()}</p>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 mb-2 ring-4 ring-amber-600">
                  <AvatarImage src={topUsers[2].avatar_url} />
                  <AvatarFallback>{topUsers[2].full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white px-3 sm:px-4 py-4 sm:py-6 rounded-t-xl text-center min-w-[80px] sm:min-w-[100px]">
                  <Medal className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold mb-1 truncate">{topUsers[2].full_name || topUsers[2].username}</p>
                  <p className="text-lg sm:text-xl font-bold">{getStatValue(topUsers[2]).toLocaleString()}</p>
                  <p className="text-xs opacity-80">{getStatLabel()}</p>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="space-y-2">
          {topUsers.map((rankUser, index) => {
            const isCurrentUser = rankUser.id === user.id;

            return (
              <motion.div
                key={rankUser.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 border-2 border-primary'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 ${getRankBadgeColor(index + 1)}`}>
                  {getRankIcon(index + 1)}
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarImage src={rankUser.avatar_url} />
                  <AvatarFallback>{rankUser.full_name?.[0] || '?'}</AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate text-sm sm:text-base ${isCurrentUser ? 'text-primary' : ''}`}>
                    {rankUser.full_name || rankUser.username || 'Anonymous'}
                    {isCurrentUser && <span className="text-xs ml-2 opacity-70">(You)</span>}
                  </p>
                  {leaderboardType === 'xp' && rankUser.user_levels?.[0] && (
                    <p className="text-xs text-muted-foreground">
                      Level {rankUser.user_levels[0].current_level} • {rankUser.user_levels[0].level_name}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <p className="text-lg sm:text-xl font-bold">{getStatValue(rankUser).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{getStatLabel()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {topUsers.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No leaderboard data available yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start earning XP to appear on the leaderboard!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
