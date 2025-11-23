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

// Mock data for preview mode
const MOCK_RECIPES = [
  {
    id: 'mock-1',
    name: 'Protein Power Smoothie Bowl',
    description: 'A nutrient-packed breakfast bowl loaded with protein, antioxidants, and healthy fats to kickstart your day.',
    category: 'breakfast',
    diet_type: 'vegetarian',
    prep_time_minutes: 10,
    servings: 2,
    calories: 320,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
    ingredients: [
      '2 frozen bananas',
      '1 cup frozen berries',
      '1 scoop vanilla protein powder',
      '1 cup almond milk',
      '2 tbsp almond butter',
      '1 tbsp chia seeds',
      'Toppings: granola, fresh berries, coconut flakes'
    ],
    instructions: [
      'Add frozen bananas, berries, protein powder, and almond milk to a high-speed blender.',
      'Blend until smooth and creamy, adding more milk if needed for desired consistency.',
      'Pour into bowls and top with almond butter, chia seeds, and your favorite toppings.',
      'Serve immediately and enjoy!'
    ],
    nutrition_info: {
      protein: 28,
      carbs: 42,
      fat: 12,
      fiber: 8
    }
  },
  {
    id: 'mock-2',
    name: 'Grilled Chicken Quinoa Bowl',
    description: 'A balanced, protein-rich lunch with grilled chicken, quinoa, and colorful vegetables.',
    category: 'lunch',
    diet_type: 'balanced',
    prep_time_minutes: 25,
    servings: 4,
    calories: 485,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
    ingredients: [
      '2 chicken breasts (500g)',
      '1 cup quinoa',
      '2 cups chicken broth',
      '2 cups mixed greens',
      '1 cup cherry tomatoes, halved',
      '1 cucumber, diced',
      '1 avocado, sliced',
      '2 tbsp olive oil',
      'Lemon juice, salt, pepper to taste'
    ],
    instructions: [
      'Cook quinoa in chicken broth according to package instructions.',
      'Season chicken breasts with salt, pepper, and herbs. Grill for 6-8 minutes per side.',
      'Prepare vegetables: halve tomatoes, dice cucumber, slice avocado.',
      'Divide quinoa among bowls, top with sliced chicken, vegetables, and drizzle with olive oil and lemon.',
      'Season to taste and serve warm.'
    ],
    nutrition_info: {
      protein: 42,
      carbs: 38,
      fat: 18,
      fiber: 7
    }
  },
  {
    id: 'mock-3',
    name: 'Vegan Buddha Bowl',
    description: 'A complete plant-based meal with roasted chickpeas, sweet potato, and tahini dressing.',
    category: 'dinner',
    diet_type: 'vegan',
    prep_time_minutes: 35,
    servings: 2,
    calories: 425,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
    ingredients: [
      '1 can chickpeas, drained',
      '1 large sweet potato, cubed',
      '2 cups kale, chopped',
      '1 cup quinoa',
      '3 tbsp tahini',
      '2 tbsp lemon juice',
      '2 cups vegetable broth',
      'Spices: cumin, paprika, garlic powder',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Preheat oven to 400F (200C). Toss sweet potato cubes and chickpeas with spices and olive oil.',
      'Roast for 25-30 minutes until golden and crispy.',
      'Cook quinoa in vegetable broth.',
      'Make tahini dressing by mixing tahini, lemon juice, water, and salt.',
      'Assemble bowls with quinoa, roasted vegetables, chickpeas, kale, and drizzle with tahini dressing.'
    ],
    nutrition_info: {
      protein: 18,
      carbs: 62,
      fat: 14,
      fiber: 12
    }
  },
  {
    id: 'mock-4',
    name: 'Avocado Toast with Poached Eggs',
    description: 'Classic breakfast favorite with perfectly poached eggs and creamy avocado.',
    category: 'breakfast',
    diet_type: 'vegetarian',
    prep_time_minutes: 15,
    servings: 2,
    calories: 380,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
    ingredients: [
      '4 slices whole grain bread',
      '2 ripe avocados',
      '4 eggs',
      '1 tbsp white vinegar',
      'Cherry tomatoes',
      'Red pepper flakes',
      'Salt, pepper, lemon juice'
    ],
    instructions: [
      'Toast bread slices until golden brown.',
      'Mash avocados with lemon juice, salt, and pepper.',
      'Bring a pot of water to simmer, add vinegar. Poach eggs for 3-4 minutes.',
      'Spread avocado on toast, top with poached eggs.',
      'Garnish with cherry tomatoes, red pepper flakes, and season to taste.'
    ],
    nutrition_info: {
      protein: 18,
      carbs: 32,
      fat: 22,
      fiber: 10
    }
  },
  {
    id: 'mock-5',
    name: 'Keto Cauliflower Pizza',
    description: 'Low-carb pizza with cauliflower crust, perfect for keto diet enthusiasts.',
    category: 'dinner',
    diet_type: 'keto',
    prep_time_minutes: 45,
    servings: 4,
    calories: 310,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    ingredients: [
      '1 large cauliflower head, riced',
      '2 cups mozzarella cheese',
      '2 eggs',
      '1/4 cup parmesan',
      '1 cup marinara sauce (sugar-free)',
      'Pizza toppings: pepperoni, bell peppers, mushrooms',
      'Italian herbs, garlic powder'
    ],
    instructions: [
      'Rice cauliflower and microwave for 5 minutes. Squeeze out excess moisture using cheesecloth.',
      'Mix cauliflower with 1 cup mozzarella, eggs, parmesan, and seasonings.',
      'Form into pizza crust on parchment paper and bake at 450F for 15 minutes.',
      'Add sauce, remaining cheese, and toppings. Bake for another 10 minutes.',
      'Let cool for 5 minutes before slicing and serving.'
    ],
    nutrition_info: {
      protein: 24,
      carbs: 12,
      fat: 20,
      fiber: 4
    }
  },
  {
    id: 'mock-6',
    name: 'Mediterranean Salmon with Vegetables',
    description: 'Heart-healthy salmon with roasted Mediterranean vegetables.',
    category: 'dinner',
    diet_type: 'paleo',
    prep_time_minutes: 30,
    servings: 2,
    calories: 520,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
    ingredients: [
      '2 salmon fillets (200g each)',
      '2 zucchini, sliced',
      '1 red bell pepper, chopped',
      '1 cup cherry tomatoes',
      '1/4 cup olives',
      '3 tbsp olive oil',
      'Fresh herbs: oregano, thyme',
      'Lemon wedges, garlic, salt, pepper'
    ],
    instructions: [
      'Preheat oven to 400F (200C).',
      'Arrange vegetables on a baking sheet, drizzle with olive oil, season with herbs and garlic.',
      'Roast vegetables for 15 minutes.',
      'Season salmon with salt, pepper, and herbs. Place on the baking sheet with vegetables.',
      'Bake for another 12-15 minutes until salmon is cooked through. Serve with lemon wedges.'
    ],
    nutrition_info: {
      protein: 38,
      carbs: 18,
      fat: 32,
      fiber: 5
    }
  },
  {
    id: 'mock-7',
    name: 'Greek Yogurt Parfait',
    description: 'Layered parfait with Greek yogurt, berries, and honey granola.',
    category: 'breakfast',
    diet_type: 'vegetarian',
    prep_time_minutes: 5,
    servings: 1,
    calories: 285,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
    ingredients: [
      '1 cup Greek yogurt',
      '1/2 cup mixed berries',
      '1/4 cup granola',
      '1 tbsp honey',
      '1 tbsp sliced almonds',
      'Mint leaves for garnish'
    ],
    instructions: [
      'In a glass or bowl, layer half the Greek yogurt.',
      'Add half the berries and a drizzle of honey.',
      'Repeat layers with remaining yogurt and berries.',
      'Top with granola, sliced almonds, and honey.',
      'Garnish with mint and serve immediately.'
    ],
    nutrition_info: {
      protein: 20,
      carbs: 38,
      fat: 8,
      fiber: 4
    }
  },
  {
    id: 'mock-8',
    name: 'Spicy Thai Peanut Noodles',
    description: 'Vibrant Asian-inspired noodles with vegetables and spicy peanut sauce.',
    category: 'lunch',
    diet_type: 'vegan',
    prep_time_minutes: 20,
    servings: 3,
    calories: 395,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
    ingredients: [
      '8 oz rice noodles',
      '2 cups mixed vegetables (bell peppers, carrots, snap peas)',
      '1/4 cup peanut butter',
      '2 tbsp soy sauce',
      '1 tbsp sriracha',
      '1 tbsp maple syrup',
      'Lime juice, garlic, ginger',
      'Crushed peanuts, cilantro for garnish'
    ],
    instructions: [
      'Cook rice noodles according to package directions. Drain and set aside.',
      'Stir-fry vegetables in a wok until tender-crisp.',
      'Mix peanut butter, soy sauce, sriracha, maple syrup, lime juice, garlic, and ginger to make sauce.',
      'Toss noodles and vegetables with the sauce until well coated.',
      'Garnish with crushed peanuts and fresh cilantro. Serve warm or cold.'
    ],
    nutrition_info: {
      protein: 14,
      carbs: 52,
      fat: 16,
      fiber: 6
    }
  },
  {
    id: 'mock-9',
    name: 'Energy Balls',
    description: 'No-bake protein-packed snack balls perfect for pre or post-workout.',
    category: 'snack',
    diet_type: 'vegan',
    prep_time_minutes: 10,
    servings: 12,
    calories: 95,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800',
    ingredients: [
      '1 cup rolled oats',
      '1/2 cup peanut butter',
      '1/3 cup honey or maple syrup',
      '1/4 cup dark chocolate chips',
      '2 tbsp ground flaxseed',
      '1 tsp vanilla extract',
      'Pinch of salt'
    ],
    instructions: [
      'Mix all ingredients in a large bowl until well combined.',
      'Refrigerate mixture for 30 minutes to make it easier to handle.',
      'Roll mixture into 12 equal-sized balls using your hands.',
      'Store in an airtight container in the refrigerator for up to 1 week.',
      'Enjoy as a quick snack or pre-workout energy boost!'
    ],
    nutrition_info: {
      protein: 3,
      carbs: 12,
      fat: 5,
      fiber: 2
    }
  },
  {
    id: 'mock-10',
    name: 'Gluten-Free Banana Pancakes',
    description: 'Fluffy gluten-free pancakes made with ripe bananas and almond flour.',
    category: 'breakfast',
    diet_type: 'gluten-free',
    prep_time_minutes: 20,
    servings: 4,
    calories: 245,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800',
    ingredients: [
      '2 ripe bananas, mashed',
      '4 eggs',
      '1 cup almond flour',
      '1 tsp baking powder',
      '1 tsp vanilla extract',
      '1/2 tsp cinnamon',
      'Pinch of salt',
      'Coconut oil for cooking',
      'Maple syrup and berries for serving'
    ],
    instructions: [
      'In a bowl, mash bananas until smooth.',
      'Add eggs and vanilla extract, whisk well.',
      'Mix in almond flour, baking powder, cinnamon, and salt until combined.',
      'Heat coconut oil in a non-stick pan over medium heat.',
      'Pour batter to form pancakes, cook 2-3 minutes per side until golden.',
      'Serve with maple syrup and fresh berries.'
    ],
    nutrition_info: {
      protein: 10,
      carbs: 22,
      fat: 14,
      fiber: 4
    }
  },
  {
    id: 'mock-11',
    name: 'Chicken Caesar Salad Wrap',
    description: 'Portable lunch wrap with classic Caesar flavors and grilled chicken.',
    category: 'lunch',
    diet_type: 'balanced',
    prep_time_minutes: 15,
    servings: 2,
    calories: 405,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800',
    ingredients: [
      '2 large whole wheat tortillas',
      '2 grilled chicken breasts, sliced',
      '2 cups romaine lettuce, chopped',
      '1/4 cup parmesan cheese',
      '1/4 cup Caesar dressing',
      'Cherry tomatoes, halved',
      'Croutons (optional)'
    ],
    instructions: [
      'Warm tortillas slightly to make them more pliable.',
      'Spread Caesar dressing on each tortilla.',
      'Layer with lettuce, sliced chicken, parmesan, and tomatoes.',
      'Add croutons if desired for extra crunch.',
      'Roll up tightly, cut in half, and serve immediately or wrap for later.'
    ],
    nutrition_info: {
      protein: 32,
      carbs: 28,
      fat: 18,
      fiber: 4
    }
  },
  {
    id: 'mock-12',
    name: 'Dark Chocolate Avocado Mousse',
    description: 'Decadent yet healthy chocolate dessert made with avocado.',
    category: 'dessert',
    diet_type: 'vegan',
    prep_time_minutes: 10,
    servings: 4,
    calories: 195,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    ingredients: [
      '2 ripe avocados',
      '1/4 cup cocoa powder',
      '1/4 cup maple syrup',
      '1/4 cup almond milk',
      '1 tsp vanilla extract',
      'Pinch of salt',
      'Fresh berries and mint for garnish'
    ],
    instructions: [
      'Add all ingredients to a food processor or blender.',
      'Blend until completely smooth and creamy, scraping down sides as needed.',
      'Taste and adjust sweetness if desired.',
      'Divide among serving dishes and refrigerate for at least 30 minutes.',
      'Garnish with fresh berries and mint before serving.'
    ],
    nutrition_info: {
      protein: 3,
      carbs: 24,
      fat: 12,
      fiber: 7
    }
  },
  {
    id: 'mock-13',
    name: 'Turkey Meatballs with Zoodles',
    description: 'Lean turkey meatballs served over spiralized zucchini noodles.',
    category: 'dinner',
    diet_type: 'paleo',
    prep_time_minutes: 35,
    servings: 4,
    calories: 340,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
    ingredients: [
      '500g ground turkey',
      '1 egg',
      '1/4 cup almond flour',
      '2 cloves garlic, minced',
      '4 zucchini, spiralized',
      '2 cups marinara sauce',
      'Italian herbs: basil, oregano, parsley',
      'Salt, pepper, olive oil'
    ],
    instructions: [
      'Preheat oven to 375F (190C).',
      'Mix ground turkey, egg, almond flour, garlic, and herbs. Form into meatballs.',
      'Bake meatballs for 20-25 minutes until cooked through.',
      'Heat marinara sauce in a pan, add cooked meatballs.',
      'Sauté zucchini noodles in olive oil for 2-3 minutes.',
      'Serve meatballs and sauce over zoodles, garnish with fresh herbs.'
    ],
    nutrition_info: {
      protein: 35,
      carbs: 18,
      fat: 16,
      fiber: 5
    }
  },
  {
    id: 'mock-14',
    name: 'Hummus & Veggie Snack Plate',
    description: 'Colorful array of fresh vegetables with creamy homemade hummus.',
    category: 'snack',
    diet_type: 'vegan',
    prep_time_minutes: 15,
    servings: 4,
    calories: 165,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800',
    ingredients: [
      '1 can chickpeas',
      '3 tbsp tahini',
      '2 tbsp lemon juice',
      '2 cloves garlic',
      'Assorted vegetables: carrots, celery, bell peppers, cucumber',
      'Olive oil, cumin, paprika',
      'Salt to taste'
    ],
    instructions: [
      'Blend chickpeas, tahini, lemon juice, garlic, and spices until smooth.',
      'Add water gradually to reach desired consistency.',
      'Cut vegetables into sticks or bite-sized pieces.',
      'Transfer hummus to a serving bowl, drizzle with olive oil and sprinkle with paprika.',
      'Arrange vegetables around hummus and serve.'
    ],
    nutrition_info: {
      protein: 6,
      carbs: 20,
      fat: 8,
      fiber: 6
    }
  },
  {
    id: 'mock-15',
    name: 'Chia Seed Pudding',
    description: 'Overnight chia pudding packed with omega-3s and fiber.',
    category: 'breakfast',
    diet_type: 'vegan',
    prep_time_minutes: 5,
    servings: 2,
    calories: 210,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1623428454614-abaf00244e52?w=800',
    ingredients: [
      '1/4 cup chia seeds',
      '1 cup almond milk',
      '1 tbsp maple syrup',
      '1/2 tsp vanilla extract',
      'Fresh fruit for topping',
      'Coconut flakes',
      'Nuts or granola'
    ],
    instructions: [
      'Mix chia seeds, almond milk, maple syrup, and vanilla in a jar or bowl.',
      'Stir well to prevent clumping.',
      'Refrigerate for at least 4 hours or overnight, stirring once after 30 minutes.',
      'The mixture will thicken to a pudding-like consistency.',
      'Top with fresh fruit, coconut flakes, and nuts before serving.'
    ],
    nutrition_info: {
      protein: 6,
      carbs: 24,
      fat: 10,
      fiber: 11
    }
  }
];

const RecipeDatabase = ({ previewMode = false }) => {
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
    if (previewMode) {
      // Load mock data for preview mode
      setRecipes(MOCK_RECIPES);
      setFavorites(['mock-1', 'mock-5', 'mock-10']); // Some pre-selected favorites
      setLoading(false);
    } else {
      // Fetch real data from Supabase
      fetchRecipes();
      fetchFavorites();
    }
  }, [previewMode]);

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
    if (previewMode) {
      // Mock toggle for preview mode
      const isFavorite = favorites.includes(recipeId);
      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        setFavorites([...favorites, recipeId]);
      }
      toast({
        title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
        description: isFavorite ? 'Recipe removed from your favorites' : 'Recipe saved to your favorites',
      });
      return;
    }

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
