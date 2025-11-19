import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy, Award, Zap, Star, Loader2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';

const HealthStreaks = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [streaks, setStreaks] = useState({
    workout: { current: 0, best: 0, lastDate: null },
    water: { current: 0, best: 0, lastDate: null },
    sleep: { current: 0, best: 0, lastDate: null },
    meal: { current: 0, best: 0, lastDate: null },
  });
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (userProfile?.id) {
      fetchStreaks();
      fetchAchievements();
    }
  }, [userProfile?.id]);

  const fetchStreaks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [workoutData, waterData, sleepData, mealData] = await Promise.all([
        fetchLogs('workout_logs', thirtyDaysAgo, today),
        fetchLogs('water_logs', thirtyDaysAgo, today),
        fetchLogs('sleep_logs', thirtyDaysAgo, today),
        fetchLogs('meal_logs', thirtyDaysAgo, today),
      ]);

      setStreaks({
        workout: calculateStreak(workoutData),
        water: calculateStreak(waterData),
        sleep: calculateStreak(sleepData),
        meal: calculateStreak(mealData),
      });
    } catch (error) {
      console.error('Error fetching streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (table, startDate, endDate) => {
    const { data, error } = await supabase
      .from(table)
      .select('date')
      .eq('user_id', userProfile.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const calculateStreak = (logs) => {
    if (logs.length === 0) return { current: 0, best: 0, lastDate: null };

    const dates = logs.map(l => l.date).sort().reverse();
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (prevDate - currDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    bestStreak = Math.max(bestStreak, currentStreak);

    return {
      current: currentStreak,
      best: bestStreak,
      lastDate: dates[0],
    };
  };

  const fetchAchievements = async () => {
    const achievementsList = [
      { id: 1, title: '7-Day Warrior', description: '7 day workout streak', icon: '🔥', unlocked: streaks.workout.current >= 7 },
      { id: 2, title: 'Hydration Hero', description: '14 day water streak', icon: '💧', unlocked: streaks.water.current >= 14 },
      { id: 3, title: 'Sleep Master', description: '30 day sleep streak', icon: '😴', unlocked: streaks.sleep.current >= 30 },
      { id: 4, title: 'Consistency King', description: '21 day meal tracking streak', icon: '🍽️', unlocked: streaks.meal.current >= 21 },
      { id: 5, title: 'Century Club', description: '100 day any streak', icon: '💯', unlocked: Object.values(streaks).some(s => s.best >= 100) },
    ];
    setAchievements(achievementsList);
  };

  const getStreakColor = (current, best) => {
    if (current === 0) return 'text-gray-500';
    if (current === best && current >= 7) return 'text-yellow-500';
    if (current >= 5) return 'text-orange-500';
    return 'text-primary';
  };

  const StreakCard = ({ title, icon, current, best, color }) => (
    <Card className="glass-effect hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl">{icon}</span>
          <Flame className={`w-6 h-6 ${getStreakColor(current, best)}`} />
        </div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${getStreakColor(current, best)}`}>{current}</span>
          <span className="text-sm text-text-secondary">days</span>
        </div>
        <div className="mt-2 text-xs text-text-secondary">
          <Trophy className="w-3 h-3 inline mr-1" />
          Best: {best} days
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Flame className="w-6 h-6 text-primary" />
            {t('healthStreaks') || 'Health Streaks'}
          </CardTitle>
          <p className="text-sm text-text-secondary">
            {t('healthStreaksDescription') || 'Track your consistency and build healthy habits'}
          </p>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StreakCard title="Workout Streak" icon="💪" current={streaks.workout.current} best={streaks.workout.best} />
            <StreakCard title="Water Streak" icon="💧" current={streaks.water.current} best={streaks.water.best} />
            <StreakCard title="Sleep Streak" icon="😴" current={streaks.sleep.current} best={streaks.sleep.best} />
            <StreakCard title="Meal Tracking" icon="🍽️" current={streaks.meal.current} best={streaks.meal.best} />
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                {t('achievements') || 'Achievements & Badges'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {achievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg text-center transition-all ${
                      achievement.unlocked
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                    <p className="text-xs text-text-secondary">{achievement.description}</p>
                    {achievement.unlocked && (
                      <Badge className="mt-2 bg-green-500/20 text-green-300">
                        <Star className="w-3 h-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="text-lg">{t('motivationalTips') || 'Keep Your Streak Going!'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Don't break the chain!</p>
                    <p className="text-xs text-text-secondary">Consistency is key to building lasting habits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Small steps lead to big results</p>
                    <p className="text-xs text-text-secondary">Every day counts towards your health journey</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default HealthStreaks;
