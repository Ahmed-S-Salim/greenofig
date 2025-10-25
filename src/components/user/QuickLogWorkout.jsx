import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const QuickLogWorkout = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workout_name: '',
    workout_type: 'cardio',
    duration_minutes: '',
    calories_burned: '',
    intensity: 'moderate',
    notes: '',
    feeling: 'good',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workoutData = {
        user_id: userProfile.id,
        workout_name: formData.workout_name,
        workout_type: formData.workout_type,
        duration_minutes: parseInt(formData.duration_minutes),
        calories_burned: formData.calories_burned ? parseInt(formData.calories_burned) : null,
        intensity: formData.intensity,
        notes: formData.notes,
        feeling: formData.feeling,
        date: formData.date
      };

      const { error } = await supabase
        .from('workout_logs')
        .insert(workoutData);

      if (error) throw error;

      // Update daily metrics
      const { data: existing } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', formData.date)
        .single();

      const newCaloriesBurned = (existing?.calories_burned || 0) + (formData.calories_burned ? parseInt(formData.calories_burned) : 0);
      const newActiveMinutes = (existing?.active_minutes || 0) + parseInt(formData.duration_minutes);

      if (existing) {
        await supabase
          .from('daily_metrics')
          .update({
            calories_burned: newCaloriesBurned,
            active_minutes: newActiveMinutes
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_metrics')
          .insert({
            user_id: userProfile.id,
            date: formData.date,
            calories_burned: newCaloriesBurned,
            active_minutes: newActiveMinutes
          });
      }

      // Log activity
      await supabase.from('activity_feed').insert({
        user_id: userProfile.id,
        activity_type: 'completed_workout',
        activity_title: 'Completed Workout',
        activity_description: formData.workout_name,
        metadata: {
          duration: parseInt(formData.duration_minutes),
          calories: formData.calories_burned ? parseInt(formData.calories_burned) : 0
        }
      });

      // Update workout streak
      await supabase.rpc('update_user_streak', {
        p_user_id: userProfile.id,
        p_streak_type: 'workout',
        p_activity_date: formData.date
      });

      toast({
        title: "Workout Logged!",
        description: `Great job completing ${formData.workout_name}!`,
      });

      setFormData({
        workout_name: '',
        workout_type: 'cardio',
        duration_minutes: '',
        calories_burned: '',
        intensity: 'moderate',
        notes: '',
        feeling: 'good',
        date: new Date().toISOString().split('T')[0]
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
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
          <Dumbbell className="w-10 h-10 mr-2" strokeWidth={3} />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Your Workout</DialogTitle>
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
            <Label htmlFor="workout_name">Workout Name *</Label>
            <Input
              id="workout_name"
              placeholder="e.g., Morning Run"
              value={formData.workout_name}
              onChange={(e) => setFormData({ ...formData, workout_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="workout_type">Workout Type *</Label>
            <Select value={formData.workout_type} onValueChange={(value) => setFormData({ ...formData, workout_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="hiit">HIIT</SelectItem>
                <SelectItem value="pilates">Pilates</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="cycling">Cycling</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="calories">Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                placeholder="300"
                value={formData.calories_burned}
                onChange={(e) => setFormData({ ...formData, calories_burned: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="intensity">Intensity *</Label>
            <Select value={formData.intensity} onValueChange={(value) => setFormData({ ...formData, intensity: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="intense">Intense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="feeling">How did you feel?</Label>
            <Select value={formData.feeling} onValueChange={(value) => setFormData({ ...formData, feeling: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exhausted">Exhausted</SelectItem>
                <SelectItem value="tired">Tired</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="energized">Energized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How was your workout?"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Logging...' : 'Log Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLogWorkout;
