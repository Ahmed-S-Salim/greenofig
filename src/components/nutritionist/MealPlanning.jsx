import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  Plus,
  UtensilsCrossed,
  Calendar,
  Save,
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  Target,
  Users as UsersIcon,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RecipeDatabase from './RecipeDatabase';
import { format } from 'date-fns';

const MealPlanning = () => {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const [planForm, setPlanForm] = useState({
    client_id: '',
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    target_calories: 2000,
    target_protein_g: 150,
    target_carbs_g: 200,
    target_fat_g: 60,
    meal_schedule: {},
    notes: '',
    status: 'active',
  });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  useEffect(() => {
    fetchMealPlans();
    fetchClients();
  }, [user]);

  useEffect(() => {
    filterPlans();
  }, [searchTerm, statusFilter, mealPlans]);

  const fetchMealPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_plans_v2')
        .select(`
          *,
          client:user_profiles!meal_plans_v2_client_id_fkey(id, full_name, email)
        `)
        .eq('nutritionist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch meal plans',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'user')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const filterPlans = () => {
    let filtered = mealPlans;

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    setFilteredPlans(filtered);
  };

  const handleOpenDialog = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        client_id: plan.client_id,
        name: plan.name,
        description: plan.description || '',
        start_date: plan.start_date,
        end_date: plan.end_date,
        target_calories: plan.target_calories || 2000,
        target_protein_g: plan.target_protein_g || 150,
        target_carbs_g: plan.target_carbs_g || 200,
        target_fat_g: plan.target_fat_g || 60,
        meal_schedule: plan.meal_schedule || {},
        notes: plan.notes || '',
        status: plan.status,
      });
    } else {
      setEditingPlan(null);
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setPlanForm({
        client_id: '',
        name: '',
        description: '',
        start_date: today,
        end_date: nextWeek,
        target_calories: 2000,
        target_protein_g: 150,
        target_carbs_g: 200,
        target_fat_g: 60,
        meal_schedule: {},
        notes: '',
        status: 'active',
      });
    }
    setDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!planForm.client_id || !planForm.name || !planForm.start_date || !planForm.end_date) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    setSaving(true);
    try {
      const planData = {
        ...planForm,
        nutritionist_id: user.id,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('meal_plans_v2')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast({ title: 'Meal plan updated successfully' });
      } else {
        const { error } = await supabase
          .from('meal_plans_v2')
          .insert(planData);

        if (error) throw error;
        toast({ title: 'Meal plan created successfully' });
      }

      setDialogOpen(false);
      fetchMealPlans();
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save meal plan',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this meal plan?')) return;

    try {
      const { error } = await supabase
        .from('meal_plans_v2')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      toast({ title: 'Meal plan deleted successfully' });
      fetchMealPlans();
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete meal plan',
      });
    }
  };

  const handleSelectRecipe = (recipe) => {
    if (selectedDay && selectedMeal) {
      const newSchedule = { ...planForm.meal_schedule };
      if (!newSchedule[selectedDay]) {
        newSchedule[selectedDay] = {};
      }
      newSchedule[selectedDay][selectedMeal] = recipe.id;
      setPlanForm({ ...planForm, meal_schedule: newSchedule });
      setShowRecipeSelector(false);
      setSelectedDay(null);
      setSelectedMeal(null);
      toast({ title: 'Recipe added to meal plan' });
    }
  };

  const openRecipeSelector = (day, meal) => {
    setSelectedDay(day);
    setSelectedMeal(meal);
    setShowRecipeSelector(true);
  };

  const MealPlanCard = ({ plan }) => {
    const client = plan.client;
    const duration = Math.ceil((new Date(plan.end_date) - new Date(plan.start_date)) / (1000 * 60 * 60 * 24));

    return (
      <Card className="glass-effect hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <UsersIcon className="w-3 h-3" />
                {client?.full_name || 'Unknown Client'}
              </p>
            </div>
            <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Duration:
              </span>
              <span className="font-medium">{duration} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="w-4 h-4" />
                Daily Calories:
              </span>
              <span className="font-medium">{plan.target_calories || 0} kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="font-semibold">{plan.target_protein_g || 0}g</p>
              <p className="text-muted-foreground">Protein</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="font-semibold">{plan.target_carbs_g || 0}g</p>
              <p className="text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <p className="font-semibold">{plan.target_fat_g || 0}g</p>
              <p className="text-muted-foreground">Fat</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(plan)} className="flex-1">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
            <UtensilsCrossed className="w-8 h-8 text-primary" />
            Meal Planning
          </h2>
          <p className="text-muted-foreground mt-1">Create and manage personalized meal plans</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          New Meal Plan
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search meal plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
                size="sm"
              >
                All ({mealPlans.length})
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('active')}
                size="sm"
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('completed')}
                size="sm"
              >
                Completed
              </Button>
              <Button
                variant={statusFilter === 'archived' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('archived')}
                size="sm"
              >
                Archived
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Plans Grid */}
      {filteredPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <MealPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <Card className="glass-effect">
          <CardContent className="p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No meal plans found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first meal plan to get started'}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Meal Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Meal Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-effect custom-scrollbar max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Meal Plan' : 'Create New Meal Plan'}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="schedule">Meal Schedule</TabsTrigger>
              <TabsTrigger value="targets">Nutrition Targets</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Client *</label>
                  <select
                    value={planForm.client_id}
                    onChange={(e) => setPlanForm({ ...planForm, client_id: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Plan Name *</label>
                  <Input
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="e.g., Weight Loss Plan - Week 1"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    placeholder="Brief description of the meal plan goals and approach"
                    rows={3}
                  />
                </div>

                <div className="min-w-0">
                  <label className="text-sm font-medium mb-2 block">Start Date *</label>
                  <Input
                    type="date"
                    value={planForm.start_date}
                    onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })}
                    className="w-full min-w-0"
                  />
                </div>

                <div className="min-w-0">
                  <label className="text-sm font-medium mb-2 block">End Date *</label>
                  <Input
                    type="date"
                    value={planForm.end_date}
                    onChange={(e) => setPlanForm({ ...planForm, end_date: e.target.value })}
                    className="w-full min-w-0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea
                    value={planForm.notes}
                    onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                    placeholder="Additional notes, instructions, or guidelines"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={planForm.status}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </TabsContent>

            {/* Meal Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Click on a meal slot to assign a recipe from your database
              </div>
              <div className="space-y-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="border border-border rounded-lg p-4">
                    <h4 className="font-semibold capitalize mb-3">{day}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {mealTypes.map(meal => (
                        <Button
                          key={meal}
                          variant="outline"
                          size="sm"
                          onClick={() => openRecipeSelector(day, meal)}
                          className="h-auto py-3 flex flex-col items-start"
                        >
                          <span className="text-xs text-muted-foreground capitalize">{meal}</span>
                          <span className="text-xs mt-1">
                            {planForm.meal_schedule?.[day]?.[meal] ? '✓ Assigned' : '+ Add Recipe'}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Nutrition Targets Tab */}
            <TabsContent value="targets" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Daily Calories Target</label>
                  <Input
                    type="number"
                    value={planForm.target_calories}
                    onChange={(e) => setPlanForm({ ...planForm, target_calories: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Protein Target (g)</label>
                  <Input
                    type="number"
                    value={planForm.target_protein_g}
                    onChange={(e) => setPlanForm({ ...planForm, target_protein_g: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Carbs Target (g)</label>
                  <Input
                    type="number"
                    value={planForm.target_carbs_g}
                    onChange={(e) => setPlanForm({ ...planForm, target_carbs_g: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fat Target (g)</label>
                  <Input
                    type="number"
                    value={planForm.target_fat_g}
                    onChange={(e) => setPlanForm({ ...planForm, target_fat_g: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Macro Distribution</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Protein</p>
                    <p className="font-semibold">
                      {((planForm.target_protein_g * 4) / planForm.target_calories * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Carbs</p>
                    <p className="font-semibold">
                      {((planForm.target_carbs_g * 4) / planForm.target_calories * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fat</p>
                    <p className="font-semibold">
                      {((planForm.target_fat_g * 9) / planForm.target_calories * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Meal Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Selector Dialog */}
      <Dialog open={showRecipeSelector} onOpenChange={setShowRecipeSelector}>
        <DialogContent className="glass-effect custom-scrollbar max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select Recipe for {selectedDay && selectedMeal && (
                <span className="capitalize">{selectedDay} - {selectedMeal}</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <RecipeDatabase onSelectRecipe={handleSelectRecipe} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanning;
