import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  CheckCircle2,
  Circle,
  User,
  Target,
  Utensils,
  Dumbbell,
  Bell,
  Award,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  Calendar,
  Camera,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const CHECKLIST_ITEMS = [
  {
    id: 'complete_profile',
    title: 'Complete Your Profile',
    description: 'Add your personal details, height, weight, and goals',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    points: 50,
    action: '/app/profile',
    checkCondition: (profile) => {
      return profile?.full_name &&
             profile?.height &&
             profile?.weight &&
             profile?.date_of_birth;
    }
  },
  {
    id: 'set_goals',
    title: 'Set Your First Goal',
    description: 'Define what you want to achieve (weight loss, muscle gain, etc.)',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    points: 75,
    action: '/app/user?tab=goals',
    checkCondition: (profile, goals) => {
      return goals && goals.length > 0;
    }
  },
  {
    id: 'log_first_meal',
    title: 'Log Your First Meal',
    description: 'Track your breakfast, lunch, or dinner to start building your food diary',
    icon: Utensils,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    points: 100,
    action: '/app/user?quickLog=true',
    checkCondition: (profile, goals, meals) => {
      return meals && meals.length > 0;
    }
  },
  {
    id: 'log_first_workout',
    title: 'Log Your First Workout',
    description: 'Record your exercise session to track calories burned',
    icon: Dumbbell,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    points: 100,
    action: '/app/user?tab=workout',
    checkCondition: (profile, goals, meals, workouts) => {
      return workouts && workouts.length > 0;
    }
  },
  {
    id: 'enable_notifications',
    title: 'Enable Notifications',
    description: 'Set up meal and workout reminders to stay on track',
    icon: Bell,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    points: 50,
    action: '/app/notifications/settings',
    checkCondition: (profile, goals, meals, workouts, reminders) => {
      return reminders && reminders.length > 0;
    }
  },
  {
    id: 'take_progress_photo',
    title: 'Take Your First Progress Photo',
    description: 'Capture your starting point to track visual progress over time',
    icon: Camera,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    points: 75,
    action: '/app/progress-photos',
    tier: 'premium',
    checkCondition: (profile, goals, meals, workouts, reminders, photos) => {
      return photos && photos.length > 0;
    }
  },
  {
    id: 'explore_recipes',
    title: 'Save Your First Recipe',
    description: 'Browse our recipe library and save your favorites',
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    points: 50,
    action: '/app/recipes',
    tier: 'premium',
    checkCondition: (profile, goals, meals, workouts, reminders, photos, recipes) => {
      return recipes && recipes.length > 0;
    }
  },
  {
    id: 'connect_nutritionist',
    title: 'Connect with a Nutritionist',
    description: 'Get personalized guidance from certified nutrition experts',
    icon: MessageSquare,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    points: 150,
    action: '/app/find-nutritionist',
    tier: 'premium',
    checkCondition: (profile, goals, meals, workouts, reminders, photos, recipes, nutritionist) => {
      return nutritionist !== null;
    }
  }
];

const QuickStartChecklist = ({ userId, userTier = 'base', compact = false }) => {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchChecklistProgress();
    }
  }, [userId]);

  const fetchChecklistProgress = async () => {
    try {
      setLoading(true);

      // Fetch all required data
      const [profileRes, goalsRes, mealsRes, workoutsRes, remindersRes, photosRes, recipesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', userId).single(),
        supabase.from('goals').select('id').eq('user_id', userId),
        supabase.from('meals').select('id').eq('user_id', userId).limit(1),
        supabase.from('workout_logs').select('id').eq('user_id', userId).limit(1),
        supabase.from('scheduled_reminders').select('id').eq('user_id', userId).limit(1),
        supabase.from('progress_photos').select('id').eq('user_id', userId).limit(1),
        supabase.from('saved_recipes').select('id').eq('user_id', userId).limit(1)
      ]);

      const profile = profileRes.data;
      const goals = goalsRes.data;
      const meals = mealsRes.data;
      const workouts = workoutsRes.data;
      const reminders = remindersRes.data;
      const photos = photosRes.data;
      const recipes = recipesRes.data;
      const nutritionist = profile?.nutritionist_id;

      setUserData({
        profile,
        goals,
        meals,
        workouts,
        reminders,
        photos,
        recipes,
        nutritionist
      });

      // Check each item
      const updatedChecklist = CHECKLIST_ITEMS.map(item => {
        // Skip tier-restricted items
        if (item.tier && userTier === 'base') {
          return { ...item, completed: false, locked: true };
        }

        const completed = item.checkCondition(
          profile,
          goals,
          meals,
          workouts,
          reminders,
          photos,
          recipes,
          nutritionist
        );

        return { ...item, completed, locked: false };
      });

      setChecklist(updatedChecklist);

      // Check if just completed all items
      const allCompleted = updatedChecklist.filter(item => !item.locked).every(item => item.completed);
      if (allCompleted && !profile?.quickstart_completed) {
        markChecklistComplete();
      }
    } catch (error) {
      console.error('Error fetching checklist progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markChecklistComplete = async () => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          quickstart_completed: true,
          quickstart_completed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Show celebration
      setShowCelebration(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 }
      });

      // Award bonus XP
      await supabase.rpc('add_xp', {
        p_user_id: userId,
        p_xp_amount: 500,
        p_source: 'Quick Start Checklist Completed'
      });
    } catch (error) {
      console.error('Error marking checklist complete:', error);
    }
  };

  const completedCount = checklist.filter(item => item.completed && !item.locked).length;
  const availableCount = checklist.filter(item => !item.locked).length;
  const progress = availableCount > 0 ? (completedCount / availableCount) * 100 : 0;
  const totalPoints = checklist.filter(item => item.completed && !item.locked).reduce((sum, item) => sum + item.points, 0);

  if (loading) {
    return (
      <Card className={compact ? '' : 'shadow-lg'}>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-gray-600">Loading checklist...</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Quick Start</CardTitle>
                <CardDescription>
                  {completedCount}/{availableCount} completed
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              +{totalPoints} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2 mb-4" />
          <div className="space-y-2">
            {checklist.filter(item => !item.completed && !item.locked).slice(0, 3).map(item => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => window.location.href = item.action}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full ${item.bgColor} flex items-center justify-center`}>
                      <ItemIcon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Quick Start Checklist</CardTitle>
                <CardDescription className="text-base">
                  Complete these steps to get the most out of GreenoFig
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                <Zap className="w-4 h-4 mr-1" />
                +{totalPoints} XP
              </Badge>
              <span className="text-sm text-gray-600">
                {completedCount}/{availableCount} completed
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <span className="font-medium">Overall Progress</span>
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {checklist.map((item, index) => {
            const ItemIcon = item.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`transition-all cursor-pointer ${
                    item.completed
                      ? 'border-2 border-green-300 bg-green-50 shadow-md'
                      : item.locked
                      ? 'border-2 border-gray-200 bg-gray-50 opacity-60'
                      : 'border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg'
                  }`}
                  onClick={() => !item.locked && !item.completed && (window.location.href = item.action)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-full ${item.completed ? 'bg-green-100' : item.bgColor} flex items-center justify-center flex-shrink-0`}>
                          {item.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <ItemIcon className={`w-6 h-6 ${item.color}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            {item.tier && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                {item.tier}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={item.completed ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}>
                              <Award className="w-3 h-3 mr-1" />
                              +{item.points} XP
                            </Badge>
                            {!item.completed && !item.locked && (
                              <Button size="sm" variant="ghost" className="text-purple-600">
                                Start
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            )}
                            {item.locked && (
                              <Badge variant="secondary">
                                Upgrade to {item.tier}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Completion Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setShowCelebration(false)}
          >
            <Card className="max-w-md w-full shadow-2xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Congratulations! 🎉
                </h2>
                <p className="text-gray-600 mb-4">
                  You've completed the Quick Start Checklist!
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-xl">
                    <Zap className="w-6 h-6" />
                    +500 Bonus XP!
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  You're all set up and ready to crush your nutrition goals!
                  Keep logging your meals and workouts to earn more rewards.
                </p>
                <Button
                  onClick={() => setShowCelebration(false)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                >
                  Continue Your Journey
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickStartChecklist;
