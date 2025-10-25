import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const QuickLogWeight = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight_kg: userProfile?.weight_kg || '',
    body_fat_percentage: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const today = formData.date;

      // Check if today's metrics already exist
      const { data: existing } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('daily_metrics')
          .update({
            weight_kg: parseFloat(formData.weight_kg),
            body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('daily_metrics')
          .insert({
            user_id: userProfile.id,
            date: today,
            weight_kg: parseFloat(formData.weight_kg),
            body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null
          });

        if (error) throw error;
      }

      // Update user profile with latest weight
      await supabase
        .from('user_profiles')
        .update({ weight_kg: parseFloat(formData.weight_kg) })
        .eq('id', userProfile.id);

      // Log activity
      await supabase.from('activity_feed').insert({
        user_id: userProfile.id,
        activity_type: 'weight_update',
        activity_title: 'Weight Updated',
        activity_description: `Logged weight: ${formData.weight_kg} kg`,
        metadata: { weight_kg: parseFloat(formData.weight_kg) }
      });

      // Update streak
      await supabase.rpc('update_user_streak', {
        p_user_id: userProfile.id,
        p_streak_type: 'weight_log',
        p_activity_date: today
      });

      toast({
        title: "Weight Logged!",
        description: `Successfully logged ${formData.weight_kg} kg`,
      });

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error logging weight:', error);
      toast({
        title: "Error",
        description: "Failed to log weight. Please try again.",
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
          <Scale className="w-4 h-4 mr-2" />
          Log Weight
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Your Weight</DialogTitle>
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
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="70.5"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="body_fat">Body Fat % (optional)</Label>
            <Input
              id="body_fat"
              type="number"
              step="0.1"
              placeholder="18.5"
              value={formData.body_fat_percentage}
              onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Logging...' : 'Log Weight'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLogWeight;
