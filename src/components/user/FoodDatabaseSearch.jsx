import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Search, Plus, Loader2, Info, X, Check } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Food Database Search Component
 * Integrates with USDA FoodData Central API (100K+ foods)
 * Free tier feature - available to ALL users
 *
 * Addresses critical gap: Competitors have millions of foods, we only had 8 categories
 */
const FoodDatabaseSearch = ({ onFoodSelected }) => {
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [servingSize, setServingSize] = useState(100); // grams
  const [dataType, setDataType] = useState('Foundation,SR Legacy'); // USDA data types

  const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY'; // Get from env

  /**
   * Search USDA FoodData Central
   * Free API with 100K+ foods
   */
  const searchFoods = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      toast({
        title: 'Search Query Too Short',
        description: 'Please enter at least 2 characters to search',
      });
      return;
    }

    setSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?` +
        `query=${encodeURIComponent(searchQuery)}&` +
        `dataType=${dataType}&` +
        `pageSize=20&` +
        `api_key=${USDA_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('USDA API error: ' + response.statusText);
      }

      const data = await response.json();

      if (!data.foods || data.foods.length === 0) {
        toast({
          title: 'No Results',
          description: `No foods found for "${searchQuery}". Try different keywords.`,
        });
        setSearching(false);
        return;
      }

      // Transform USDA data to our format
      const transformedResults = data.foods.map((food) => ({
        fdcId: food.fdcId,
        name: food.description || food.lowercaseDescription,
        brandName: food.brandName || food.brandOwner || null,
        dataType: food.dataType,
        category: food.foodCategory || null,
        nutrients: extractNutrients(food.foodNutrients || []),
        servingSize: food.servingSize || 100,
        servingUnit: food.servingSizeUnit || 'g',
        score: food.score || 0, // Relevance score
      }));

      setSearchResults(transformedResults);

      toast({
        title: 'Search Complete',
        description: `Found ${transformedResults.length} foods`,
      });

    } catch (err) {
      console.error('Search error:', err);
      toast({
        title: 'Search Failed',
        description: err.message || 'Failed to search food database',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  /**
   * Extract key nutrients from USDA data
   */
  const extractNutrients = (foodNutrients) => {
    const nutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    foodNutrients.forEach((nutrient) => {
      const name = nutrient.nutrientName?.toLowerCase() || '';
      const value = nutrient.value || 0;

      if (name.includes('energy') || name.includes('calori')) {
        nutrients.calories = value;
      } else if (name.includes('protein')) {
        nutrients.protein = value;
      } else if (name.includes('carbohydrate')) {
        nutrients.carbs = value;
      } else if (name.includes('total lipid') || name.includes('fat')) {
        nutrients.fats = value;
      } else if (name.includes('fiber')) {
        nutrients.fiber = value;
      } else if (name.includes('sugars')) {
        nutrients.sugar = value;
      } else if (name.includes('sodium')) {
        nutrients.sodium = value;
      }
    });

    return nutrients;
  };

  /**
   * Get detailed food information
   */
  const selectFood = async (food) => {
    setLoadingDetails(true);
    setSelectedFood(food);

    try {
      // Fetch full details from USDA if needed
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${USDA_API_KEY}`
      );

      if (response.ok) {
        const detailedData = await response.json();
        const detailedNutrients = extractNutrients(detailedData.foodNutrients || []);

        setSelectedFood({
          ...food,
          nutrients: detailedNutrients,
          ingredients: detailedData.ingredients || null,
          labelNutrients: detailedData.labelNutrients || null,
        });
      }
    } catch (err) {
      console.error('Error loading food details:', err);
      // Continue with existing data
    } finally {
      setLoadingDetails(false);
    }
  };

  /**
   * Add selected food to meal log
   */
  const addToMealLog = async () => {
    if (!selectedFood || !userProfile?.id) return;

    try {
      // Calculate nutrition based on serving size
      const multiplier = servingSize / 100; // USDA data is per 100g

      const { data, error } = await supabase
        .from('meal_logs')
        .insert({
          user_id: userProfile.id,
          food_name: selectedFood.name,
          brand: selectedFood.brandName,
          serving_size: `${servingSize}g`,
          calories: Math.round(selectedFood.nutrients.calories * multiplier),
          protein: (selectedFood.nutrients.protein * multiplier).toFixed(1),
          carbs: (selectedFood.nutrients.carbs * multiplier).toFixed(1),
          fats: (selectedFood.nutrients.fats * multiplier).toFixed(1),
          fiber: (selectedFood.nutrients.fiber * multiplier).toFixed(1),
          meal_type: 'snack', // Default
          usda_fdc_id: selectedFood.fdcId,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Added to Meal Log!',
        description: `${selectedFood.name} (${servingSize}g) logged successfully`,
      });

      // Callback to parent
      if (onFoodSelected) {
        onFoodSelected(data);
      }

      // Reset
      setSelectedFood(null);
      setSearchResults([]);
      setSearchQuery('');

    } catch (err) {
      console.error('Error adding to meal log:', err);
      toast({
        title: 'Error',
        description: 'Failed to add to meal log',
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchFoods();
    }
  };

  const getDataTypeColor = (type) => {
    const colors = {
      'Foundation': 'bg-green-500',
      'SR Legacy': 'bg-blue-500',
      'Branded': 'bg-purple-500',
      'Survey (FNDDS)': 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Search Card */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            USDA Food Database Search
          </CardTitle>
          <CardDescription>
            Search 100,000+ foods from the USDA FoodData Central database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search for any food (e.g., apple, chicken breast, brown rice)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={searchFoods} disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Data Type Filter */}
          <div>
            <Label htmlFor="data-type">Food Type Filter</Label>
            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger id="data-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Foundation,SR Legacy">All USDA Foods</SelectItem>
                <SelectItem value="Foundation">Foundation Foods (Core ingredients)</SelectItem>
                <SelectItem value="SR Legacy">Legacy Foods (Standardized)</SelectItem>
                <SelectItem value="Branded">Branded Foods (Packaged products)</SelectItem>
                <SelectItem value="Survey (FNDDS)">Survey Foods (What Americans eat)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>USDA FoodData Central</strong> - Official nutrient database from the U.S. Department of Agriculture.
              All nutrition values are per 100g unless otherwise specified.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && !selectedFood && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
            <CardDescription>Click on a food to view details and add to your meal log</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((food) => (
                <div
                  key={food.fdcId}
                  onClick={() => selectFood(food)}
                  className="p-3 rounded-lg bg-background/50 hover:bg-background/70 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">{food.name}</h4>
                      {food.brandName && (
                        <p className="text-sm text-text-secondary">{food.brandName}</p>
                      )}
                      <div className="flex gap-2 mt-1">
                        <Badge className={getDataTypeColor(food.dataType)} variant="secondary">
                          {food.dataType}
                        </Badge>
                        {food.category && (
                          <Badge variant="outline">{food.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{Math.round(food.nutrients.calories)} cal</p>
                      <p className="text-xs text-text-secondary">per 100g</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Food Details */}
      {selectedFood && (
        <Card className="glass-effect">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle>{selectedFood.name}</CardTitle>
                {selectedFood.brandName && (
                  <CardDescription>{selectedFood.brandName}</CardDescription>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFood(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingDetails && (
              <div className="text-center py-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-text-secondary mt-2">Loading detailed nutrition...</p>
              </div>
            )}

            {!loadingDetails && (
              <>
                {/* Serving Size Input */}
                <div>
                  <Label htmlFor="serving-size">Serving Size (grams)</Label>
                  <Input
                    id="serving-size"
                    type="number"
                    value={servingSize}
                    onChange={(e) => setServingSize(parseInt(e.target.value) || 100)}
                    min="1"
                    max="10000"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Common portions: 28g (1 oz), 100g, 227g (8 oz), 454g (1 lb)
                  </p>
                </div>

                {/* Nutrition Facts */}
                <div>
                  <h4 className="font-semibold mb-3">Nutrition Facts (per {servingSize}g)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Calories</p>
                      <p className="text-xl font-bold">
                        {Math.round(selectedFood.nutrients.calories * (servingSize / 100))}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Protein</p>
                      <p className="text-xl font-bold">
                        {(selectedFood.nutrients.protein * (servingSize / 100)).toFixed(1)}g
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Carbs</p>
                      <p className="text-xl font-bold">
                        {(selectedFood.nutrients.carbs * (servingSize / 100)).toFixed(1)}g
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-xs text-text-secondary">Fats</p>
                      <p className="text-xl font-bold">
                        {(selectedFood.nutrients.fats * (servingSize / 100)).toFixed(1)}g
                      </p>
                    </div>
                  </div>

                  {/* Additional Nutrients */}
                  {(selectedFood.nutrients.fiber > 0 || selectedFood.nutrients.sugar > 0) && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {selectedFood.nutrients.fiber > 0 && (
                        <div className="p-2 rounded bg-background/30">
                          <p className="text-xs text-text-secondary">Fiber</p>
                          <p className="font-semibold">
                            {(selectedFood.nutrients.fiber * (servingSize / 100)).toFixed(1)}g
                          </p>
                        </div>
                      )}
                      {selectedFood.nutrients.sugar > 0 && (
                        <div className="p-2 rounded bg-background/30">
                          <p className="text-xs text-text-secondary">Sugar</p>
                          <p className="font-semibold">
                            {(selectedFood.nutrients.sugar * (servingSize / 100)).toFixed(1)}g
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={addToMealLog} className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Meal Log
                  </Button>
                  <Button onClick={() => setSelectedFood(null)} variant="outline">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FoodDatabaseSearch;
