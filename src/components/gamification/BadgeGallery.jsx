import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Sparkles, Filter, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BadgeGallery = ({ compact = false }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tiers = ['all', 'bronze', 'silver', 'gold', 'platinum'];
  const categories = ['all', 'streaks', 'goals', 'social', 'learning', 'elite'];

  useEffect(() => {
    if (user?.id) {
      fetchAchievements();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('tier', { ascending: true })
        .order('points_required', { ascending: true });

      if (!error) {
        setAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, points_earned')
        .eq('user_id', user.id);

      if (!error) {
        setUserAchievements(data || []);
      }
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (achievementId) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockedDate = (achievementId) => {
    const achievement = userAchievements.find(ua => ua.achievement_id === achievementId);
    return achievement ? new Date(achievement.unlocked_at).toLocaleDateString() : null;
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      case 'platinum':
        return '💎';
      default:
        return '🏆';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'streaks':
        return '🔥';
      case 'goals':
        return '🎯';
      case 'social':
        return '👥';
      case 'learning':
        return '📚';
      case 'elite':
        return '👑';
      default:
        return '⭐';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const tierMatch = selectedTier === 'all' || achievement.tier === selectedTier;
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    return tierMatch && categoryMatch;
  });

  const stats = {
    total: achievements.length,
    unlocked: userAchievements.length,
    totalPoints: userAchievements.reduce((sum, ua) => sum + (ua.points_earned || 0), 0),
    bronze: userAchievements.filter(ua => {
      const a = achievements.find(ach => ach.id === ua.achievement_id);
      return a?.tier === 'bronze';
    }).length,
    silver: userAchievements.filter(ua => {
      const a = achievements.find(ach => ach.id === ua.achievement_id);
      return a?.tier === 'silver';
    }).length,
    gold: userAchievements.filter(ua => {
      const a = achievements.find(ach => ach.id === ua.achievement_id);
      return a?.tier === 'gold';
    }).length,
    platinum: userAchievements.filter(ua => {
      const a = achievements.find(ach => ach.id === ua.achievement_id);
      return a?.tier === 'platinum';
    }).length
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10">
          <p className="text-2xl font-bold text-amber-600">{stats.bronze}</p>
          <p className="text-xs text-muted-foreground">Bronze</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-gray-400/10 to-gray-600/10">
          <p className="text-2xl font-bold text-gray-600">{stats.silver}</p>
          <p className="text-xs text-muted-foreground">Silver</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-400/10 to-yellow-600/10">
          <p className="text-2xl font-bold text-yellow-600">{stats.gold}</p>
          <p className="text-xs text-muted-foreground">Gold</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-gradient-to-br from-purple-400/10 to-purple-600/10">
          <p className="text-2xl font-bold text-purple-600">{stats.platinum}</p>
          <p className="text-xs text-muted-foreground">Platinum</p>
        </div>
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
                Achievement Gallery
                <Badge variant="secondary" className="ml-2">
                  {stats.unlocked}/{stats.total}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalPoints} total XP earned
              </p>
            </div>
          </div>

          {/* Completion Progress */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-semibold">
                {Math.round((stats.unlocked / stats.total) * 100)}% Complete
              </p>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.unlocked / stats.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Tier Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Tier:</span>
            {tiers.map(tier => (
              <Button
                key={tier}
                size="sm"
                variant={selectedTier === tier ? 'default' : 'outline'}
                onClick={() => setSelectedTier(tier)}
                className="capitalize"
              >
                {tier === 'all' ? 'All' : getTierIcon(tier)} {tier}
              </Button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Star className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">Category:</span>
            {categories.map(category => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All' : getCategoryIcon(category)} {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-200 dark:border-amber-800">
            <div className="text-3xl mb-1">{getTierIcon('bronze')}</div>
            <p className="text-2xl font-bold text-amber-600">{stats.bronze}</p>
            <p className="text-xs text-muted-foreground">Bronze Badges</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-gray-400/10 to-gray-600/10 border border-gray-200 dark:border-gray-800">
            <div className="text-3xl mb-1">{getTierIcon('silver')}</div>
            <p className="text-2xl font-bold text-gray-600">{stats.silver}</p>
            <p className="text-xs text-muted-foreground">Silver Badges</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border border-yellow-200 dark:border-yellow-800">
            <div className="text-3xl mb-1">{getTierIcon('gold')}</div>
            <p className="text-2xl font-bold text-yellow-600">{stats.gold}</p>
            <p className="text-xs text-muted-foreground">Gold Badges</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-400/10 to-purple-600/10 border border-purple-200 dark:border-purple-800">
            <div className="text-3xl mb-1">{getTierIcon('platinum')}</div>
            <p className="text-2xl font-bold text-purple-600">{stats.platinum}</p>
            <p className="text-xs text-muted-foreground">Platinum Badges</p>
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement, index) => {
            const unlocked = isUnlocked(achievement.id);
            const unlockedDate = getUnlockedDate(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: unlocked ? 1.05 : 1 }}
                className="relative"
              >
                <div
                  className={`relative overflow-hidden rounded-xl p-6 text-center ${
                    unlocked
                      ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white shadow-lg`
                      : 'bg-muted border-2 border-dashed border-muted-foreground/30'
                  }`}
                >
                  {/* Locked Overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white/80" />
                    </div>
                  )}

                  {/* Achievement Icon */}
                  <div className={`text-5xl mb-3 ${!unlocked && 'opacity-30'}`}>
                    {achievement.icon || getTierIcon(achievement.tier)}
                  </div>

                  {/* Achievement Name */}
                  <h3 className={`font-bold mb-2 ${unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </h3>

                  {/* Achievement Description */}
                  <p className={`text-xs mb-3 line-clamp-2 ${unlocked ? 'text-white/90' : 'text-muted-foreground/70'}`}>
                    {achievement.description}
                  </p>

                  {/* Points Badge */}
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    unlocked
                      ? 'bg-white/20 text-white'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    <Zap className="w-3 h-3" />
                    {achievement.points_required} XP
                  </div>

                  {/* Unlocked Date */}
                  {unlocked && unlockedDate && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <p className="text-xs text-white/70">
                        Unlocked {unlockedDate}
                      </p>
                    </div>
                  )}

                  {/* Tier Badge */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      unlocked ? 'bg-white/20' : 'bg-muted-foreground/20'
                    }`}>
                      {getTierIcon(achievement.tier)}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      unlocked ? 'bg-white/20' : 'bg-muted-foreground/20'
                    }`}>
                      {getCategoryIcon(achievement.category)}
                    </div>
                  </div>

                  {/* Sparkle Effect for Unlocked */}
                  {unlocked && (
                    <motion.div
                      className="absolute top-1 right-1"
                      animate={{
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No achievements found with selected filters</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTier('all');
                setSelectedCategory('all');
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeGallery;
