import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Copy,
  Download,
  Refrigerator,
  Flame,
  Apple,
  UtensilsCrossed,
  CheckCircle,
  Circle,
  Save,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const MealPrepGuide = ({ compact = false }) => {
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMealTime, setSelectedMealTime] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // New plan form
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    target_calories: '',
    servings: 4
  });

  // New recipe form
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    meal_type: 'Lunch',
    prep_time: '',
    cook_time: '',
    servings: 4,
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    ingredients: [],
    instructions: '',
    notes: ''
  });

  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    quantity: '',
    unit: ''
  });

  useEffect(() => {
    if (user) {
      fetchMealPlans();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPlan) {
      generateShoppingList();
    }
  }, [selectedPlan]);

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_prep_plans')
        .select(`
          *,
          meal_prep_recipes (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMealPlans(data || []);
      if (data && data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load meal plans',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_prep_plans')
        .insert({
          user_id: user.id,
          name: newPlan.name,
          description: newPlan.description,
          target_calories: newPlan.target_calories ? parseInt(newPlan.target_calories) : null,
          servings: newPlan.servings
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Meal plan created successfully'
      });

      setShowPlanDialog(false);
      setNewPlan({ name: '', description: '', target_calories: '', servings: 4 });
      fetchMealPlans();
      setSelectedPlan(data);
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create meal plan',
        variant: 'destructive'
      });
    }
  };

  const addIngredient = () => {
    if (currentIngredient.name && currentIngredient.quantity) {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...newRecipe.ingredients, { ...currentIngredient }]
      });
      setCurrentIngredient({ name: '', quantity: '', unit: '' });
    }
  };

  const removeIngredient = (index) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((_, i) => i !== index)
    });
  };

  const addRecipeToWeek = async () => {
    if (!selectedPlan || !selectedDay || !selectedMealTime) return;

    try {
      const { error } = await supabase
        .from('meal_prep_recipes')
        .insert({
          plan_id: selectedPlan.id,
          day_of_week: selectedDay,
          meal_type: selectedMealTime,
          recipe_name: newRecipe.name,
          prep_time: parseInt(newRecipe.prep_time) || 0,
          cook_time: parseInt(newRecipe.cook_time) || 0,
          servings: newRecipe.servings,
          calories: parseInt(newRecipe.calories) || 0,
          protein: parseInt(newRecipe.protein) || 0,
          carbs: parseInt(newRecipe.carbs) || 0,
          fat: parseInt(newRecipe.fat) || 0,
          ingredients: newRecipe.ingredients,
          instructions: newRecipe.instructions,
          notes: newRecipe.notes
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Recipe added to meal plan'
      });

      setShowRecipeDialog(false);
      setNewRecipe({
        name: '',
        meal_type: 'Lunch',
        prep_time: '',
        cook_time: '',
        servings: 4,
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        ingredients: [],
        instructions: '',
        notes: ''
      });
      fetchMealPlans();
    } catch (error) {
      console.error('Error adding recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to add recipe',
        variant: 'destructive'
      });
    }
  };

  const generateShoppingList = async () => {
    if (!selectedPlan || !selectedPlan.meal_prep_recipes) return;

    // Aggregate all ingredients
    const ingredientMap = {};

    selectedPlan.meal_prep_recipes.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase();
          if (ingredientMap[key]) {
            ingredientMap[key].quantity += parseFloat(ing.quantity) || 0;
          } else {
            ingredientMap[key] = {
              name: ing.name,
              quantity: parseFloat(ing.quantity) || 0,
              unit: ing.unit || ''
            };
          }
        });
      }
    });

    setShoppingList(Object.values(ingredientMap));
  };

  const toggleChecked = (itemName) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemName)) {
      newChecked.delete(itemName);
    } else {
      newChecked.add(itemName);
    }
    setCheckedItems(newChecked);
  };

  const getRecipeForSlot = (day, mealType) => {
    if (!selectedPlan || !selectedPlan.meal_prep_recipes) return null;

    return selectedPlan.meal_prep_recipes.find(
      r => r.day_of_week === day && r.meal_type === mealType
    );
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const { error } = await supabase
        .from('meal_prep_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Recipe removed from plan'
      });

      fetchMealPlans();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        variant: 'destructive'
      });
    }
  };

  const exportShoppingList = () => {
    const text = shoppingList
      .map(item => `${item.name}: ${item.quantity} ${item.unit}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-primary" />
                Meal Prep Guide
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {mealPlans.length} meal plans • Weekly meal preparation
              </p>
            </div>

            <div className="flex items-center gap-2">
              {selectedPlan && (
                <Select
                  value={selectedPlan.id}
                  onValueChange={(value) => {
                    const plan = mealPlans.find(p => p.id === value);
                    setSelectedPlan(plan);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mealPlans.map(plan => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                onClick={() => setShowPlanDialog(true)}
                className="gap-2 bg-gradient-to-r from-primary to-purple-600"
              >
                <Plus className="w-4 h-4" />
                New Plan
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!selectedPlan ? (
        <Card className="glass-effect">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <ChefHat className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No meal plans yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
              Create your first meal prep plan to get started with weekly meal preparation
            </p>
            <Button onClick={() => setShowPlanDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="week" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week View</TabsTrigger>
            <TabsTrigger value="shopping">Shopping List</TabsTrigger>
            <TabsTrigger value="prep">Prep Steps</TabsTrigger>
          </TabsList>

          {/* Week View */}
          <TabsContent value="week" className="space-y-4">
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedPlan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPlan.description}
                    </p>
                  </div>

                  {selectedPlan.target_calories && (
                    <Badge variant="secondary" className="gap-2">
                      <Flame className="w-4 h-4" />
                      {selectedPlan.target_calories} cal/day
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {DAYS_OF_WEEK.map((day, dayIndex) => (
                    <div key={day}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {day}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {MEAL_TIMES.map(mealType => {
                          const recipe = getRecipeForSlot(day, mealType);

                          return (
                            <motion.div
                              key={`${day}-${mealType}`}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (dayIndex * MEAL_TIMES.length + MEAL_TIMES.indexOf(mealType)) * 0.02 }}
                            >
                              {recipe ? (
                                <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <Badge variant="outline" className="text-xs">
                                        {mealType}
                                      </Badge>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => deleteRecipe(recipe.id)}
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                                      {recipe.recipe_name}
                                    </h4>

                                    <div className="space-y-1 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Flame className="w-3 h-3" />
                                        <span>{recipe.calories || 0} cal</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        <span>{recipe.servings || 4} servings</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-2 border-dashed hover:border-primary hover:bg-primary/5"
                                  onClick={() => {
                                    setSelectedDay(day);
                                    setSelectedMealTime(mealType);
                                    setShowRecipeDialog(true);
                                  }}
                                >
                                  <Plus className="w-5 h-5" />
                                  <span className="text-xs">Add {mealType}</span>
                                </Button>
                              )}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shopping List */}
          <TabsContent value="shopping">
            <Card className="glass-effect">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Shopping List
                  </CardTitle>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportShoppingList}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {shoppingList.length === 0 ? (
                  <div className="text-center p-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Add recipes to your meal plan to generate a shopping list
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shoppingList.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={checkedItems.has(item.name)}
                          onCheckedChange={() => toggleChecked(item.name)}
                        />
                        <div className={`flex-1 ${checkedItems.has(item.name) ? 'line-through text-muted-foreground' : ''}`}>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        {checkedItems.size} of {shoppingList.length} items checked
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prep Steps */}
          <TabsContent value="prep">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Meal Prep Guide
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Prep Tips */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        Meal Prep Tips
                      </p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Prep on Sunday for the week ahead</li>
                        <li>• Use airtight containers to keep food fresh</li>
                        <li>• Cook similar items together to save time</li>
                        <li>• Label containers with date and contents</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Weekly Prep Workflow */}
                <div>
                  <h3 className="font-semibold mb-4">Recommended Prep Workflow</h3>
                  <div className="space-y-4">
                    <StepCard
                      number={1}
                      title="Shopping"
                      description="Get all ingredients from your shopping list"
                      icon={ShoppingCart}
                      estimatedTime="30-45 min"
                    />
                    <StepCard
                      number={2}
                      title="Wash & Chop"
                      description="Prep all vegetables and fruits"
                      icon={Apple}
                      estimatedTime="20-30 min"
                    />
                    <StepCard
                      number={3}
                      title="Cook Proteins"
                      description="Cook all proteins (chicken, fish, etc.)"
                      icon={Flame}
                      estimatedTime="45-60 min"
                    />
                    <StepCard
                      number={4}
                      title="Prepare Carbs"
                      description="Cook rice, pasta, or other grains"
                      icon={UtensilsCrossed}
                      estimatedTime="30-40 min"
                    />
                    <StepCard
                      number={5}
                      title="Portion & Store"
                      description="Divide into meal containers and refrigerate"
                      icon={Refrigerator}
                      estimatedTime="15-20 min"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Meal Prep Plan</DialogTitle>
            <DialogDescription>
              Set up a new weekly meal preparation plan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Plan Name</label>
              <Input
                placeholder="e.g., High Protein Week"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                placeholder="Brief description of this meal plan..."
                value={newPlan.description}
                onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Target Calories/Day (Optional)</label>
              <Input
                type="number"
                placeholder="e.g., 2000"
                value={newPlan.target_calories}
                onChange={(e) => setNewPlan({ ...newPlan, target_calories: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Default Servings</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newPlan.servings}
                onChange={(e) => setNewPlan({ ...newPlan, servings: parseInt(e.target.value) })}
              />
            </div>

            <Button
              onClick={createPlan}
              disabled={!newPlan.name}
              className="w-full"
            >
              Create Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Recipe Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Recipe</DialogTitle>
            <DialogDescription>
              {selectedDay} - {selectedMealTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Recipe Name</label>
              <Input
                placeholder="e.g., Grilled Chicken Salad"
                value={newRecipe.name}
                onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prep Time (min)</label>
                <Input
                  type="number"
                  placeholder="15"
                  value={newRecipe.prep_time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cook Time (min)</label>
                <Input
                  type="number"
                  placeholder="20"
                  value={newRecipe.cook_time}
                  onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Servings</label>
                <Input
                  type="number"
                  min="1"
                  value={newRecipe.servings}
                  onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Calories</label>
                <Input
                  type="number"
                  placeholder="400"
                  value={newRecipe.calories}
                  onChange={(e) => setNewRecipe({ ...newRecipe, calories: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={newRecipe.protein}
                  onChange={(e) => setNewRecipe({ ...newRecipe, protein: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                <Input
                  type="number"
                  placeholder="40"
                  value={newRecipe.carbs}
                  onChange={(e) => setNewRecipe({ ...newRecipe, carbs: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Fat (g)</label>
                <Input
                  type="number"
                  placeholder="15"
                  value={newRecipe.fat}
                  onChange={(e) => setNewRecipe({ ...newRecipe, fat: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Ingredients</label>
              <div className="space-y-2">
                {newRecipe.ingredients.map((ing, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                    <span className="flex-1 text-sm">
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeIngredient(index)}
                      className="h-6 w-6"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                <div className="grid grid-cols-12 gap-2">
                  <Input
                    placeholder="Ingredient"
                    value={currentIngredient.name}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, name: e.target.value })}
                    className="col-span-5"
                  />
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={currentIngredient.quantity}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, quantity: e.target.value })}
                    className="col-span-3"
                  />
                  <Input
                    placeholder="Unit"
                    value={currentIngredient.unit}
                    onChange={(e) => setCurrentIngredient({ ...currentIngredient, unit: e.target.value })}
                    className="col-span-3"
                  />
                  <Button
                    size="icon"
                    onClick={addIngredient}
                    disabled={!currentIngredient.name || !currentIngredient.quantity}
                    className="col-span-1"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Instructions</label>
              <Textarea
                placeholder="Step-by-step cooking instructions..."
                value={newRecipe.instructions}
                onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                rows={4}
              />
            </div>

            <Button
              onClick={addRecipeToWeek}
              disabled={!newRecipe.name || newRecipe.ingredients.length === 0}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Step Card Component
const StepCard = ({ number, title, description, icon: Icon, estimatedTime }) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
        {number}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-5 h-5 text-primary" />
          <h4 className="font-semibold">{title}</h4>
        </div>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <Badge variant="secondary" className="gap-1">
          <Clock className="w-3 h-3" />
          {estimatedTime}
        </Badge>
      </div>
    </div>
  );
};

export default MealPrepGuide;
