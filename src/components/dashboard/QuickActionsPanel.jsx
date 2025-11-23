import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Utensils,
  Dumbbell,
  Camera,
  MessageCircle,
  Calendar,
  TrendingUp,
  Apple,
  Droplets,
  FileText,
  Heart,
  Target,
  ShoppingCart,
  Video,
  BookOpen,
  Zap,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const QuickActionsPanel = ({ userTier = 'base', compact = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const quickActions = [
    {
      id: 'log-meal',
      icon: Utensils,
      label: 'Log Meal',
      description: 'Quick meal logging',
      color: 'from-green-500 to-emerald-600',
      requiredTier: 'base',
      action: () => openQuickAction('log-meal')
    },
    {
      id: 'log-workout',
      icon: Dumbbell,
      label: 'Log Workout',
      description: 'Track your exercise',
      color: 'from-blue-500 to-cyan-600',
      requiredTier: 'base',
      action: () => openQuickAction('log-workout')
    },
    {
      id: 'log-water',
      icon: Droplets,
      label: 'Log Water',
      description: 'Track hydration',
      color: 'from-cyan-400 to-blue-500',
      requiredTier: 'base',
      action: () => openQuickAction('log-water')
    },
    {
      id: 'take-photo',
      icon: Camera,
      label: 'Progress Photo',
      description: 'Capture progress',
      color: 'from-purple-500 to-pink-600',
      requiredTier: 'premium',
      action: () => navigate('/app/user/progress-photos')
    },
    {
      id: 'message-nutritionist',
      icon: MessageCircle,
      label: 'Message',
      description: 'Contact nutritionist',
      color: 'from-orange-500 to-red-600',
      requiredTier: 'base',
      action: () => navigate('/app/messaging')
    },
    {
      id: 'schedule-appointment',
      icon: Calendar,
      label: 'Book Call',
      description: 'Schedule consultation',
      color: 'from-indigo-500 to-purple-600',
      requiredTier: 'pro',
      action: () => navigate('/app/consultations/book')
    },
    {
      id: 'view-progress',
      icon: TrendingUp,
      label: 'View Progress',
      description: 'Check your stats',
      color: 'from-yellow-500 to-orange-600',
      requiredTier: 'base',
      action: () => navigate('/app/user/progress')
    },
    {
      id: 'save-recipe',
      icon: BookOpen,
      label: 'Save Recipe',
      description: 'Add to favorites',
      color: 'from-pink-500 to-rose-600',
      requiredTier: 'premium',
      action: () => navigate('/app/user/saved-recipes')
    },
    {
      id: 'generate-meal-plan',
      icon: Apple,
      label: 'Meal Plan',
      description: 'Create meal plan',
      color: 'from-green-600 to-teal-600',
      requiredTier: 'premium',
      action: () => navigate('/app/user/meal-planner')
    },
    {
      id: 'shopping-list',
      icon: ShoppingCart,
      label: 'Shopping List',
      description: 'Generate list',
      color: 'from-blue-600 to-indigo-600',
      requiredTier: 'premium',
      action: () => navigate('/app/user/shopping-list')
    },
    {
      id: 'set-goal',
      icon: Target,
      label: 'Set Goal',
      description: 'Create new goal',
      color: 'from-red-500 to-orange-600',
      requiredTier: 'base',
      action: () => openQuickAction('set-goal')
    },
    {
      id: 'weekly-report',
      icon: FileText,
      label: 'Weekly Report',
      description: 'View summary',
      color: 'from-gray-500 to-gray-700',
      requiredTier: 'premium',
      action: () => navigate('/app/user/reports')
    }
  ];

  const openQuickAction = (type) => {
    setActionType(type);
    setFormData({});
    setIsOpen(true);
  };

  const handleQuickLog = async () => {
    try {
      setLoading(true);

      if (actionType === 'log-meal') {
        // Quick meal log
        const { error } = await supabase
          .from('meals')
          .insert({
            user_id: user.id,
            meal_name: formData.name || 'Quick Meal',
            meal_time: formData.time || new Date().toISOString(),
            calories: parseInt(formData.calories) || 0,
            protein: parseInt(formData.protein) || 0,
            carbs: parseInt(formData.carbs) || 0,
            fats: parseInt(formData.fats) || 0,
            notes: formData.notes || ''
          });

        if (!error) {
          toast({
            title: "Meal Logged! 🍽️",
            description: "Your meal has been added to your diary."
          });
        }
      } else if (actionType === 'log-workout') {
        // Quick workout log
        const { error } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            workout_name: formData.name || 'Quick Workout',
            workout_type: formData.type || 'cardio',
            duration_minutes: parseInt(formData.duration) || 0,
            calories_burned: parseInt(formData.calories) || 0,
            intensity: formData.intensity || 'moderate',
            notes: formData.notes || ''
          });

        if (!error) {
          toast({
            title: "Workout Logged! 💪",
            description: "Great job on completing your workout!"
          });
        }
      } else if (actionType === 'log-water') {
        // Quick water log
        const { error } = await supabase
          .from('water_intake')
          .insert({
            user_id: user.id,
            amount_ml: parseInt(formData.amount) || 250,
            logged_at: new Date().toISOString()
          });

        if (!error) {
          toast({
            title: "Water Logged! 💧",
            description: `Added ${formData.amount || 250}ml to your hydration tracker.`
          });
        }
      } else if (actionType === 'set-goal') {
        // Quick goal creation
        const { error } = await supabase
          .from('weekly_goals')
          .insert({
            user_id: user.id,
            goal_type: formData.type || 'weight_loss',
            goal_name: formData.name || 'New Goal',
            target_value: parseFloat(formData.target) || 0,
            current_value: 0,
            week_start: new Date().toISOString().split('T')[0],
            status: 'active'
          });

        if (!error) {
          toast({
            title: "Goal Created! 🎯",
            description: "Your new goal has been set. Let's achieve it!"
          });
        }
      }

      setIsOpen(false);
      setFormData({});
    } catch (error) {
      console.error('Quick action error:', error);
      toast({
        title: "Error",
        description: "Failed to complete action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getQuickActionForm = () => {
    switch (actionType) {
      case 'log-meal':
        return (
          <div className="space-y-4">
            <div>
              <Label>Meal Name</Label>
              <Input
                placeholder="e.g., Breakfast, Chicken Salad"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Calories</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={formData.calories || ''}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.protein || ''}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.carbs || ''}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                />
              </div>
              <div>
                <Label>Fats (g)</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={formData.fats || ''}
                  onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional details..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        );

      case 'log-workout':
        return (
          <div className="space-y-4">
            <div>
              <Label>Workout Name</Label>
              <Input
                placeholder="e.g., Morning Run, Gym Session"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Workout Type</Label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.type || 'cardio'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="cardio">Cardio</option>
                <option value="strength">Strength Training</option>
                <option value="flexibility">Flexibility</option>
                <option value="sports">Sports</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  placeholder="30"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div>
                <Label>Calories Burned</Label>
                <Input
                  type="number"
                  placeholder="300"
                  value={formData.calories || ''}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Intensity</Label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.intensity || 'moderate'}
                onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
            </div>
          </div>
        );

      case 'log-water':
        return (
          <div className="space-y-4">
            <div>
              <Label>Amount (ml)</Label>
              <Input
                type="number"
                placeholder="250"
                value={formData.amount || ''}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              {[250, 500, 750, 1000].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({ ...formData, amount: amount.toString() })}
                >
                  {amount}ml
                </Button>
              ))}
            </div>
          </div>
        );

      case 'set-goal':
        return (
          <div className="space-y-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Lose 5kg, Build muscle"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Goal Type</Label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.type || 'weight_loss'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fitness">Fitness Improvement</option>
                <option value="habit">Habit Building</option>
              </select>
            </div>
            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                placeholder="5"
                value={formData.target || ''}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const filteredActions = quickActions.filter(action => {
    const tierOrder = ['base', 'premium', 'pro', 'elite'];
    const userTierIndex = tierOrder.indexOf(userTier);
    const requiredTierIndex = tierOrder.indexOf(action.requiredTier);
    return userTierIndex >= requiredTierIndex;
  });

  if (compact) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {filteredActions.slice(0, 6).map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-full">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Quick Actions</CardTitle>
              <p className="text-sm text-muted-foreground">One-tap common tasks</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  className="group relative overflow-hidden"
                >
                  <div className={`flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg transition-shadow hover:shadow-xl`}>
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Icon */}
                    <div className="relative">
                      <Icon className="w-8 h-8" />
                    </div>

                    {/* Label */}
                    <div className="relative text-center">
                      <p className="font-semibold text-sm leading-tight">{action.label}</p>
                      <p className="text-xs opacity-90 mt-1">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Action Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'log-meal' && '🍽️ Log Meal'}
              {actionType === 'log-workout' && '💪 Log Workout'}
              {actionType === 'log-water' && '💧 Log Water'}
              {actionType === 'set-goal' && '🎯 Set Goal'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'log-meal' && 'Quickly add a meal to your diary'}
              {actionType === 'log-workout' && 'Track your workout session'}
              {actionType === 'log-water' && 'Add to your daily hydration'}
              {actionType === 'set-goal' && 'Create a new weekly goal'}
            </DialogDescription>
          </DialogHeader>

          {getQuickActionForm()}

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleQuickLog} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickActionsPanel;
