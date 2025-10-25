import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const QuickLogMeal = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    meal_type: 'breakfast',
    meal_name: '',
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mealData = {
        user_id: userProfile.id,
        meal_type: formData.meal_type,
        meal_name: formData.meal_name,
        description: formData.description,
        calories: formData.calories ? parseInt(formData.calories) : null,
        protein_g: formData.protein_g ? parseFloat(formData.protein_g) : null,
        carbs_g: formData.carbs_g ? parseFloat(formData.carbs_g) : null,
        fats_g: formData.fats_g ? parseFloat(formData.fats_g) : null,
        date: formData.date
      };

      const { error } = await supabase
        .from('meal_logs')
        .insert(mealData);

      if (error) throw error;

      // Update daily metrics
      if (formData.calories) {
        const { data: existing } = await supabase
          .from('daily_metrics')
          .select('*')
          .eq('user_id', userProfile.id)
          .eq('date', formData.date)
          .single();

        const newCalories = (existing?.calories_consumed || 0) + parseInt(formData.calories);
        const newProtein = (existing?.protein_g || 0) + (formData.protein_g ? parseFloat(formData.protein_g) : 0);
        const newCarbs = (existing?.carbs_g || 0) + (formData.carbs_g ? parseFloat(formData.carbs_g) : 0);
        const newFats = (existing?.fats_g || 0) + (formData.fats_g ? parseFloat(formData.fats_g) : 0);

        if (existing) {
          await supabase
            .from('daily_metrics')
            .update({
              calories_consumed: newCalories,
              protein_g: newProtein,
              carbs_g: newCarbs,
              fats_g: newFats
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('daily_metrics')
            .insert({
              user_id: userProfile.id,
              date: formData.date,
              calories_consumed: newCalories,
              protein_g: newProtein,
              carbs_g: newCarbs,
              fats_g: newFats
            });
        }
      }

      // Log activity
      await supabase.from('activity_feed').insert({
        user_id: userProfile.id,
        activity_type: 'logged_meal',
        activity_title: `Logged ${formData.meal_type}`,
        activity_description: formData.meal_name,
        metadata: { calories: formData.calories ? parseInt(formData.calories) : 0 }
      });

      // Update meal log streak
      await supabase.rpc('update_user_streak', {
        p_user_id: userProfile.id,
        p_streak_type: 'meal_log',
        p_activity_date: formData.date
      });

      toast({
        title: "Meal Logged!",
        description: `Successfully logged ${formData.meal_name || formData.meal_type}`,
      });

      setFormData({
        meal_type: 'breakfast',
        meal_name: '',
        description: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fats_g: '',
        date: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Utensils className="w-4 h-4 mr-2" />
          Log Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Your Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <Label htmlFor="meal_type">Meal Type *</Label>
            <Select value={formData.meal_type} onValueChange={(value) => setFormData({ ...formData, meal_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="meal_name">Meal Name *</Label>
            <Input
              id="meal_name"
              placeholder="e.g., Grilled Chicken Salad"
              value={formData.meal_name}
              onChange={(e) => setFormData({ ...formData, meal_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                placeholder="500"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="25"
                value={formData.protein_g}
                onChange={(e) => setFormData({ ...formData, protein_g: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                step="0.1"
                placeholder="50"
                value={formData.carbs_g}
                onChange={(e) => setFormData({ ...formData, carbs_g: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fats">Fats (g)</Label>
              <Input
                id="fats"
                type="number"
                step="0.1"
                placeholder="15"
                value={formData.fats_g}
                onChange={(e) => setFormData({ ...formData, fats_g: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Logging...' : 'Log Meal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLogMeal;
