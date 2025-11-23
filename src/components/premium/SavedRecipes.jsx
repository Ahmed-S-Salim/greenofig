import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Search,
  Filter,
  ChefHat,
  Clock,
  Users,
  Flame,
  BookmarkPlus,
  FolderPlus,
  Share2,
  Download,
  Trash2,
  Star,
  ShoppingCart,
  Tag,
  X,
  ArrowUpDown,
  Grid3x3,
  List,
  Eye,
  Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

const SavedRecipes = ({ compact = false }) => {
  const [recipes, setRecipes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('recent'); // recent, name, rating, time
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showShoppingListDialog, setShowShoppingListDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedRecipesForCart, setSelectedRecipesForCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // New collection form
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  useEffect(() => {
    if (user) {
      fetchRecipes();
      fetchCollections();
    }
  }, [user]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          *,
          recipe_collections (
            id,
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load saved recipes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  const createCollection = async () => {
    try {
      const { error } = await supabase
        .from('recipe_collections')
        .insert({
          user_id: user.id,
          name: newCollection.name,
          description: newCollection.description,
          color: newCollection.color
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Collection created successfully'
      });

      setShowCollectionDialog(false);
      setNewCollection({ name: '', description: '', color: 'blue' });
      fetchCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to create collection',
        variant: 'destructive'
      });
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Recipe removed from saved'
      });

      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete recipe',
        variant: 'destructive'
      });
    }
  };

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipesForCart(prev =>
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const generateShoppingList = () => {
    const selectedRecipeObjects = recipes.filter(r => selectedRecipesForCart.includes(r.id));

    // Aggregate ingredients from all selected recipes
    const ingredientMap = {};

    selectedRecipeObjects.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(ing => {
          if (ingredientMap[ing.name]) {
            ingredientMap[ing.name].quantity += parseFloat(ing.quantity) || 0;
          } else {
            ingredientMap[ing.name] = {
              name: ing.name,
              quantity: parseFloat(ing.quantity) || 0,
              unit: ing.unit || ''
            };
          }
        });
      }
    });

    return Object.values(ingredientMap);
  };

  const saveShoppingList = async () => {
    try {
      const shoppingList = generateShoppingList();

      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: `Shopping List - ${new Date().toLocaleDateString()}`,
          items: shoppingList,
          recipe_ids: selectedRecipesForCart
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Shopping list created successfully'
      });

      setShowShoppingListDialog(false);
      setSelectedRecipesForCart([]);
    } catch (error) {
      console.error('Error saving shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to create shopping list',
        variant: 'destructive'
      });
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    // Filter by collection
    if (selectedCollection !== 'all' && recipe.collection_id !== selectedCollection) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by cuisine
    if (filterCuisine !== 'all' && recipe.cuisine !== filterCuisine) {
      return false;
    }

    // Filter by difficulty
    if (filterDifficulty !== 'all' && recipe.difficulty !== filterDifficulty) {
      return false;
    }

    return true;
  });

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'time':
        return (a.prep_time + a.cook_time) - (b.prep_time + b.cook_time);
      case 'recent':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const getCuisineColor = (cuisine) => {
    const colors = {
      italian: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      mexican: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      asian: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      mediterranean: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      indian: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      american: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    };
    return colors[cuisine?.toLowerCase()] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'hard':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
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
                Saved Recipes
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {recipes.length} recipes saved across {collections.length} collections
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCollectionDialog(true)}
                className="gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                New Collection
              </Button>

              {selectedRecipesForCart.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowShoppingListDialog(true)}
                  className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Create List ({selectedRecipesForCart.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCuisine} onValueChange={setFilterCuisine}>
              <SelectTrigger>
                <SelectValue placeholder="Cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cuisines</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="mexican">Mexican</SelectItem>
                <SelectItem value="asian">Asian</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
                <SelectItem value="indian">Indian</SelectItem>
                <SelectItem value="american">American</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collections and View Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={selectedCollection === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCollection('all')}
              >
                All Recipes ({recipes.length})
              </Button>
              {collections.map(collection => (
                <Button
                  key={collection.id}
                  variant={selectedCollection === collection.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCollection(collection.id)}
                  className="gap-2"
                >
                  <div className={`w-2 h-2 rounded-full bg-${collection.color}-500`} />
                  {collection.name}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="time">Quickest</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-7 w-7"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-7 w-7"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Grid/List */}
      {sortedRecipes.length === 0 ? (
        <Card className="glass-effect">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <ChefHat className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {searchQuery || filterCuisine !== 'all' || filterDifficulty !== 'all'
                ? 'Try adjusting your filters'
                : 'Start saving recipes to build your collection'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          {sortedRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`glass-effect overflow-hidden hover:shadow-lg transition-all ${
                selectedRecipesForCart.includes(recipe.id) ? 'ring-2 ring-primary' : ''
              }`}>
                {/* Recipe Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-purple-500/20">
                  {recipe.image_url ? (
                    <img
                      src={recipe.image_url}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      onClick={() => toggleRecipeSelection(recipe.id)}
                    >
                      <ShoppingCart className={`w-4 h-4 ${
                        selectedRecipesForCart.includes(recipe.id) ? 'text-primary' : ''
                      }`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setShowRecipeDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Rating Badge */}
                  {recipe.rating && (
                    <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm gap-1">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      {recipe.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Recipe Name */}
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{recipe.name}</h3>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {recipe.description}
                      </p>
                    )}
                  </div>

                  {/* Recipe Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)}min</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{recipe.servings || 4}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Flame className="w-4 h-4" />
                      <span>{recipe.calories || 0} cal</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {recipe.cuisine && (
                      <Badge variant="secondary" className={getCuisineColor(recipe.cuisine)}>
                        {recipe.cuisine}
                      </Badge>
                    )}
                    {recipe.difficulty && (
                      <Badge variant="outline" className={getDifficultyColor(recipe.difficulty)}>
                        {recipe.difficulty}
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setShowRecipeDialog(true);
                      }}
                    >
                      View Recipe
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecipe(recipe.id)}
                      className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRecipe.name}</DialogTitle>
                <DialogDescription>{selectedRecipe.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Recipe Image */}
                {selectedRecipe.image_url && (
                  <img
                    src={selectedRecipe.image_url}
                    alt={selectedRecipe.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}

                {/* Recipe Info */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-semibold">{selectedRecipe.prep_time}min</p>
                    <p className="text-xs text-muted-foreground">Prep</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-semibold">{selectedRecipe.cook_time}min</p>
                    <p className="text-xs text-muted-foreground">Cook</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-semibold">{selectedRecipe.servings}</p>
                    <p className="text-xs text-muted-foreground">Servings</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Flame className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-semibold">{selectedRecipe.calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients?.map((ing, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>{ing.quantity} {ing.unit} {ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions?.map((step, index) => (
                      <li key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <p className="text-sm pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition Info */}
                {selectedRecipe.nutrition && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Nutrition (per serving)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Protein</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition.protein}g</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Carbs</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition.carbs}g</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Fat</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition.fat}g</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Fiber</p>
                        <p className="text-lg font-semibold">{selectedRecipe.nutrition.fiber}g</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Collection Dialog */}
      <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Organize your recipes into custom collections
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Collection Name</label>
              <Input
                placeholder="e.g., Quick Weeknight Dinners"
                value={newCollection.name}
                onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <Textarea
                placeholder="Brief description of this collection..."
                value={newCollection.description}
                onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2">
                {['blue', 'green', 'red', 'yellow', 'purple', 'pink'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewCollection({ ...newCollection, color })}
                    className={`w-8 h-8 rounded-full bg-${color}-500 ${
                      newCollection.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={createCollection}
              disabled={!newCollection.name}
              className="w-full"
            >
              Create Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping List Dialog */}
      <Dialog open={showShoppingListDialog} onOpenChange={setShowShoppingListDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Shopping List</DialogTitle>
            <DialogDescription>
              {selectedRecipesForCart.length} recipes selected
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {generateShoppingList().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={saveShoppingList} className="w-full">
              Save to Shopping Lists
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedRecipes;
