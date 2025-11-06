import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Moon } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const QuickLogSleep = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sleep_hours: '',
    sleep_quality: 'good',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0] // Yesterday
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: existing } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', formData.date)
        .single();

      if (existing) {
        await supabase
          .from('daily_metrics')
          .update({
            sleep_hours: parseFloat(formData.sleep_hours),
            sleep_quality: formData.sleep_quality
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_metrics')
          .insert({
            user_id: userProfile.id,
            date: formData.date,
            sleep_hours: parseFloat(formData.sleep_hours),
            sleep_quality: formData.sleep_quality
          });
      }

      // Log activity
      await supabase.from('activity_feed').insert({
        user_id: userProfile.id,
        activity_type: 'sleep_log',
        activity_title: 'Sleep Logged',
        activity_description: `${formData.sleep_hours}h of ${formData.sleep_quality} sleep`,
        metadata: {
          hours: parseFloat(formData.sleep_hours),
          quality: formData.sleep_quality
        }
      });

      toast({
        title: "Sleep Logged!",
        description: `Logged ${formData.sleep_hours} hours of sleep`,
      });

      setFormData({
        sleep_hours: '',
        sleep_quality: 'good',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
      });
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error logging sleep:', error);
      toast({
        title: "Error",
        description: "Failed to log sleep. Please try again.",
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
          <Moon className="w-4 h-4 mr-2" />
          Log Sleep
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-effect custom-scrollbar sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Your Sleep</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="min-w-0">
            <Label htmlFor="date">Night of</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full min-w-0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Select the night you went to bed
            </p>
          </div>
          <div>
            <Label htmlFor="sleep_hours">Hours of Sleep *</Label>
            <Input
              id="sleep_hours"
              type="number"
              step="0.5"
              placeholder="7.5"
              value={formData.sleep_hours}
              onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
              min="0"
              max="24"
              required
            />
          </div>
          <div>
            <Label htmlFor="sleep_quality">Sleep Quality</Label>
            <Select value={formData.sleep_quality} onValueChange={(value) => setFormData({ ...formData, sleep_quality: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="poor">Poor 😴</SelectItem>
                <SelectItem value="fair">Fair 😐</SelectItem>
                <SelectItem value="good">Good 😊</SelectItem>
                <SelectItem value="excellent">Excellent 🌟</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Logging...' : 'Log Sleep'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickLogSleep;
