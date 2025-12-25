import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  ShoppingCart,
  Download,
  Printer,
  Send,
  Check,
  Plus,
  Trash2,
  Search,
  Apple,
  Beef,
  Milk,
  Wheat,
  Carrot,
  Fish,
  Egg,
  Coffee,
  Package,
  Loader2
} from 'lucide-react';

const GroceryListGenerator = ({ mealPlanId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [customItem, setCustomItem] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = {
    produce: { label: 'Fruits & Vegetables', icon: Apple, color: 'text-green-500' },
    protein: { label: 'Meat & Protein', icon: Beef, color: 'text-red-500' },
    dairy: { label: 'Dairy & Eggs', icon: Milk, color: 'text-blue-500' },
    grains: { label: 'Grains & Bread', icon: Wheat, color: 'text-amber-500' },
    seafood: { label: 'Seafood', icon: Fish, color: 'text-cyan-500' },
    pantry: { label: 'Pantry Items', icon: Package, color: 'text-purple-500' },
    beverages: { label: 'Beverages', icon: Coffee, color: 'text-brown-500' },
    other: { label: 'Other', icon: ShoppingCart, color: 'text-gray-500' }
  };

  // Ingredient categorization database
  const ingredientCategories = {
    // Produce
    'apple': 'produce', 'banana': 'produce', 'berries': 'produce', 'mixed berries': 'produce',
    'spinach': 'produce', 'kale': 'produce', 'lettuce': 'produce', 'romaine': 'produce',
    'tomatoes': 'produce', 'cherry tomatoes': 'produce', 'cucumber': 'produce',
    'avocado': 'produce', 'broccoli': 'produce', 'bell peppers': 'produce',
    'carrots': 'produce', 'celery': 'produce', 'onion': 'produce', 'garlic': 'produce',
    'lemon': 'produce', 'lime': 'produce', 'orange': 'produce', 'pineapple': 'produce',
    'asparagus': 'produce', 'zucchini': 'produce', 'mushrooms': 'produce',
    'sweet potato': 'produce', 'potatoes': 'produce', 'green beans': 'produce',
    'mixed greens': 'produce', 'mixed vegetables': 'produce', 'roasted vegetables': 'produce',
    'edamame': 'produce',

    // Protein
    'chicken breast': 'protein', 'chicken': 'protein', 'chicken thighs': 'protein',
    'grilled chicken': 'protein', 'turkey': 'protein', 'turkey breast': 'protein',
    'ground turkey': 'protein', 'lean beef': 'protein', 'beef': 'protein',
    'pork': 'protein', 'lamb': 'protein', 'bacon': 'protein',
    'tofu': 'protein', 'tempeh': 'protein', 'seitan': 'protein',

    // Seafood
    'salmon': 'seafood', 'salmon fillet': 'seafood', 'smoked salmon': 'seafood',
    'tuna': 'seafood', 'ahi tuna': 'seafood', 'shrimp': 'seafood',
    'fish': 'seafood', 'cod': 'seafood', 'tilapia': 'seafood',

    // Dairy
    'eggs': 'dairy', 'egg': 'dairy', 'egg whites': 'dairy',
    'milk': 'dairy', 'almond milk': 'dairy', 'oat milk': 'dairy',
    'greek yogurt': 'dairy', 'yogurt': 'dairy', 'cottage cheese': 'dairy',
    'cheese': 'dairy', 'feta cheese': 'dairy', 'feta': 'dairy',
    'parmesan': 'dairy', 'cream cheese': 'dairy', 'butter': 'dairy',

    // Grains
    'oats': 'grains', 'quinoa': 'grains', 'rice': 'grains', 'brown rice': 'grains',
    'sushi rice': 'grains', 'basmati rice': 'grains', 'farro': 'grains',
    'bread': 'grains', 'whole grain bread': 'grains', 'whole wheat bread': 'grains',
    'whole wheat bagel': 'grains', 'whole wheat wrap': 'grains',
    'tortillas': 'grains', 'corn tortillas': 'grains', 'pasta': 'grains',
    'granola': 'grains', 'rice cakes': 'grains',

    // Pantry
    'olive oil': 'pantry', 'coconut oil': 'pantry', 'sesame oil': 'pantry',
    'honey': 'pantry', 'maple syrup': 'pantry', 'nut butter': 'pantry',
    'almond butter': 'pantry', 'peanut butter': 'pantry',
    'hummus': 'pantry', 'tahini': 'pantry', 'salsa': 'pantry',
    'marinara sauce': 'pantry', 'soy sauce': 'pantry',
    'chickpeas': 'pantry', 'black beans': 'pantry', 'lentils': 'pantry',
    'chia seeds': 'pantry', 'nuts': 'pantry', 'almonds': 'pantry',
    'walnuts': 'pantry', 'cashews': 'pantry', 'capers': 'pantry',
    'olives': 'pantry', 'protein powder': 'pantry', 'seaweed': 'pantry',
    'rosemary': 'pantry', 'sea salt': 'pantry',
    'caesar dressing': 'pantry', 'sesame dressing': 'pantry',
    'coconut milk': 'pantry',

    // Beverages
    'coffee': 'beverages', 'tea': 'beverages', 'water': 'beverages'
  };

  useEffect(() => {
    if (mealPlanId) {
      fetchMealPlan();
    }
  }, [mealPlanId]);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans_v2')
        .select(`
          *,
          client:user_profiles!meal_plans_v2_client_id_fkey(full_name, email)
        `)
        .eq('id', mealPlanId)
        .single();

      if (error) throw error;

      setMealPlan(data);
      generateGroceryList(data);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load meal plan'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = (plan) => {
    const ingredientMap = new Map();

    // Extract all ingredients from meal schedule
    if (plan.meal_schedule) {
      Object.values(plan.meal_schedule).forEach(day => {
        Object.values(day).forEach(meal => {
          if (meal && meal.ingredients) {
            meal.ingredients.forEach(ingredient => {
              const normalized = ingredient.toLowerCase().trim();
              if (ingredientMap.has(normalized)) {
                ingredientMap.set(normalized, {
                  ...ingredientMap.get(normalized),
                  count: ingredientMap.get(normalized).count + 1
                });
              } else {
                const category = categorizeIngredient(normalized);
                ingredientMap.set(normalized, {
                  id: crypto.randomUUID(),
                  name: ingredient,
                  category,
                  count: 1,
                  checked: false
                });
              }
            });
          }
        });
      });
    }

    // Convert to array and sort by category
    const list = Array.from(ingredientMap.values()).sort((a, b) => {
      if (a.category === b.category) return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });

    setGroceryList(list);
  };

  const categorizeIngredient = (ingredient) => {
    const lower = ingredient.toLowerCase();

    // Check exact matches first
    if (ingredientCategories[lower]) {
      return ingredientCategories[lower];
    }

    // Check partial matches
    for (const [key, category] of Object.entries(ingredientCategories)) {
      if (lower.includes(key) || key.includes(lower)) {
        return category;
      }
    }

    return 'other';
  };

  const toggleItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const addCustomItem = () => {
    if (!customItem.trim()) return;

    const newItem = {
      id: crypto.randomUUID(),
      name: customItem.trim(),
      category: 'other',
      count: 1,
      isCustom: true
    };

    setGroceryList(prev => [...prev, newItem]);
    setCustomItem('');
    toast({ title: 'Item added' });
  };

  const removeItem = (itemId) => {
    setGroceryList(prev => prev.filter(item => item.id !== itemId));
  };

  const filteredList = groceryList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedList = filteredList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const exportList = (format) => {
    let content = '';

    if (format === 'text') {
      content = `Grocery List for ${mealPlan?.client?.full_name || 'Client'}\n`;
      content += `${mealPlan?.name || 'Meal Plan'}\n`;
      content += `Generated: ${new Date().toLocaleDateString()}\n\n`;

      Object.entries(groupedList).forEach(([category, items]) => {
        content += `\n--- ${categories[category]?.label || category} ---\n`;
        items.forEach(item => {
          const checked = checkedItems[item.id] ? '[x]' : '[ ]';
          content += `${checked} ${item.name}${item.count > 1 ? ` (x${item.count})` : ''}\n`;
        });
      });

      // Create download
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grocery-list-${mealPlan?.client?.full_name || 'client'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    toast({ title: 'Grocery list exported!' });
  };

  const printList = () => {
    const printContent = document.getElementById('grocery-list-content');
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>Grocery List - ${mealPlan?.client?.full_name || 'Client'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 5px; }
            h2 { font-size: 18px; color: #666; margin-bottom: 20px; }
            h3 { font-size: 16px; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #eee; }
            .checkbox { width: 18px; height: 18px; border: 2px solid #333; display: inline-block; margin-right: 10px; vertical-align: middle; }
            .count { color: #888; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Grocery List</h1>
          <h2>${mealPlan?.name || 'Meal Plan'} - ${mealPlan?.client?.full_name || 'Client'}</h2>
          ${Object.entries(groupedList).map(([category, items]) => `
            <h3>${categories[category]?.label || category}</h3>
            <ul>
              ${items.map(item => `
                <li>
                  <span class="checkbox"></span>
                  ${item.name}
                  ${item.count > 1 ? `<span class="count">(x${item.count})</span>` : ''}
                </li>
              `).join('')}
            </ul>
          `).join('')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const sendToClient = async () => {
    if (!mealPlan?.client_id) return;

    try {
      let listText = `Here's your grocery list for the meal plan:\n\n`;

      Object.entries(groupedList).forEach(([category, items]) => {
        listText += `**${categories[category]?.label || category}**\n`;
        items.forEach(item => {
          listText += `• ${item.name}${item.count > 1 ? ` (x${item.count})` : ''}\n`;
        });
        listText += '\n';
      });

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: mealPlan.client_id,
          body: listText,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Sent!',
        description: 'Grocery list sent to client'
      });
    } catch (error) {
      console.error('Error sending grocery list:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send grocery list'
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Grocery List Generator
          </DialogTitle>
          {mealPlan && (
            <p className="text-sm text-muted-foreground">
              {mealPlan.name} - {mealPlan.client?.full_name}
            </p>
          )}
        </DialogHeader>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Categories</option>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Add Custom Item */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add custom item..."
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
          />
          <Button onClick={addCustomItem} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <Badge variant="outline">
            {groceryList.length} items total
          </Badge>
          <Badge variant="outline" className="text-green-600">
            {Object.values(checkedItems).filter(Boolean).length} checked
          </Badge>
          <Badge variant="outline" className="text-orange-600">
            {groceryList.length - Object.values(checkedItems).filter(Boolean).length} remaining
          </Badge>
        </div>

        {/* Grocery List */}
        <div id="grocery-list-content" className="flex-1 overflow-y-auto space-y-4">
          {Object.entries(groupedList).map(([category, items]) => {
            const CategoryIcon = categories[category]?.icon || ShoppingCart;
            return (
              <Card key={category}>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CategoryIcon className={`w-4 h-4 ${categories[category]?.color || ''}`} />
                    {categories[category]?.label || category}
                    <Badge variant="secondary" className="ml-auto">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3">
                  <div className="space-y-1">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-2 rounded hover:bg-muted/50 ${
                          checkedItems[item.id] ? 'opacity-50' : ''
                        }`}
                      >
                        <Checkbox
                          checked={checkedItems[item.id] || false}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <span className={`flex-1 ${checkedItems[item.id] ? 'line-through' : ''}`}>
                          {item.name}
                        </span>
                        {item.count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            x{item.count}
                          </Badge>
                        )}
                        {item.isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {Object.keys(groupedList).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No items found</p>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex-wrap gap-2">
          <Button variant="outline" onClick={() => exportList('text')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={printList}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={sendToClient}>
            <Send className="w-4 h-4 mr-2" />
            Send to Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroceryListGenerator;
