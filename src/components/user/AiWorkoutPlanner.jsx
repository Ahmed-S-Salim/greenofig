import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dumbbell, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const AiWorkoutPlanner = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    plan_type: 'daily',
    fitness_level: 'intermediate',
    workout_duration: '30',
    equipment: 'bodyweight',
    focus_area: 'full_body',
    intensity: 'moderate'
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const prompt = `Create a ${formData.plan_type} workout plan with:
- Fitness Level: ${formData.fitness_level}
- Duration: ${formData.workout_duration} minutes
- Equipment: ${formData.equipment}
- Focus Area: ${formData.focus_area}
- Intensity: ${formData.intensity}
- Health Goals: ${userProfile?.health_goals?.join(', ') || 'General fitness'}

Provide detailed exercises with sets, reps, and instructions.`;

      const aiResponse = generateMockWorkoutPlan(formData, userProfile);

      const { data: workoutPlan, error } = await supabase
        .from('ai_workout_plans')
        .insert({
          user_id: userProfile.id,
          plan_name: `${formData.focus_area} Workout - ${new Date().toLocaleDateString()}`,
          plan_type: formData.plan_type,
          target_date: new Date().toISOString().split('T')[0],
          difficulty: formData.fitness_level,
          workouts: aiResponse.workouts,
          ai_prompt: prompt,
          ai_model: 'gpt-4',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setGeneratedPlan(aiResponse);
      setStep(2);

      toast({
        title: "Workout Plan Generated!",
        description: "Your personalized workout is ready",
      });

    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: "Error",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkout = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      await supabase.from('workout_logs').insert({
        user_id: userProfile.id,
        workout_name: generatedPlan.name,
        workout_type: formData.focus_area,
        duration_minutes: generatedPlan.totalDuration,
        calories_burned: generatedPlan.estimatedCalories,
        intensity: formData.intensity,
        exercises: generatedPlan.workouts,
        date: today,
        ai_generated: true,
        notes: 'AI Generated Workout'
      });

      await supabase.from('activity_feed').insert({
        user_id: userProfile.id,
        activity_type: 'ai_workout_plan',
        activity_title: 'AI Workout Plan Created',
        activity_description: generatedPlan.name,
        metadata: { exercises: generatedPlan.workouts.length }
      });

      toast({
        title: "Workout Saved!",
        description: "Your workout has been added to today's log",
      });

      setOpen(false);
      setStep(1);
      setGeneratedPlan(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" variant="outline">
          <Sparkles className="w-5 h-5 mr-2" />
          Generate AI Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            AI Workout Planner
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan_type">Plan Type</Label>
                <Select value={formData.plan_type} onValueChange={(value) => setFormData({ ...formData, plan_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Single Workout</SelectItem>
                    <SelectItem value="weekly">Weekly Program</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fitness_level">Fitness Level</Label>
                <Select value={formData.fitness_level} onValueChange={(value) => setFormData({ ...formData, fitness_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={formData.workout_duration} onValueChange={(value) => setFormData({ ...formData, workout_duration: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="intensity">Intensity</Label>
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
            </div>

            <div>
              <Label htmlFor="equipment">Available Equipment</Label>
              <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bodyweight">Bodyweight Only</SelectItem>
                  <SelectItem value="dumbbells">Dumbbells</SelectItem>
                  <SelectItem value="gym">Full Gym Access</SelectItem>
                  <SelectItem value="home">Home Equipment (bands, weights)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="focus_area">Focus Area</Label>
              <Select value={formData.focus_area} onValueChange={(value) => setFormData({ ...formData, focus_area: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_body">Full Body</SelectItem>
                  <SelectItem value="upper_body">Upper Body</SelectItem>
                  <SelectItem value="lower_body">Lower Body</SelectItem>
                  <SelectItem value="core">Core & Abs</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility & Mobility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Workout
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2">{generatedPlan?.name}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <div className="font-semibold">{generatedPlan?.totalDuration} min</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Exercises</span>
                  <div className="font-semibold">{generatedPlan?.workouts.length}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Est. Calories</span>
                  <div className="font-semibold">{generatedPlan?.estimatedCalories}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {generatedPlan?.workouts.map((exercise, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold">{exercise.name}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {exercise.sets}x{exercise.reps}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{exercise.instructions}</p>
                  {exercise.rest && (
                    <p className="text-xs text-muted-foreground mt-2">Rest: {exercise.rest}s</p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
              <strong>💡 Pro Tip:</strong> Remember to warm up for 5 minutes before starting and cool down with stretching afterwards!
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Regenerate
              </Button>
              <Button onClick={handleSaveWorkout} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Workout'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Mock workout generator
const generateMockWorkoutPlan = (formData, userProfile) => {
  const exercises = {
    full_body: [
      { name: 'Push-ups', sets: 3, reps: 12, instructions: 'Keep body straight, lower until chest nearly touches floor', rest: 60 },
      { name: 'Squats', sets: 3, reps: 15, instructions: 'Feet shoulder-width apart, lower until thighs parallel to ground', rest: 60 },
      { name: 'Plank', sets: 3, reps: '30s', instructions: 'Hold body straight in plank position', rest: 45 },
      { name: 'Lunges', sets: 3, reps: '10 each', instructions: 'Step forward, lower back knee toward floor', rest: 60 },
      { name: 'Mountain Climbers', sets: 3, reps: 20, instructions: 'Bring knees to chest alternately in plank position', rest: 45 }
    ],
    upper_body: [
      { name: 'Push-ups', sets: 4, reps: 12, instructions: 'Standard push-up form', rest: 60 },
      { name: 'Dips', sets: 3, reps: 10, instructions: 'Use chair or parallel bars', rest: 60 },
      { name: 'Pike Push-ups', sets: 3, reps: 8, instructions: 'Hips up, head down between arms', rest: 60 },
      { name: 'Arm Circles', sets: 2, reps: 30, instructions: 'Small to large circles, both directions', rest: 30 }
    ],
    lower_body: [
      { name: 'Squats', sets: 4, reps: 15, instructions: 'Bodyweight squats, full range of motion', rest: 60 },
      { name: 'Lunges', sets: 3, reps: '12 each', instructions: 'Alternating forward lunges', rest: 60 },
      { name: 'Glute Bridges', sets: 3, reps: 15, instructions: 'Lift hips, squeeze glutes at top', rest: 45 },
      { name: 'Calf Raises', sets: 3, reps: 20, instructions: 'Rise up on toes, slow descent', rest: 45 }
    ],
    core: [
      { name: 'Plank', sets: 3, reps: '45s', instructions: 'Hold strong plank position', rest: 45 },
      { name: 'Bicycle Crunches', sets: 3, reps: 20, instructions: 'Bring opposite elbow to knee', rest: 45 },
      { name: 'Russian Twists', sets: 3, reps: 30, instructions: 'Rotate torso side to side', rest: 45 },
      { name: 'Leg Raises', sets: 3, reps: 12, instructions: 'Lift legs up, control descent', rest: 60 }
    ],
    cardio: [
      { name: 'Jumping Jacks', sets: 3, reps: 30, instructions: 'Full range jumping jacks', rest: 30 },
      { name: 'High Knees', sets: 3, reps: 40, instructions: 'Run in place with high knees', rest: 30 },
      { name: 'Burpees', sets: 3, reps: 10, instructions: 'Full burpee with jump', rest: 60 },
      { name: 'Mountain Climbers', sets: 3, reps: 30, instructions: 'Fast-paced mountain climbers', rest: 45 }
    ]
  };

  const workouts = exercises[formData.focus_area] || exercises.full_body;
  const duration = parseInt(formData.workout_duration);
  const caloriesPerMin = formData.intensity === 'intense' ? 10 : formData.intensity === 'moderate' ? 7 : 5;

  return {
    name: `${formData.focus_area.replace('_', ' ').toUpperCase()} ${formData.intensity} Workout`,
    workouts: workouts.slice(0, Math.floor(duration / 5)),
    totalDuration: duration,
    estimatedCalories: duration * caloriesPerMin
  };
};

export default AiWorkoutPlanner;
