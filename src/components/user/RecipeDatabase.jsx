import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, Users, Flame, ChefHat, Heart, Loader2, BookOpen, Filter } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
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

const RecipeDatabase = () => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [maxPrepTime, setMaxPrepTime] = useState('all');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchRecipes();
    fetchFavorites();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedCategory, selectedDiet, maxPrepTime]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recipes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_favorite_recipes')
        .select('recipe_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.recipe_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    // Diet filter
    if (selectedDiet !== 'all') {
      filtered = filtered.filter(recipe => recipe.diet_type === selectedDiet);
    }

    // Prep time filter
    if (maxPrepTime !== 'all') {
      const maxTime = parseInt(maxPrepTime);
      filtered = filtered.filter(recipe => recipe.prep_time_minutes <= maxTime);
    }

    setFilteredRecipes(filtered);
  };

  const toggleFavorite = async (recipeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorite = favorites.includes(recipeId);

      if (isFavorite) {
        await supabase
          .from('user_favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        await supabase
          .from('user_favorite_recipes')
          .insert({ user_id: user.id, recipe_id: recipeId });
        setFavorites([...favorites, recipeId]);
      }

      toast({
        title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: isFavorite ? 'Recipe removed from your favorites' : 'Recipe saved to your favorites',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  const getDietBadgeColor = (dietType) => {
    const colors = {
      vegetarian: 'bg-green-500/20 text-green-300',
      vegan: 'bg-emerald-500/20 text-emerald-300',
      keto: 'bg-purple-500/20 text-purple-300',
      paleo: 'bg-orange-500/20 text-orange-300',
      'gluten-free': 'bg-yellow-500/20 text-yellow-300',
      'dairy-free': 'bg-blue-500/20 text-blue-300',
      balanced: 'bg-gray-500/20 text-gray-300',
    };
    return colors[dietType] || 'bg-gray-500/20 text-gray-300';
  };

  const RecipeCard = ({ recipe }) => {
    const isFavorite = favorites.includes(recipe.id);

    return (
      <Card className="glass-effect hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <CardContent className="p-0">
          {recipe.image_url && (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img
                src={recipe.image_url}
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(recipe.id);
                }}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
            </div>
          )}
          <div className="p-4" onClick={() => setSelectedRecipe(recipe)}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold line-clamp-1">{recipe.name}</h3>
              {recipe.diet_type && (
                <Badge className={`${getDietBadgeColor(recipe.diet_type)} text-xs`}>
                  {recipe.diet_type}
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
              {recipe.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{recipe.prep_time_minutes} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4" />
                <span>{recipe.calories} cal</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ChefHat className="w-6 h-6 text-primary" />
          Recipe Database
        </CardTitle>
        <p className="text-sm text-text-secondary">
          Discover thousands of healthy recipes tailored to your dietary needs
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search recipes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
                <SelectItem value="dessert">Dessert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDiet} onValueChange={setSelectedDiet}>
              <SelectTrigger>
                <SelectValue placeholder="All Diets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diets</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maxPrepTime} onValueChange={setMaxPrepTime}>
              <SelectTrigger>
                <SelectValue placeholder="Max Prep Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="15">Under 15 min</SelectItem>
                <SelectItem value="30">Under 30 min</SelectItem>
                <SelectItem value="45">Under 45 min</SelectItem>
                <SelectItem value="60">Under 1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Recipes</TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({favorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary">No recipes found matching your filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {filteredRecipes.filter(r => favorites.includes(r.id)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes
                  .filter(r => favorites.includes(r.id))
                  .map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary">No favorite recipes yet</p>
                <p className="text-sm text-text-secondary mt-2">
                  Click the heart icon on any recipe to add it to your favorites
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Recipe Detail Dialog */}
        {selectedRecipe && (
          <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription>{selectedRecipe.description}</DialogDescription>
              </DialogHeader>

              {selectedRecipe.image_url && (
                <img
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="grid grid-cols-4 gap-4 py-4">
                <div className="text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-semibold">{selectedRecipe.prep_time_minutes} min</p>
                  <p className="text-xs text-text-secondary">Prep Time</p>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-semibold">{selectedRecipe.servings}</p>
                  <p className="text-xs text-text-secondary">Servings</p>
                </div>
                <div className="text-center">
                  <Flame className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-semibold">{selectedRecipe.calories}</p>
                  <p className="text-xs text-text-secondary">Calories</p>
                </div>
                <div className="text-center">
                  <Badge className={`${getDietBadgeColor(selectedRecipe.diet_type)} mt-2`}>
                    {selectedRecipe.diet_type}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedRecipe.ingredients?.map((ingredient, idx) => (
                      <li key={idx} className="text-sm">{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {selectedRecipe.instructions?.map((instruction, idx) => (
                      <li key={idx} className="text-sm">{instruction}</li>
                    ))}
                  </ol>
                </div>

                {selectedRecipe.nutrition_info && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Nutrition Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-text-secondary">Protein</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition_info.protein}g</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-text-secondary">Carbs</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition_info.carbs}g</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-text-secondary">Fat</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition_info.fat}g</p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-text-secondary">Fiber</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition_info.fiber}g</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => toggleFavorite(selectedRecipe.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedRecipe.id) ? 'fill-current' : ''}`} />
                  {favorites.includes(selectedRecipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRecipe(null)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeDatabase;
