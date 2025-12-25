import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import {
  Sparkles,
  User,
  Target,
  AlertTriangle,
  Utensils,
  Apple,
  Loader2,
  Check,
  RefreshCw,
  Save,
  ChevronRight,
  Heart,
  Dumbbell,
  Clock,
  DollarSign
} from 'lucide-react';

const AIMealPlanGenerator = ({ onPlanGenerated, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const [planConfig, setPlanConfig] = useState({
    duration_days: 7,
    meals_per_day: 3,
    include_snacks: true,
    cuisine_preferences: [],
    exclude_ingredients: [],
    budget: 'moderate',
    prep_time: 'medium',
    goal_focus: 'balanced'
  });

  const cuisineOptions = [
    'Mediterranean', 'Asian', 'Mexican', 'Indian', 'American',
    'Italian', 'Middle Eastern', 'Japanese', 'Thai', 'Greek'
  ];

  const goalOptions = [
    { value: 'weight_loss', label: 'Weight Loss', icon: Target },
    { value: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell },
    { value: 'maintenance', label: 'Maintenance', icon: Heart },
    { value: 'energy', label: 'More Energy', icon: Sparkles }
  ];

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, tier')
        .eq('role', 'user')
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchClientProfile = async (clientId) => {
    setLoading(true);
    try {
      // Fetch nutrition profile
      const { data: profile, error: profileError } = await supabase
        .from('client_nutrition_profiles')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      // Fetch basic client info
      const { data: clientData, error: clientError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      const combinedProfile = {
        ...clientData,
        nutrition: profile || null
      };

      setClientProfile(combinedProfile);
      setSelectedClient(clientData);

      // Pre-fill config from profile
      if (profile) {
        setPlanConfig(prev => ({
          ...prev,
          meals_per_day: profile.meals_per_day || 3,
          include_snacks: profile.snacks_per_day > 0,
          budget: profile.budget || 'moderate',
          prep_time: profile.cooking_skill === 'beginner' ? 'quick' :
                     profile.cooking_skill === 'advanced' ? 'any' : 'medium',
          goal_focus: profile.primary_goal || 'balanced'
        }));
      }
    } catch (error) {
      console.error('Error fetching client profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load client profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (!selectedClient || !clientProfile) return;

    setGenerating(true);
    try {
      const profile = clientProfile.nutrition || {};

      // Calculate daily targets
      const targetCalories = profile.target_calories || 2000;
      const targetProtein = profile.target_protein_g || 150;
      const targetCarbs = profile.target_carbs_g || 200;
      const targetFat = profile.target_fat_g || 65;

      // Generate meal plan based on profile
      const mealPlan = generateSmartMealPlan({
        targetCalories,
        targetProtein,
        targetCarbs,
        targetFat,
        allergies: profile.allergies || [],
        dietType: profile.diet_type || 'omnivore',
        dislikedFoods: profile.disliked_foods || [],
        favoriteFoods: profile.favorite_foods || [],
        healthConditions: profile.health_conditions || [],
        ...planConfig
      });

      setGeneratedPlan(mealPlan);
      setStep(3);

      toast({
        title: 'Meal Plan Generated!',
        description: `${planConfig.duration_days}-day plan created for ${selectedClient.full_name}`
      });
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate meal plan'
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateSmartMealPlan = (config) => {
    const {
      targetCalories, targetProtein, targetCarbs, targetFat,
      allergies, dietType, dislikedFoods, favoriteFoods,
      healthConditions, duration_days, meals_per_day, include_snacks,
      cuisine_preferences, budget, prep_time, goal_focus
    } = config;

    // Meal database categorized by type and dietary restrictions
    const mealDatabase = {
      breakfast: [
        { name: 'Greek Yogurt Parfait', calories: 350, protein: 20, carbs: 45, fat: 10, tags: ['vegetarian', 'quick'], ingredients: ['greek yogurt', 'berries', 'granola', 'honey'] },
        { name: 'Overnight Oats', calories: 400, protein: 15, carbs: 60, fat: 12, tags: ['vegetarian', 'vegan-option', 'quick'], ingredients: ['oats', 'almond milk', 'chia seeds', 'banana'] },
        { name: 'Egg White Veggie Omelette', calories: 280, protein: 25, carbs: 10, fat: 15, tags: ['vegetarian', 'keto-friendly', 'quick'], ingredients: ['egg whites', 'spinach', 'tomatoes', 'feta cheese'] },
        { name: 'Avocado Toast with Eggs', calories: 420, protein: 18, carbs: 35, fat: 25, tags: ['vegetarian'], ingredients: ['whole grain bread', 'avocado', 'eggs', 'cherry tomatoes'] },
        { name: 'Protein Smoothie Bowl', calories: 380, protein: 30, carbs: 45, fat: 8, tags: ['vegetarian', 'quick'], ingredients: ['protein powder', 'banana', 'spinach', 'almond butter'] },
        { name: 'Smoked Salmon Bagel', calories: 450, protein: 28, carbs: 40, fat: 18, tags: ['pescatarian'], ingredients: ['whole wheat bagel', 'smoked salmon', 'cream cheese', 'capers'] },
        { name: 'Quinoa Breakfast Bowl', calories: 380, protein: 14, carbs: 55, fat: 12, tags: ['vegan', 'gluten-free'], ingredients: ['quinoa', 'almond milk', 'walnuts', 'berries'] },
        { name: 'Turkey Breakfast Wrap', calories: 400, protein: 32, carbs: 30, fat: 16, tags: ['high-protein'], ingredients: ['turkey', 'eggs', 'whole wheat wrap', 'spinach'] }
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', calories: 450, protein: 40, carbs: 20, fat: 22, tags: ['keto-friendly', 'high-protein'], ingredients: ['chicken breast', 'mixed greens', 'avocado', 'olive oil'] },
        { name: 'Quinoa Buddha Bowl', calories: 520, protein: 18, carbs: 65, fat: 20, tags: ['vegan', 'high-fiber'], ingredients: ['quinoa', 'chickpeas', 'roasted vegetables', 'tahini'] },
        { name: 'Turkey & Avocado Wrap', calories: 480, protein: 35, carbs: 35, fat: 22, tags: ['high-protein'], ingredients: ['turkey breast', 'avocado', 'whole wheat wrap', 'lettuce'] },
        { name: 'Mediterranean Grain Bowl', calories: 500, protein: 22, carbs: 55, fat: 20, tags: ['vegetarian', 'mediterranean'], ingredients: ['farro', 'feta', 'cucumber', 'olives', 'hummus'] },
        { name: 'Tuna Poke Bowl', calories: 480, protein: 38, carbs: 45, fat: 16, tags: ['pescatarian', 'asian'], ingredients: ['ahi tuna', 'sushi rice', 'edamame', 'seaweed'] },
        { name: 'Lentil Soup with Bread', calories: 420, protein: 20, carbs: 60, fat: 10, tags: ['vegan', 'budget-friendly'], ingredients: ['lentils', 'carrots', 'celery', 'whole grain bread'] },
        { name: 'Chicken Caesar Wrap', calories: 520, protein: 38, carbs: 32, fat: 26, tags: ['high-protein'], ingredients: ['grilled chicken', 'romaine', 'parmesan', 'caesar dressing'] },
        { name: 'Asian Salmon Salad', calories: 480, protein: 35, carbs: 25, fat: 28, tags: ['pescatarian', 'asian', 'keto-friendly'], ingredients: ['salmon', 'mixed greens', 'edamame', 'sesame dressing'] }
      ],
      dinner: [
        { name: 'Baked Salmon with Vegetables', calories: 520, protein: 42, carbs: 25, fat: 28, tags: ['pescatarian', 'keto-friendly'], ingredients: ['salmon fillet', 'asparagus', 'lemon', 'olive oil'] },
        { name: 'Lean Beef Stir Fry', calories: 480, protein: 38, carbs: 35, fat: 20, tags: ['asian', 'high-protein'], ingredients: ['lean beef', 'broccoli', 'bell peppers', 'brown rice'] },
        { name: 'Grilled Chicken with Sweet Potato', calories: 550, protein: 45, carbs: 50, fat: 15, tags: ['high-protein', 'meal-prep'], ingredients: ['chicken breast', 'sweet potato', 'green beans'] },
        { name: 'Vegetable Curry with Rice', calories: 480, protein: 15, carbs: 70, fat: 16, tags: ['vegan', 'indian'], ingredients: ['chickpeas', 'coconut milk', 'mixed vegetables', 'basmati rice'] },
        { name: 'Turkey Meatballs with Zucchini Noodles', calories: 420, protein: 38, carbs: 20, fat: 22, tags: ['keto-friendly', 'italian'], ingredients: ['ground turkey', 'zucchini', 'marinara sauce', 'parmesan'] },
        { name: 'Shrimp & Vegetable Skewers', calories: 380, protein: 35, carbs: 20, fat: 18, tags: ['pescatarian', 'mediterranean', 'quick'], ingredients: ['shrimp', 'zucchini', 'bell peppers', 'quinoa'] },
        { name: 'Herb Roasted Chicken', calories: 520, protein: 48, carbs: 25, fat: 26, tags: ['high-protein', 'meal-prep'], ingredients: ['chicken thighs', 'potatoes', 'carrots', 'rosemary'] },
        { name: 'Black Bean Tacos', calories: 450, protein: 18, carbs: 55, fat: 18, tags: ['vegetarian', 'mexican'], ingredients: ['black beans', 'corn tortillas', 'avocado', 'salsa'] }
      ],
      snack: [
        { name: 'Apple with Almond Butter', calories: 200, protein: 6, carbs: 25, fat: 10, tags: ['vegan', 'quick'], ingredients: ['apple', 'almond butter'] },
        { name: 'Greek Yogurt & Berries', calories: 150, protein: 15, carbs: 18, fat: 3, tags: ['vegetarian', 'quick'], ingredients: ['greek yogurt', 'mixed berries'] },
        { name: 'Protein Energy Balls', calories: 180, protein: 8, carbs: 20, fat: 8, tags: ['vegetarian', 'meal-prep'], ingredients: ['oats', 'protein powder', 'honey', 'nut butter'] },
        { name: 'Hummus & Veggies', calories: 160, protein: 6, carbs: 18, fat: 8, tags: ['vegan', 'quick'], ingredients: ['hummus', 'carrots', 'celery', 'cucumber'] },
        { name: 'Cottage Cheese with Fruit', calories: 180, protein: 20, carbs: 15, fat: 4, tags: ['vegetarian', 'high-protein'], ingredients: ['cottage cheese', 'pineapple'] },
        { name: 'Mixed Nuts', calories: 200, protein: 6, carbs: 8, fat: 18, tags: ['vegan', 'keto-friendly', 'quick'], ingredients: ['almonds', 'walnuts', 'cashews'] },
        { name: 'Protein Shake', calories: 180, protein: 25, carbs: 10, fat: 4, tags: ['quick', 'high-protein'], ingredients: ['protein powder', 'almond milk', 'banana'] },
        { name: 'Rice Cakes with Avocado', calories: 170, protein: 4, carbs: 20, fat: 10, tags: ['vegan', 'quick'], ingredients: ['rice cakes', 'avocado', 'sea salt'] }
      ]
    };

    // Filter meals based on dietary restrictions
    const filterMeals = (meals) => {
      return meals.filter(meal => {
        // Check allergies
        const hasAllergen = allergies.some(allergen =>
          meal.ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
        );
        if (hasAllergen) return false;

        // Check disliked foods
        const hasDisliked = dislikedFoods.some(food =>
          meal.ingredients.some(ing => ing.toLowerCase().includes(food.toLowerCase()))
        );
        if (hasDisliked) return false;

        // Check diet type
        if (dietType === 'vegan' && !meal.tags.includes('vegan')) return false;
        if (dietType === 'vegetarian' && !meal.tags.includes('vegetarian') && !meal.tags.includes('vegan')) return false;
        if (dietType === 'pescatarian' && meal.ingredients.some(ing =>
          ['chicken', 'beef', 'pork', 'turkey', 'lamb'].some(meat => ing.toLowerCase().includes(meat))
        )) return false;
        if (dietType === 'keto' && !meal.tags.includes('keto-friendly')) return false;

        return true;
      });
    };

    // Get filtered meals
    const filteredBreakfasts = filterMeals(mealDatabase.breakfast);
    const filteredLunches = filterMeals(mealDatabase.lunch);
    const filteredDinners = filterMeals(mealDatabase.dinner);
    const filteredSnacks = filterMeals(mealDatabase.snack);

    // Calculate per-meal targets
    const mealsCount = meals_per_day + (include_snacks ? 2 : 0);
    const breakfastCals = targetCalories * 0.25;
    const lunchCals = targetCalories * 0.35;
    const dinnerCals = targetCalories * 0.30;
    const snackCals = targetCalories * 0.05;

    // Generate days
    const days = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < duration_days; i++) {
      const dayMeals = {
        day: dayNames[i % 7],
        dayNumber: i + 1,
        meals: []
      };

      // Select breakfast
      const breakfast = filteredBreakfasts[Math.floor(Math.random() * filteredBreakfasts.length)] || mealDatabase.breakfast[0];
      dayMeals.meals.push({ type: 'Breakfast', ...breakfast });

      // Select lunch
      const lunch = filteredLunches[Math.floor(Math.random() * filteredLunches.length)] || mealDatabase.lunch[0];
      dayMeals.meals.push({ type: 'Lunch', ...lunch });

      // Select dinner
      const dinner = filteredDinners[Math.floor(Math.random() * filteredDinners.length)] || mealDatabase.dinner[0];
      dayMeals.meals.push({ type: 'Dinner', ...dinner });

      // Add snacks if enabled
      if (include_snacks) {
        const snack1 = filteredSnacks[Math.floor(Math.random() * filteredSnacks.length)] || mealDatabase.snack[0];
        const snack2 = filteredSnacks[Math.floor(Math.random() * filteredSnacks.length)] || mealDatabase.snack[1];
        dayMeals.meals.push({ type: 'Morning Snack', ...snack1 });
        dayMeals.meals.push({ type: 'Afternoon Snack', ...snack2 });
      }

      // Calculate day totals
      dayMeals.totals = {
        calories: dayMeals.meals.reduce((sum, m) => sum + m.calories, 0),
        protein: dayMeals.meals.reduce((sum, m) => sum + m.protein, 0),
        carbs: dayMeals.meals.reduce((sum, m) => sum + m.carbs, 0),
        fat: dayMeals.meals.reduce((sum, m) => sum + m.fat, 0)
      };

      days.push(dayMeals);
    }

    // Collect all unique ingredients for grocery list
    const allIngredients = new Set();
    days.forEach(day => {
      day.meals.forEach(meal => {
        meal.ingredients.forEach(ing => allIngredients.add(ing));
      });
    });

    return {
      client_id: selectedClient.id,
      client_name: selectedClient.full_name,
      duration_days,
      target_calories: targetCalories,
      target_protein: targetProtein,
      target_carbs: targetCarbs,
      target_fat: targetFat,
      diet_type: dietType,
      allergies,
      days,
      grocery_list: Array.from(allIngredients).sort(),
      generated_at: new Date().toISOString()
    };
  };

  const saveMealPlan = async () => {
    if (!generatedPlan) return;

    setLoading(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + generatedPlan.duration_days);

      // Convert to meal_plans_v2 format
      const mealSchedule = {};
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      generatedPlan.days.forEach((day, index) => {
        const dayKey = dayNames[index % 7];
        mealSchedule[dayKey] = {};

        day.meals.forEach(meal => {
          const mealKey = meal.type.toLowerCase().replace(' ', '_');
          mealSchedule[dayKey][mealKey] = {
            name: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            ingredients: meal.ingredients
          };
        });
      });

      const planData = {
        client_id: generatedPlan.client_id,
        nutritionist_id: user.id,
        name: `AI Generated Plan - ${selectedClient.full_name}`,
        description: `${generatedPlan.duration_days}-day ${generatedPlan.diet_type} meal plan generated by AI based on client profile`,
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        target_calories: generatedPlan.target_calories,
        target_protein_g: generatedPlan.target_protein,
        target_carbs_g: generatedPlan.target_carbs,
        target_fat_g: generatedPlan.target_fat,
        meal_schedule: mealSchedule,
        notes: `AI Generated. Allergies: ${generatedPlan.allergies.join(', ') || 'None'}. Diet: ${generatedPlan.diet_type}`,
        status: 'active'
      };

      const { error } = await supabase
        .from('meal_plans_v2')
        .insert(planData);

      if (error) throw error;

      toast({
        title: 'Success!',
        description: 'Meal plan saved successfully'
      });

      if (onPlanGenerated) {
        onPlanGenerated(planData);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save meal plan'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Sparkles className="w-12 h-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Select a Client</h3>
        <p className="text-muted-foreground">Choose a client to generate a personalized meal plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        {clients.map(client => (
          <Card
            key={client.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedClient?.id === client.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              fetchClientProfile(client.id);
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{client.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{client.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">{client.tier || 'Base'}</Badge>
              {selectedClient?.id === client.id && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Loading client profile...</p>
        </div>
      )}

      {clientProfile && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Client Profile Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Diet Type</p>
                <p className="font-medium capitalize">{clientProfile.nutrition?.diet_type || 'Not set'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Goal</p>
                <p className="font-medium capitalize">{clientProfile.nutrition?.primary_goal?.replace('_', ' ') || 'Not set'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Allergies</p>
                <p className="font-medium">{clientProfile.nutrition?.allergies?.length || 0} listed</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Calories</p>
                <p className="font-medium">{clientProfile.nutrition?.target_calories || 2000} kcal</p>
              </div>
            </div>
            {clientProfile.nutrition?.allergies?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {clientProfile.nutrition.allergies.map(allergy => (
                  <Badge key={allergy} variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Configure Meal Plan</h3>
        <p className="text-muted-foreground">Customize the plan settings for {selectedClient?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Plan Duration</Label>
          <select
            value={planConfig.duration_days}
            onChange={(e) => setPlanConfig({ ...planConfig, duration_days: parseInt(e.target.value) })}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value={7}>7 Days (1 Week)</option>
            <option value={14}>14 Days (2 Weeks)</option>
            <option value={21}>21 Days (3 Weeks)</option>
            <option value={28}>28 Days (4 Weeks)</option>
          </select>
        </div>

        <div>
          <Label>Meals Per Day</Label>
          <select
            value={planConfig.meals_per_day}
            onChange={(e) => setPlanConfig({ ...planConfig, meals_per_day: parseInt(e.target.value) })}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value={3}>3 Meals</option>
            <option value={4}>4 Meals</option>
            <option value={5}>5 Meals</option>
            <option value={6}>6 Meals</option>
          </select>
        </div>

        <div>
          <Label>Budget Level</Label>
          <select
            value={planConfig.budget}
            onChange={(e) => setPlanConfig({ ...planConfig, budget: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value="low">Budget-Friendly</option>
            <option value="moderate">Moderate</option>
            <option value="high">No Limit</option>
          </select>
        </div>

        <div>
          <Label>Prep Time Preference</Label>
          <select
            value={planConfig.prep_time}
            onChange={(e) => setPlanConfig({ ...planConfig, prep_time: e.target.value })}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
          >
            <option value="quick">Quick (under 20 min)</option>
            <option value="medium">Medium (20-45 min)</option>
            <option value="any">Any Duration</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="snacks"
          checked={planConfig.include_snacks}
          onCheckedChange={(checked) => setPlanConfig({ ...planConfig, include_snacks: checked })}
        />
        <Label htmlFor="snacks">Include snacks between meals</Label>
      </div>

      <div>
        <Label className="mb-2 block">Goal Focus</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {goalOptions.map(goal => (
            <Button
              key={goal.value}
              variant={planConfig.goal_focus === goal.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPlanConfig({ ...planConfig, goal_focus: goal.value })}
              className="flex items-center gap-2"
            >
              <goal.icon className="w-4 h-4" />
              {goal.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Cuisine Preferences (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map(cuisine => (
            <Badge
              key={cuisine}
              variant={planConfig.cuisine_preferences.includes(cuisine) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                const prefs = planConfig.cuisine_preferences.includes(cuisine)
                  ? planConfig.cuisine_preferences.filter(c => c !== cuisine)
                  : [...planConfig.cuisine_preferences, cuisine];
                setPlanConfig({ ...planConfig, cuisine_preferences: prefs });
              }}
            >
              {cuisine}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Check className="w-12 h-12 mx-auto text-green-500 mb-2" />
        <h3 className="text-xl font-semibold">Meal Plan Generated!</h3>
        <p className="text-muted-foreground">Review the plan before saving</p>
      </div>

      {generatedPlan && (
        <>
          {/* Summary Card */}
          <Card className="bg-primary/5">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{generatedPlan.duration_days}</p>
                  <p className="text-xs text-muted-foreground">Days</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{generatedPlan.target_calories}</p>
                  <p className="text-xs text-muted-foreground">Daily Calories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{generatedPlan.target_protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein Target</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{generatedPlan.grocery_list.length}</p>
                  <p className="text-xs text-muted-foreground">Grocery Items</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days Preview */}
          <div className="max-h-[300px] overflow-y-auto space-y-3">
            {generatedPlan.days.slice(0, 3).map((day, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Day {day.dayNumber} - {day.day}</h4>
                    <Badge variant="outline">
                      {day.totals.calories} kcal
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {day.meals.map((meal, mealIndex) => (
                      <div key={mealIndex} className="p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground">{meal.type}</p>
                        <p className="font-medium truncate">{meal.name}</p>
                        <p className="text-xs text-muted-foreground">{meal.calories} kcal</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {generatedPlan.days.length > 3 && (
              <p className="text-center text-muted-foreground text-sm">
                + {generatedPlan.days.length - 3} more days...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Meal Plan Generator
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <DialogFooter className="mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}

          {step === 1 && (
            <Button
              onClick={() => setStep(2)}
              disabled={!clientProfile}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {step === 2 && (
            <Button onClick={generateMealPlan} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          )}

          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => { setStep(2); setGeneratedPlan(null); }}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button onClick={saveMealPlan} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Meal Plan
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIMealPlanGenerator;
