import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  TrendingUp,
  Calendar,
  Flag,
  Loader2,
  Trophy,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GoalTracking = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'weight',
    target_value: '',
    current_value: '',
    unit: 'kg',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
    milestones: [],
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchGoals();
    }
  }, [userProfile?.id]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('user_goals_tracking')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToLoadGoals') || 'Failed to load goals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      const goalData = {
        user_id: userProfile.id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        target_value: parseFloat(formData.target_value),
        current_value: parseFloat(formData.current_value),
        unit: formData.unit,
        start_date: formData.start_date,
        target_date: formData.target_date,
        milestones: formData.milestones,
        status: 'active',
      };

      if (editingGoal) {
        const { error } = await supabase
          .from('user_goals_tracking')
          .update(goalData)
          .eq('id', editingGoal.id);

        if (error) throw error;

        toast({
          title: t('goalUpdated') || 'Goal Updated',
          description: t('goalUpdatedSuccessfully') || 'Your goal has been updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('user_goals_tracking')
          .insert(goalData);

        if (error) throw error;

        toast({
          title: t('goalCreated') || 'Goal Created',
          description: t('goalCreatedSuccessfully') || 'Your goal has been created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToSaveGoal') || 'Failed to save goal',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      const { error } = await supabase
        .from('user_goals_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('goalDeleted') || 'Goal Deleted',
        description: t('goalDeletedSuccessfully') || 'Goal has been deleted',
      });

      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToDeleteGoal') || 'Failed to delete goal',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteGoal = async (goal) => {
    try {
      const { error } = await supabase
        .from('user_goals_tracking')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', goal.id);

      if (error) throw error;

      // Show celebration
      toast({
        title: '🎉 ' + (t('congratulations') || 'Congratulations!'),
        description: t('goalCompleted') || `You've achieved your goal: ${goal.title}!`,
      });

      fetchGoals();
    } catch (error) {
      console.error('Error completing goal:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToCompleteGoal') || 'Failed to complete goal',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProgress = async (goal, newValue) => {
    try {
      const { error } = await supabase
        .from('user_goals_tracking')
        .update({ current_value: newValue })
        .eq('id', goal.id);

      if (error) throw error;

      toast({
        title: t('progressUpdated') || 'Progress Updated',
        description: t('goalProgressUpdated') || 'Your progress has been updated',
      });

      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToUpdateProgress') || 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'weight',
      target_value: '',
      current_value: '',
      unit: 'kg',
      start_date: new Date().toISOString().split('T')[0],
      target_date: '',
      milestones: [],
    });
    setEditingGoal(null);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      target_value: goal.target_value.toString(),
      current_value: goal.current_value.toString(),
      unit: goal.unit,
      start_date: goal.start_date,
      target_date: goal.target_date,
      milestones: goal.milestones || [],
    });
    setIsDialogOpen(true);
  };

  const calculateProgress = (goal) => {
    const total = Math.abs(goal.target_value - parseFloat(goal.current_value || 0));
    const achieved = Math.abs(parseFloat(goal.current_value || 0) - parseFloat(goal.start_value || goal.current_value));
    const progress = goal.target_value !== 0 ? (achieved / total) * 100 : 0;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalCategoryIcon = (category) => {
    const icons = {
      weight: '⚖️',
      fitness: '💪',
      nutrition: '🥗',
      sleep: '😴',
      hydration: '💧',
      custom: '🎯',
    };
    return icons[category] || '🎯';
  };

  const getGoalCategoryColor = (category) => {
    const colors = {
      weight: 'bg-green-500/20 text-green-300',
      fitness: 'bg-blue-500/20 text-blue-300',
      nutrition: 'bg-orange-500/20 text-orange-300',
      sleep: 'bg-purple-500/20 text-purple-300',
      hydration: 'bg-cyan-500/20 text-cyan-300',
      custom: 'bg-gray-500/20 text-gray-300',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300';
  };

  const goalCategories = [
    { value: 'weight', label: t('weight') || 'Weight' },
    { value: 'fitness', label: t('fitness') || 'Fitness' },
    { value: 'nutrition', label: t('nutrition') || 'Nutrition' },
    { value: 'sleep', label: t('sleep') || 'Sleep' },
    { value: 'hydration', label: t('hydration') || 'Hydration' },
    { value: 'custom', label: t('custom') || 'Custom' },
  ];

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const GoalCard = ({ goal }) => {
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal.target_date);
    const isOverdue = daysRemaining < 0;

    return (
      <Card className="glass-effect hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-3xl">{getGoalCategoryIcon(goal.category)}</span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-text-secondary mb-2">{goal.description}</p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getGoalCategoryColor(goal.category)}>
                    {goal.category}
                  </Badge>
                  {goal.status === 'completed' && (
                    <Badge className="bg-green-500/20 text-green-300">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {goal.status === 'active' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditGoal(goal)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteGoal(goal.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Progress</span>
              <span className="font-semibold">
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{progress.toFixed(0)}% Complete</span>
              {goal.status === 'active' && (
                <span className={isOverdue ? 'text-red-500' : ''}>
                  {isOverdue ? 'Overdue' : `${daysRemaining} days left`}
                </span>
              )}
            </div>
          </div>

          {goal.status === 'active' && (
            <div className="mt-4 flex gap-2">
              <Input
                type="number"
                placeholder="Update progress"
                defaultValue={goal.current_value}
                className="flex-1"
                id={`progress-${goal.id}`}
              />
              <Button
                size="sm"
                onClick={() => {
                  const input = document.getElementById(`progress-${goal.id}`);
                  handleUpdateProgress(goal, parseFloat(input.value));
                }}
              >
                Update
              </Button>
              {progress >= 100 && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleCompleteGoal(goal)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="w-6 h-6 text-primary" />
                {t('goalTracking') || 'Goal Tracking'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('goalTrackingDescription') || 'Set SMART goals and track your progress with milestones'}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newGoal') || 'New Goal'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingGoal ? t('editGoal') || 'Edit Goal' : t('createNewGoal') || 'Create New Goal'}
                  </DialogTitle>
                  <DialogDescription>
                    {t('goalDescription') || 'Set a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound)'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('goalTitle') || 'Goal Title'}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Lose 10kg in 3 months"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">{t('description') || 'Description'}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your goal and why it's important to you"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">{t('category') || 'Category'}</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {goalCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {getGoalCategoryIcon(cat.value)} {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="current_value">{t('currentValue') || 'Current Value'}</Label>
                      <Input
                        id="current_value"
                        type="number"
                        value={formData.current_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_value: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_value">{t('targetValue') || 'Target Value'}</Label>
                      <Input
                        id="target_value"
                        type="number"
                        value={formData.target_value}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">{t('unit') || 'Unit'}</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="kg, hrs, reps"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">{t('startDate') || 'Start Date'}</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target_date">{t('targetDate') || 'Target Date'}</Label>
                      <Input
                        id="target_date"
                        type="date"
                        value={formData.target_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveGoal} className="w-full">
                    <Flag className="w-4 h-4 mr-2" />
                    {editingGoal ? t('updateGoal') || 'Update Goal' : t('createGoal') || 'Create Goal'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              {t('activeGoals') || 'Active'} ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('completed') || 'Completed'} ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              {t('allGoals') || 'All'} ({goals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary mb-4">{t('noActiveGoals') || 'No active goals'}</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('setFirstGoal') || 'Set Your First Goal'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noCompletedGoals') || 'No completed goals yet'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary mb-4">{t('noGoalsYet') || 'No goals set yet'}</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createYourFirstGoal') || 'Create Your First Goal'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default GoalTracking;
