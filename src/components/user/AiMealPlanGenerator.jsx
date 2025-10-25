import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Utensils, Sparkles, ChefHat } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';

const AiMealPlanGenerator = ({ onSuccess }) => {
  const { userProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    plan_type: 'daily',
    target_calories: '',
    dietary_preferences: '',
    meals_per_day: '3',
    allergies: '',
    cuisine_preference: '',
    cooking_time: 'moderate'
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Build AI prompt based on user preferences
      const prompt = `Create a ${formData.plan_type} meal plan for a person with the following requirements:
- Target Calories: ${formData.target_calories || userProfile?.target_calories || 2000} kcal
- Dietary Preferences: ${formData.dietary_preferences || userProfile?.dietary_restrictions?.join(', ') || 'None'}
- Meals per Day: ${formData.meals_per_day}
- Allergies/Restrictions: ${formData.allergies || 'None'}
- Cuisine Preference: ${formData.cuisine_preference || 'Any'}
- Cooking Time: ${formData.cooking_time}
- Health Goals: ${userProfile?.health_goals?.join(', ') || 'General wellness'}

Please provide detailed meal suggestions with ingredients, portions, and nutritional breakdown for each meal.`;

      // Simulate AI response (replace with actual AI API call)
      const aiResponse = generateMockMealPlan(formData, userProfile);

      // Save to database
      const { data: mealPlan, error } = await supabase
        .from('ai_meal_plans')
        .insert({
          user_id: userProfile.id,
          plan_name: `${formData.plan_type} Meal Plan - ${new Date().toLocaleDateString()}`,
          plan_type: formData.plan_type,
          target_date: new Date().toISOString().split('T')[0],
          target_calories: parseInt(formData.target_calories || 2000),
          meals: aiResponse.meals,
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
        title: "Meal Plan Generated!",
        description: "Your personalized meal plan is ready",
      });

    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeals = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Save each meal as a meal log
      for (const meal of generatedPlan.meals) {
        await supabase.from('meal_logs').insert({
          user_id: userProfile.id,
          meal_type: meal.type.toLowerCase(),
          meal_name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein_g: meal.protein,
          carbs_g: meal.carbs,
          fats_g: meal.fats,
          date: today,
          ai_generated: true
        });

        // Log activity
        await supabase.from('activity_feed').insert({
          user_id: userProfile.id,
          activity_type: 'ai_meal_plan',
          activity_title: 'AI Meal Plan Created',
          activity_description: `Generated ${generatedPlan.meals.length} meal suggestions`,
          metadata: { meal_count: generatedPlan.meals.length }
        });
      }

      toast({
        title: "Meals Saved!",
        description: "Your meal plan has been added to today's log",
      });

      setOpen(false);
      setStep(1);
      setGeneratedPlan(null);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving meals:', error);
      toast({
        title: "Error",
        description: "Failed to save meals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Sparkles className="w-5 h-5 mr-2" />
          Generate AI Meal Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            AI Meal Plan Generator
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
                    <SelectItem value="daily">Daily Plan</SelectItem>
                    <SelectItem value="weekly">Weekly Plan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="target_calories">Target Calories</Label>
                <Input
                  id="target_calories"
                  type="number"
                  placeholder={userProfile?.target_calories || "2000"}
                  value={formData.target_calories}
                  onChange={(e) => setFormData({ ...formData, target_calories: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meals_per_day">Meals per Day</Label>
                <Select value={formData.meals_per_day} onValueChange={(value) => setFormData({ ...formData, meals_per_day: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Meals</SelectItem>
                    <SelectItem value="3">3 Meals</SelectItem>
                    <SelectItem value="4">4 Meals</SelectItem>
                    <SelectItem value="5">5 Meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cooking_time">Cooking Time</Label>
                <Select value={formData.cooking_time} onValueChange={(value) => setFormData({ ...formData, cooking_time: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (15-20 min)</SelectItem>
                    <SelectItem value="moderate">Moderate (30-40 min)</SelectItem>
                    <SelectItem value="extended">Extended (1+ hour)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dietary_preferences">Dietary Preferences</Label>
              <Input
                id="dietary_preferences"
                placeholder={userProfile?.dietary_restrictions?.join(', ') || "e.g., Vegetarian, Low-carb, Keto"}
                value={formData.dietary_preferences}
                onChange={(e) => setFormData({ ...formData, dietary_preferences: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies/Restrictions</Label>
              <Input
                id="allergies"
                placeholder="e.g., Nuts, Dairy, Gluten"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cuisine_preference">Cuisine Preference (optional)</Label>
              <Input
                id="cuisine_preference"
                placeholder="e.g., Mediterranean, Asian, American"
                value={formData.cuisine_preference}
                onChange={(e) => setFormData({ ...formData, cuisine_preference: e.target.value })}
              />
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
                    Generate Plan
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2">Your Personalized Meal Plan</h3>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Calories</span>
                  <div className="font-semibold">{generatedPlan?.totalCalories}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Protein</span>
                  <div className="font-semibold">{generatedPlan?.totalProtein}g</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Carbs</span>
                  <div className="font-semibold">{generatedPlan?.totalCarbs}g</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Fats</span>
                  <div className="font-semibold">{generatedPlan?.totalFats}g</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {generatedPlan?.meals.map((meal, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold capitalize">{meal.type}</h4>
                    </div>
                    <span className="text-sm text-muted-foreground">{meal.calories} kcal</span>
                  </div>
                  <h5 className="font-medium">{meal.name}</h5>
                  <p className="text-sm text-muted-foreground mt-1">{meal.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>F: {meal.fats}g</span>
                  </div>
                  {meal.ingredients && (
                    <div className="mt-2 text-sm">
                      <strong>Ingredients:</strong> {meal.ingredients}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                Regenerate
              </Button>
              <Button onClick={handleSaveMeals} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save to Today'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Mock AI meal plan generator (replace with actual AI API)
const generateMockMealPlan = (formData, userProfile) => {
  const targetCal = parseInt(formData.target_calories || 2000);
  const mealsCount = parseInt(formData.meals_per_day);
  const calPerMeal = Math.floor(targetCal / mealsCount);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const meals = [];

  const sampleMeals = {
    breakfast: [
      { name: 'Greek Yogurt Bowl', desc: 'Greek yogurt with berries, granola, and honey', ingredients: 'Greek yogurt, mixed berries, granola, honey, almonds' },
      { name: 'Avocado Toast', desc: 'Whole grain toast with mashed avocado and poached eggs', ingredients: 'Whole grain bread, avocado, eggs, cherry tomatoes, olive oil' },
      { name: 'Protein Smoothie', desc: 'Banana, protein powder, spinach, and almond milk', ingredients: 'Banana, protein powder, spinach, almond milk, peanut butter' }
    ],
    lunch: [
      { name: 'Grilled Chicken Salad', desc: 'Mixed greens with grilled chicken, quinoa, and vinaigrette', ingredients: 'Chicken breast, mixed greens, quinoa, cherry tomatoes, cucumber, olive oil' },
      { name: 'Salmon Bowl', desc: 'Brown rice with baked salmon, edamame, and avocado', ingredients: 'Salmon fillet, brown rice, edamame, avocado, sesame seeds, soy sauce' },
      { name: 'Turkey Wrap', desc: 'Whole wheat wrap with turkey, hummus, and veggies', ingredients: 'Whole wheat tortilla, turkey breast, hummus, lettuce, tomato, cucumber' }
    ],
    dinner: [
      { name: 'Stir-Fry Chicken', desc: 'Chicken with colorful vegetables and brown rice', ingredients: 'Chicken breast, broccoli, bell peppers, carrots, brown rice, soy sauce' },
      { name: 'Baked Cod', desc: 'Lemon herb cod with roasted vegetables', ingredients: 'Cod fillet, lemon, herbs, sweet potato, asparagus, olive oil' },
      { name: 'Lean Beef & Quinoa', desc: 'Seasoned lean beef with quinoa and steamed broccoli', ingredients: 'Lean beef, quinoa, broccoli, garlic, spices' }
    ],
    snack: [
      { name: 'Apple & Almond Butter', desc: 'Sliced apple with natural almond butter', ingredients: 'Apple, almond butter' },
      { name: 'Protein Bar', desc: 'High-protein, low-sugar protein bar', ingredients: 'Protein bar' },
      { name: 'Mixed Nuts', desc: 'Handful of mixed nuts and dried fruit', ingredients: 'Almonds, cashews, dried cranberries' }
    ]
  };

  for (let i = 0; i < mealsCount; i++) {
    const mealType = mealTypes[i % 4];
    const options = sampleMeals[mealType];
    const selected = options[Math.floor(Math.random() * options.length)];

    meals.push({
      type: mealType,
      name: selected.name,
      description: selected.desc,
      ingredients: selected.ingredients,
      calories: calPerMeal + Math.floor(Math.random() * 100 - 50),
      protein: Math.floor(calPerMeal * 0.3 / 4),
      carbs: Math.floor(calPerMeal * 0.4 / 4),
      fats: Math.floor(calPerMeal * 0.3 / 9)
    });
  }

  return {
    meals,
    totalCalories: meals.reduce((sum, m) => sum + m.calories, 0),
    totalProtein: meals.reduce((sum, m) => sum + m.protein, 0),
    totalCarbs: meals.reduce((sum, m) => sum + m.carbs, 0),
    totalFats: meals.reduce((sum, m) => sum + m.fats, 0)
  };
};

export default AiMealPlanGenerator;
