import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const QuickLogWater = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [waterIntake, setWaterIntake] = useState(0);
  const [loading, setLoading] = useState(false);
  const GLASS_SIZE = 250; // ml per glass
  const DAILY_TARGET = 2000; // ml

  useEffect(() => {
    if (userProfile?.id) {
      fetchTodayWater();
    }
  }, [userProfile?.id]);

  const fetchTodayWater = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_metrics')
        .select('water_ml')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single();

      if (data) {
        setWaterIntake(data.water_ml || 0);
      }
    } catch (error) {
      // No water logged today yet
    }
  };

  const updateWater = async (amount) => {
    setLoading(true);
    try {
      const newAmount = Math.max(0, waterIntake + amount);
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('daily_metrics')
          .update({ water_ml: newAmount })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('daily_metrics')
          .insert({
            user_id: userProfile.id,
            date: today,
            water_ml: newAmount
          });
      }

      setWaterIntake(newAmount);

      if (amount > 0) {
        // Log activity
        await supabase.from('activity_feed').insert({
          user_id: userProfile.id,
          activity_type: 'water_intake',
          activity_title: 'Water Logged',
          activity_description: `Added ${amount}ml of water`,
          metadata: { water_ml: amount }
        });

        // Update streak
        await supabase.rpc('update_user_streak', {
          p_user_id: userProfile.id,
          p_streak_type: 'water_intake',
          p_activity_date: today
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating water:', error);
      toast({
        title: "Error",
        description: "Failed to update water intake.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min((waterIntake / DAILY_TARGET) * 100, 100);
  const glasses = Math.floor(waterIntake / GLASS_SIZE);

  return (
    <Card className="glass-effect h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-blue-500">{waterIntake}ml</div>
          <div className="text-sm text-muted-foreground">/ {DAILY_TARGET}ml</div>
          <div className="text-xs text-muted-foreground ml-auto">{glasses} glasses</div>
        </div>

        <div className="w-full bg-muted rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            {progress > 15 && (
              <span className="text-[10px] font-semibold text-white">{Math.round(progress)}%</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateWater(-GLASS_SIZE)}
            disabled={loading || waterIntake === 0}
          >
            <Minus className="w-4 h-4 mr-1" />
            Remove
          </Button>
          <Button
            size="sm"
            onClick={() => updateWater(GLASS_SIZE)}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Glass
          </Button>
        </div>
        <div className="text-xs text-center text-muted-foreground pt-1">
          1 glass = {GLASS_SIZE}ml
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickLogWater;
