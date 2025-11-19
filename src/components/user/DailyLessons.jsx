import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Flame,
  Target,
  Brain,
  Heart,
  Clock,
  Award,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Daily Lessons & Habit Tracking Component
 * Psychology-based behavior change system (inspired by Noom)
 *
 * Features:
 * - Daily micro-lessons on nutrition psychology
 * - Habit streak tracking
 * - Behavioral insights
 * - Motivational content
 *
 * Addresses competitor gap: Noom's psychology-based approach
 */
const DailyLessons = () => {
  const { userProfile } = useAuth();
  const [todayLesson, setTodayLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [habitStreak, setHabitStreak] = useState(0);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      loadDailyContent();
      loadHabitData();
    }
  }, [userProfile?.id]);

  const loadDailyContent = async () => {
    try {
      // Get today's lesson (rotate based on day of year)
      const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

      const { data: lessons } = await supabase
        .from('daily_lessons')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (lessons && lessons.length > 0) {
        const lessonIndex = dayOfYear % lessons.length;
        setTodayLesson(lessons[lessonIndex]);
      }

      // Get user's completed lessons
      const { data: completed } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed_at')
        .eq('user_id', userProfile.id)
        .order('completed_at', { ascending: false });

      setCompletedLessons(completed || []);

    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHabitData = async () => {
    try {
      // Calculate streak
      const { data: logs } = await supabase
        .from('habit_logs')
        .select('logged_date')
        .eq('user_id', userProfile.id)
        .order('logged_date', { ascending: false });

      if (logs && logs.length > 0) {
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date(today);

        for (const log of logs) {
          const logDate = new Date(log.logged_date).toISOString().split('T')[0];
          const expectedDate = checkDate.toISOString().split('T')[0];

          if (logDate === expectedDate) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        setHabitStreak(streak);
      }

      // Get user's active habits
      const { data: userHabits } = await supabase
        .from('user_habits')
        .select('*, habit_logs!left(logged_date)')
        .eq('user_id', userProfile.id)
        .eq('is_active', true);

      setHabits(userHabits || []);

    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const completeLesson = async () => {
    if (!todayLesson) return;

    try {
      // Check if already completed today
      const today = new Date().toISOString().split('T')[0];
      const existing = completedLessons.find(
        l => l.lesson_id === todayLesson.id &&
        new Date(l.completed_at).toISOString().split('T')[0] === today
      );

      if (existing) {
        toast({
          title: 'Already Completed',
          description: 'You have already completed today\'s lesson!',
        });
        return;
      }

      // Mark lesson as completed
      await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: userProfile.id,
          lesson_id: todayLesson.id,
          completed_at: new Date().toISOString(),
        });

      // Award points
      await supabase
        .from('user_profiles')
        .update({
          community_points: (userProfile.community_points || 0) + 10,
        })
        .eq('id', userProfile.id);

      toast({
        title: 'Lesson Complete!',
        description: '+10 points earned',
      });

      loadDailyContent();

    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete lesson',
        variant: 'destructive',
      });
    }
  };

  const toggleHabit = async (habitId) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if already logged today
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('user_id', userProfile.id)
        .eq('habit_id', habitId)
        .eq('logged_date', today)
        .maybeSingle();

      if (existing) {
        // Remove log
        await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add log
        await supabase
          .from('habit_logs')
          .insert({
            user_id: userProfile.id,
            habit_id: habitId,
            logged_date: today,
          });
      }

      loadHabitData();

    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const isHabitCompletedToday = (habitId) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    return habit?.habit_logs?.some(log =>
      new Date(log.logged_date).toISOString().split('T')[0] === today
    );
  };

  return (
    <div className="space-y-6">
      {/* Streak Card */}
      <Card className="glass-effect bg-gradient-to-br from-orange-500/10 to-red-500/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold">{habitStreak} Day Streak!</p>
                <p className="text-sm text-text-secondary">Keep it going!</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                <Award className="h-3 w-3 mr-1" />
                +{habitStreak * 5} pts
              </Badge>
              <p className="text-xs text-text-secondary">
                {habitStreak >= 7 ? '🎉 Amazing!' : 'You\'re doing great!'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Lesson */}
      {todayLesson && (
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Today's Lesson
                </CardTitle>
                <CardDescription>Daily micro-lesson on nutrition psychology</CardDescription>
              </div>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {todayLesson.reading_time_minutes} min read
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lesson Content */}
            <div>
              <h3 className="text-xl font-bold mb-3">{todayLesson.title}</h3>

              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{todayLesson.category}</Badge>
                <Badge variant="outline">Day {completedLessons.length + 1}</Badge>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-text-secondary mb-4">{todayLesson.content}</p>
              </div>

              {/* Key Takeaways */}
              {todayLesson.key_takeaways && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Key Takeaway
                  </p>
                  <p className="text-sm">{todayLesson.key_takeaways}</p>
                </div>
              )}

              {/* Action Item */}
              {todayLesson.action_item && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Try This Today
                  </p>
                  <p className="text-sm">{todayLesson.action_item}</p>
                </div>
              )}
            </div>

            {/* Complete Button */}
            <Button onClick={completeLesson} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Lesson (+10 points)
            </Button>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Your Progress</span>
                <span className="font-semibold">{completedLessons.length} lessons completed</span>
              </div>
              <Progress value={(completedLessons.length / 30) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habit Tracker */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Habits
          </CardTitle>
          <CardDescription>Track your healthy habits every day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {habits.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <p>No habits tracked yet. Add habits from your dashboard!</p>
            </div>
          ) : (
            habits.map((habit) => {
              const isCompleted = isHabitCompletedToday(habit.id);
              return (
                <div
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    isCompleted
                      ? 'bg-green-500/20 ring-2 ring-green-500'
                      : 'bg-background/50 hover:bg-background/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isCompleted
                        ? 'border-green-500 bg-green-500'
                        : 'border-text-secondary'
                    }`}>
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold">{habit.habit_name}</p>
                      <p className="text-xs text-text-secondary">{habit.description}</p>
                    </div>

                    <div className="text-right">
                      <Badge variant={isCompleted ? 'default' : 'outline'}>
                        {isCompleted ? 'Done' : 'Todo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Common habits suggestion */}
          <div className="p-3 rounded-lg bg-background/30 mt-4">
            <p className="text-xs text-text-secondary mb-2">Suggested Habits:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">Drink 2L water</Badge>
              <Badge variant="outline" className="text-xs">10K steps</Badge>
              <Badge variant="outline" className="text-xs">8 hours sleep</Badge>
              <Badge variant="outline" className="text-xs">5 servings veggies</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Your Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-sm font-semibold mb-1">Consistency is Key</p>
              <p className="text-xs text-text-secondary">
                You're {habitStreak >= 7 ? 'crushing it!' : 'building momentum!'}
                {habitStreak >= 7
                  ? ' Research shows habits become automatic after 21 days.'
                  : ' Keep logging daily to build lasting habits.'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-background/50">
              <p className="text-sm font-semibold mb-1">Learning Progress</p>
              <p className="text-xs text-text-secondary">
                You've completed {completedLessons.length} nutrition psychology lessons.
                Knowledge is power in your health journey!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyLessons;
