import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Users,
  Flame,
  Save,
  X,
  ChefHat
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RecipeDatabase = ({ onSelectRecipe }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [recipeForm, setRecipeForm] = useState({
    name: '',
    description: '',
    category: 'breakfast',
    servings: 1,
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [''],
    calories_per_serving: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    tags: [],
    is_public: false,
  });

  const categories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const commonTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'high-protein', 'low-carb', 'keto', 'paleo'];

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  useEffect(() => {
    filterRecipes();
  }, [searchTerm, categoryFilter, recipes]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`nutritionist_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch recipes',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === categoryFilter);
    }

    setFilteredRecipes(filtered);
  };

  const handleOpenDialog = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setRecipeForm({
        ...recipe,
        ingredients: recipe.ingredients || [{ name: '', amount: '', unit: '' }],
        instructions: recipe.instructions || [''],
        tags: recipe.tags || [],
      });
    } else {
      setEditingRecipe(null);
      setRecipeForm({
        name: '',
        description: '',
        category: 'breakfast',
        servings: 1,
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        ingredients: [{ name: '', amount: '', unit: '' }],
        instructions: [''],
        calories_per_serving: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        tags: [],
        is_public: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSaveRecipe = async () => {
    if (!recipeForm.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Recipe name is required',
      });
      return;
    }

    setSaving(true);
    try {
      const recipeData = {
        ...recipeForm,
        nutritionist_id: user.id,
        ingredients: recipeForm.ingredients.filter(i => i.name),
        instructions: recipeForm.instructions.filter(i => i.trim()),
      };

      if (editingRecipe) {
        const { error } = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', editingRecipe.id);

        if (error) throw error;
        toast({ title: 'Recipe updated successfully' });
      } else {
        const { error } = await supabase
          .from('recipes')
          .insert(recipeData);

        if (error) throw error;
        toast({ title: 'Recipe created successfully' });
      }

      setDialogOpen(false);
      fetchRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save recipe',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      toast({ title: 'Recipe deleted successfully' });
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete recipe',
      });
    }
  };

  const addIngredient = () => {
    setRecipeForm({
      ...recipeForm,
      ingredients: [...recipeForm.ingredients, { name: '', amount: '', unit: '' }],
    });
  };

  const removeIngredient = (index) => {
    setRecipeForm({
      ...recipeForm,
      ingredients: recipeForm.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...recipeForm.ingredients];
    newIngredients[index][field] = value;
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  const addInstruction = () => {
    setRecipeForm({
      ...recipeForm,
      instructions: [...recipeForm.instructions, ''],
    });
  };

  const removeInstruction = (index) => {
    setRecipeForm({
      ...recipeForm,
      instructions: recipeForm.instructions.filter((_, i) => i !== index),
    });
  };

  const updateInstruction = (index, value) => {
    const newInstructions = [...recipeForm.instructions];
    newInstructions[index] = value;
    setRecipeForm({ ...recipeForm, instructions: newInstructions });
  };

  const toggleTag = (tag) => {
    const newTags = recipeForm.tags.includes(tag)
      ? recipeForm.tags.filter(t => t !== tag)
      : [...recipeForm.tags, tag];
    setRecipeForm({ ...recipeForm, tags: newTags });
  };

  const RecipeCard = ({ recipe }) => (
    <Card className="glass-effect hover:shadow-lg transition-all cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1" onClick={() => onSelectRecipe && onSelectRecipe(recipe)}>
            <h3 className="font-semibold text-lg mb-1">{recipe.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); handleOpenDialog(recipe); }}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {recipe.nutritionist_id === user.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id); }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className="capitalize">{recipe.category}</Badge>
          {recipe.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-muted-foreground" />
            <span>{recipe.calories_per_serving || 0} cal</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="font-semibold">{recipe.protein_g || 0}g</p>
            <p className="text-muted-foreground">Protein</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="font-semibold">{recipe.carbs_g || 0}g</p>
            <p className="text-muted-foreground">Carbs</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="font-semibold">{recipe.fat_g || 0}g</p>
            <p className="text-muted-foreground">Fat</p>
          </div>
          <div className="text-center p-2 bg-muted/50 rounded">
            <p className="font-semibold">{recipe.fiber_g || 0}g</p>
            <p className="text-muted-foreground">Fiber</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-primary" />
            Recipe Database
          </h2>
          <p className="text-muted-foreground mt-1">Create and manage your recipe library</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          New Recipe
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setCategoryFilter('all')}
                size="sm"
              >
                All
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(cat)}
                  size="sm"
                  className="capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <Card className="glass-effect">
          <CardContent className="p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first recipe to get started'}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recipe Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Recipe Name *</label>
                <Input
                  value={recipeForm.name}
                  onChange={(e) => setRecipeForm({ ...recipeForm, name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Salad"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={recipeForm.description}
                  onChange={(e) => setRecipeForm({ ...recipeForm, description: e.target.value })}
                  placeholder="Brief description of the recipe"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <select
                  value={recipeForm.category}
                  onChange={(e) => setRecipeForm({ ...recipeForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Servings</label>
                <Input
                  type="number"
                  min="1"
                  value={recipeForm.servings}
                  onChange={(e) => setRecipeForm({ ...recipeForm, servings: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prep Time (min)</label>
                <Input
                  type="number"
                  min="0"
                  value={recipeForm.prep_time_minutes}
                  onChange={(e) => setRecipeForm({ ...recipeForm, prep_time_minutes: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cook Time (min)</label>
                <Input
                  type="number"
                  min="0"
                  value={recipeForm.cook_time_minutes}
                  onChange={(e) => setRecipeForm({ ...recipeForm, cook_time_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Nutrition Info */}
            <div>
              <h3 className="font-semibold mb-3">Nutrition (per serving)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Calories</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={recipeForm.calories_per_serving}
                    onChange={(e) => setRecipeForm({ ...recipeForm, calories_per_serving: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={recipeForm.protein_g}
                    onChange={(e) => setRecipeForm({ ...recipeForm, protein_g: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={recipeForm.carbs_g}
                    onChange={(e) => setRecipeForm({ ...recipeForm, carbs_g: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fat (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={recipeForm.fat_g}
                    onChange={(e) => setRecipeForm({ ...recipeForm, fat_g: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fiber (g)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={recipeForm.fiber_g}
                    onChange={(e) => setRecipeForm({ ...recipeForm, fiber_g: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Ingredients</h3>
                <Button onClick={addIngredient} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {recipeForm.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Ingredient name"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Amount"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      className="w-24"
                    />
                    <Input
                      placeholder="Unit"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      className="w-24"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(index)}
                      disabled={recipeForm.ingredients.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Instructions</h3>
                <Button onClick={addInstruction} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </Button>
              </div>
              <div className="space-y-2">
                {recipeForm.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-sm font-medium text-muted-foreground pt-2">{index + 1}.</span>
                    <Textarea
                      placeholder="Instruction step"
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstruction(index)}
                      disabled={recipeForm.instructions.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={recipeForm.tags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Public Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_public"
                checked={recipeForm.is_public}
                onChange={(e) => setRecipeForm({ ...recipeForm, is_public: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_public" className="text-sm font-medium">
                Make this recipe public (visible to other nutritionists)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRecipe} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Recipe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeDatabase;
