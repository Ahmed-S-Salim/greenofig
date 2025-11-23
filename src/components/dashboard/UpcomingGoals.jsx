import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const UpcomingGoals = ({ compact = false }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_type: 'weight_loss',
    target_value: '',
    week_start: new Date().toISOString().split('T')[0],
    deadline: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false });

      if (!error) {
        setGoals(data || []);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .insert({
          user_id: user.id,
          goal_name: formData.goal_name,
          goal_type: formData.goal_type,
          target_value: parseFloat(formData.target_value),
          current_value: 0,
          week_start: formData.week_start,
          deadline: formData.deadline || null,
          status: 'active'
        });

      if (!error) {
        toast({
          title: "Goal Created! 🎯",
          description: "Your new goal has been added."
        });
        fetchGoals();
        setIsDialogOpen(false);
        setFormData({
          goal_name: '',
          goal_type: 'weight_loss',
          target_value: '',
          week_start: new Date().toISOString().split('T')[0],
          deadline: ''
        });
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProgress = async (goalId, newValue) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (!error) {
        fetchGoals();
        toast({
          title: "Progress Updated! 📈",
          description: "Your goal progress has been updated."
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('id', goalId);

      if (!error) {
        fetchGoals();
        toast({
          title: "Goal Deleted",
          description: "The goal has been removed."
        });
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getGoalProgress = (goal) => {
    if (!goal.target_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const getGoalIcon = (goalType) => {
    switch (goalType) {
      case 'weight_loss':
        return '⚖️';
      case 'muscle_gain':
        return '💪';
      case 'fitness':
        return '🏃';
      case 'habit':
        return '✅';
      case 'nutrition':
        return '🥗';
      default:
        return '🎯';
    }
  };

  const getGoalColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 50) return 'from-yellow-500 to-orange-600';
    if (progress >= 25) return 'from-blue-500 to-cyan-600';
    return 'from-gray-400 to-gray-600';
  };

  const getDaysRemaining = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card className="glass-effect animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {goals.slice(0, 3).map((goal, index) => {
          const progress = getGoalProgress(goal);
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getGoalIcon(goal.goal_type)}</span>
                <p className="text-sm font-semibold flex-1 truncate">{goal.goal_name}</p>
                <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-full">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Upcoming Goals
                  <Badge variant="secondary">{goals.length}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">Track your progress</p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-2">No active goals</p>
              <p className="text-sm text-muted-foreground mb-4">
                Set your first goal to start tracking progress!
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal, index) => {
                const progress = getGoalProgress(goal);
                const daysRemaining = getDaysRemaining(goal.deadline);
                const isNearDeadline = daysRemaining !== null && daysRemaining <= 3;
                const isOverdue = daysRemaining !== null && daysRemaining < 0;

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative overflow-hidden rounded-xl border bg-card hover:shadow-lg transition-shadow group"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${getGoalColor(progress)} opacity-5`} />

                    <div className="relative p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-3xl flex-shrink-0">
                            {getGoalIcon(goal.goal_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 truncate">{goal.goal_name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {goal.goal_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                              {goal.current_value} / {goal.target_value}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({Math.round(progress)}%)
                            </span>
                          </div>

                          {progress >= 100 && (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Complete!
                            </Badge>
                          )}
                        </div>

                        <div className="relative">
                          <Progress value={progress} className="h-3" />
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                            style={{ width: '50%' }}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {/* Deadline */}
                        {goal.deadline && (
                          <div className={`flex items-center gap-1 text-xs ${
                            isOverdue ? 'text-red-600' : isNearDeadline ? 'text-orange-600' : 'text-muted-foreground'
                          }`}>
                            {isOverdue ? (
                              <AlertCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {isOverdue
                              ? `Overdue by ${Math.abs(daysRemaining)} days`
                              : daysRemaining === 0
                              ? 'Due today'
                              : daysRemaining === 1
                              ? '1 day left'
                              : `${daysRemaining} days left`
                            }
                          </div>
                        )}

                        {/* Quick Update */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(goal.id, goal.current_value + 1)}
                            className="h-7 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>

                      {/* Completion Confetti Effect */}
                      {progress >= 100 && (
                        <motion.div
                          className="absolute top-2 right-2 text-2xl"
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatDelay: 2
                          }}
                        >
                          🎉
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Statistics */}
          {goals.length > 0 && (
            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Active Goals</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold">
                  {goals.filter(g => getGoalProgress(g) >= 100).length}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold">
                  {Math.round(
                    goals.reduce((sum, g) => sum + getGoalProgress(g), 0) / goals.length
                  )}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Set a new goal to track your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g., Lose 5kg, Run 10km"
                value={formData.goal_name}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
              />
            </div>

            <div>
              <Label>Goal Type</Label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.goal_type}
                onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
              >
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fitness">Fitness</option>
                <option value="habit">Habit Building</option>
                <option value="nutrition">Nutrition</option>
              </select>
            </div>

            <div>
              <Label>Target Value</Label>
              <Input
                type="number"
                placeholder="e.g., 5 (kg), 10 (km)"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
              />
            </div>

            <div>
              <Label>Deadline (Optional)</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateGoal} disabled={!formData.goal_name || !formData.target_value}>
              Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpcomingGoals;
