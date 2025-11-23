import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, TrendingUp, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const LevelProgressBar = ({ compact = false }) => {
  const { user } = useAuth();
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [levelingUp, setLevelingUp] = useState(false);
  const [prevLevel, setPrevLevel] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchLevel();
      subscribeToLevelChanges();
    }
  }, [user]);

  const fetchLevel = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Initialize user level
        const { data: newLevel, error: insertError } = await supabase
          .from('user_levels')
          .insert({
            user_id: user.id,
            current_level: 1,
            current_xp: 0,
            total_xp: 0,
            level_name: 'Bronze Beginner'
          })
          .select()
          .single();

        if (!insertError) {
          setLevel(newLevel);
        }
      } else {
        setLevel(data);
      }
    } catch (error) {
      console.error('Error fetching level:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLevelChanges = () => {
    const channel = supabase
      .channel(`level-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_levels',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const oldLevel = level?.current_level;
          const newLevel = payload.new.current_level;

          if (newLevel > oldLevel) {
            handleLevelUp(payload.new);
          } else {
            setLevel(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleLevelUp = (newLevelData) => {
    setPrevLevel(level);
    setLevel(newLevelData);
    setLevelingUp(true);

    // Trigger celebration
    celebrateLevelUp();

    // Reset animation after 3 seconds
    setTimeout(() => {
      setLevelingUp(false);
      setPrevLevel(null);
    }, 3000);
  };

  const celebrateLevelUp = () => {
    // Epic confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF8C00']
      });

      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF8C00']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Play level up sound
    try {
      const audio = new Audio('/sounds/level-up.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (error) {}
  };

  const getLevelProgress = () => {
    if (!level) return 0;
    const xpForCurrentLevel = Math.pow(level.current_level - 1, 2) * 100;
    const xpForNextLevel = Math.pow(level.current_level, 2) * 100;
    const xpInCurrentLevel = level.total_xp - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    return Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  };

  const getXPToNextLevel = () => {
    if (!level) return 0;
    const xpForNextLevel = Math.pow(level.current_level, 2) * 100;
    return xpForNextLevel - level.total_xp;
  };

  const getLevelColor = () => {
    const levelNum = level?.current_level || 1;
    if (levelNum >= 30) return 'from-purple-500 to-pink-500'; // Diamond
    if (levelNum >= 20) return 'from-blue-400 to-purple-500'; // Platinum
    if (levelNum >= 10) return 'from-yellow-400 to-yellow-600'; // Gold
    if (levelNum >= 5) return 'from-gray-400 to-gray-600'; // Silver
    return 'from-amber-600 to-amber-800'; // Bronze
  };

  const getLevelIcon = () => {
    const levelNum = level?.current_level || 1;
    if (levelNum >= 30) return '💎';
    if (levelNum >= 20) return '👑';
    if (levelNum >= 10) return '🏆';
    if (levelNum >= 5) return '⭐';
    return '🥉';
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold"
          animate={levelingUp ? { scale: [1, 1.2, 1], rotate: [0, 360] } : {}}
          transition={{ duration: 0.6 }}
        >
          {level?.current_level}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Level {level?.current_level}</p>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold">{level?.total_xp} XP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Level Up Animation Overlay */}
      <AnimatePresence>
        {levelingUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-8 rounded-2xl shadow-2xl text-white text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mb-4"
              >
                {getLevelIcon()}
              </motion.div>

              <h2 className="text-4xl font-bold mb-2">LEVEL UP!</h2>
              <p className="text-2xl font-semibold mb-4">
                Level {prevLevel?.current_level} → Level {level?.current_level}
              </p>
              <p className="text-lg mb-4">{level?.level_name}</p>

              <div className="flex items-center justify-center gap-2 text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Keep up the great work!</span>
                <Sparkles className="w-5 h-5" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Level Card */}
      <Card className="glass-effect overflow-hidden">
        <div className={`relative bg-gradient-to-r ${getLevelColor()} p-6 text-white`}>
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="w-5 h-5" />
              Your Level
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm text-4xl font-bold"
                whileHover={{ scale: 1.1 }}
              >
                {getLevelIcon()}
              </motion.div>

              <div className="flex-1">
                <p className="text-3xl font-bold mb-1">Level {level?.current_level}</p>
                <p className="text-sm opacity-90">{level?.level_name}</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">{level?.total_xp} XP</p>
                <p className="text-xs opacity-75">Total Experience</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Progress to Level {level?.current_level + 1}</span>
                <span className="font-semibold">{Math.round(getLevelProgress())}%</span>
              </div>

              <div className="relative">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getLevelProgress()}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>

                {/* XP Remaining Badge */}
                <motion.div
                  className="absolute -top-8 right-0 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>{getXPToNextLevel()} XP to go</span>
                  </div>
                </motion.div>
              </div>

              <p className="text-xs opacity-75 text-right">
                {getXPToNextLevel()} XP needed for next level
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold">{level?.current_xp}</p>
                <p className="text-xs opacity-75">Current Level XP</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold">{Math.pow(level?.current_level || 1, 2) * 100}</p>
                <p className="text-xs opacity-75">Next Level</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold">{level?.total_xp}</p>
                <p className="text-xs opacity-75">Total XP</p>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default LevelProgressBar;
