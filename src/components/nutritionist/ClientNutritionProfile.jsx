import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
  User,
  Heart,
  AlertTriangle,
  Utensils,
  Target,
  Activity,
  Scale,
  Ruler,
  Calendar,
  Save,
  Edit,
  X,
  Plus,
  Trash2,
  Apple,
  Beef,
  Fish,
  Milk,
  Wheat,
  Egg,
  Nut,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  Dumbbell
} from 'lucide-react';
import { format } from 'date-fns';

const ClientNutritionProfile = ({ clientId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [client, setClient] = useState(null);
  const [profile, setProfile] = useState({
    // Basic Info
    height_cm: '',
    current_weight_kg: '',
    target_weight_kg: '',
    date_of_birth: '',
    gender: '',
    activity_level: 'moderate',

    // Health Conditions
    health_conditions: [],
    medications: '',

    // Dietary Preferences
    diet_type: 'omnivore',
    allergies: [],
    food_intolerances: [],
    disliked_foods: [],
    favorite_foods: [],

    // Goals
    primary_goal: 'weight_loss',
    secondary_goals: [],
    target_calories: 2000,
    target_protein_g: 150,
    target_carbs_g: 200,
    target_fat_g: 65,

    // Lifestyle
    meals_per_day: 3,
    snacks_per_day: 2,
    cooking_skill: 'intermediate',
    prep_time_minutes: 30,
    budget: 'moderate',

    // Notes
    notes: '',
    special_instructions: ''
  });

  const [progressHistory, setProgressHistory] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [newIntolerance, setNewIntolerance] = useState('');
  const [newDislikedFood, setNewDislikedFood] = useState('');
  const [newFavoriteFood, setNewFavoriteFood] = useState('');

  const commonAllergies = ['Peanuts', 'Tree Nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'];
  const healthConditions = [
    'Diabetes Type 1', 'Diabetes Type 2', 'Hypertension', 'High Cholesterol',
    'Heart Disease', 'PCOS', 'Thyroid Disorder', 'IBS', 'Celiac Disease',
    'Kidney Disease', 'Liver Disease', 'Gout', 'Anemia'
  ];
  const dietTypes = [
    { value: 'omnivore', label: 'Omnivore' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'low_carb', label: 'Low Carb' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' }
  ];
  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little/no exercise)' },
    { value: 'light', label: 'Light (1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (3-5 days/week)' },
    { value: 'active', label: 'Active (6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (2x/day)' }
  ];
  const goals = [
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'weight_gain', label: 'Weight Gain' },
    { value: 'muscle_building', label: 'Muscle Building' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'improve_health', label: 'Improve Health' },
    { value: 'increase_energy', label: 'Increase Energy' },
    { value: 'better_sleep', label: 'Better Sleep' },
    { value: 'reduce_inflammation', label: 'Reduce Inflammation' }
  ];

  useEffect(() => {
    if (clientId) {
      fetchClientProfile();
      fetchProgressHistory();
    }
  }, [clientId]);

  const fetchClientProfile = async () => {
    setLoading(true);
    try {
      // Fetch client basic info
      const { data: clientData, error: clientError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Fetch nutrition profile
      const { data: profileData, error: profileError } = await supabase
        .from('client_nutrition_profiles')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (profileData) {
        setProfile(prev => ({
          ...prev,
          ...profileData,
          health_conditions: profileData.health_conditions || [],
          allergies: profileData.allergies || [],
          food_intolerances: profileData.food_intolerances || [],
          disliked_foods: profileData.disliked_foods || [],
          favorite_foods: profileData.favorite_foods || [],
          secondary_goals: profileData.secondary_goals || []
        }));
      } else {
        // Use client's basic data if no profile exists
        setProfile(prev => ({
          ...prev,
          height_cm: clientData.height_cm || '',
          current_weight_kg: clientData.weight_kg || '',
          date_of_birth: clientData.date_of_birth || '',
          gender: clientData.gender || ''
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

  const fetchProgressHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .limit(10);

      if (!error) {
        setProgressHistory(data || []);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        client_id: clientId,
        nutritionist_id: user.id,
        ...profile,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('client_nutrition_profiles')
        .upsert(profileData, { onConflict: 'client_id' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Client nutrition profile saved successfully'
      });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save profile'
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateBMI = () => {
    if (!profile.height_cm || !profile.current_weight_kg) return null;
    const heightM = profile.height_cm / 100;
    return (profile.current_weight_kg / (heightM * heightM)).toFixed(1);
  };

  const calculateBMR = () => {
    if (!profile.height_cm || !profile.current_weight_kg || !profile.date_of_birth || !profile.gender) return null;

    const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
    const weight = parseFloat(profile.current_weight_kg);
    const height = parseFloat(profile.height_cm);

    // Mifflin-St Jeor Equation
    if (profile.gender === 'male') {
      return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
    } else {
      return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (!bmr) return null;

    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    return Math.round(bmr * (multipliers[profile.activity_level] || 1.55));
  };

  const addToList = (list, value, setter, inputSetter) => {
    if (value.trim() && !profile[list].includes(value.trim())) {
      setProfile(prev => ({
        ...prev,
        [list]: [...prev[list], value.trim()]
      }));
      inputSetter('');
    }
  };

  const removeFromList = (list, value) => {
    setProfile(prev => ({
      ...prev,
      [list]: prev[list].filter(item => item !== value)
    }));
  };

  const toggleHealthCondition = (condition) => {
    setProfile(prev => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(condition)
        ? prev.health_conditions.filter(c => c !== condition)
        : [...prev.health_conditions, condition]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmr = calculateBMR();
  const tdee = calculateTDEE();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {client?.profile_picture_url ? (
              <img src={client.profile_picture_url} alt={client.full_name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{client?.full_name || 'Client'}</h2>
            <p className="text-muted-foreground">{client?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Profile
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Scale className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-xs text-muted-foreground">Current Weight</p>
            <p className="text-xl font-bold">{profile.current_weight_kg || '-'} kg</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Target className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <p className="text-xs text-muted-foreground">Target Weight</p>
            <p className="text-xl font-bold">{profile.target_weight_kg || '-'} kg</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Ruler className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-xs text-muted-foreground">Height</p>
            <p className="text-xl font-bold">{profile.height_cm || '-'} cm</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Activity className="w-5 h-5 mx-auto mb-2 text-purple-500" />
            <p className="text-xs text-muted-foreground">BMI</p>
            <p className="text-xl font-bold">{bmi || '-'}</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Heart className="w-5 h-5 mx-auto mb-2 text-red-500" />
            <p className="text-xs text-muted-foreground">BMR</p>
            <p className="text-xl font-bold">{bmr || '-'}</p>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="p-4 text-center">
            <Dumbbell className="w-5 h-5 mx-auto mb-2 text-orange-500" />
            <p className="text-xs text-muted-foreground">TDEE</p>
            <p className="text-xl font-bold">{tdee || '-'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="dietary">Dietary</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basics" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  value={profile.height_cm}
                  onChange={(e) => setProfile(prev => ({ ...prev, height_cm: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Current Weight (kg)</Label>
                <Input
                  type="number"
                  value={profile.current_weight_kg}
                  onChange={(e) => setProfile(prev => ({ ...prev, current_weight_kg: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Target Weight (kg)</Label>
                <Input
                  type="number"
                  value={profile.target_weight_kg}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_weight_kg: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={profile.date_of_birth}
                  onChange={(e) => setProfile(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Gender</Label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                  disabled={!editMode}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Activity Level</Label>
                <select
                  value={profile.activity_level}
                  onChange={(e) => setProfile(prev => ({ ...prev, activity_level: e.target.value }))}
                  disabled={!editMode}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {activityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Lifestyle Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Meals per Day</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={profile.meals_per_day}
                  onChange={(e) => setProfile(prev => ({ ...prev, meals_per_day: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Snacks per Day</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={profile.snacks_per_day}
                  onChange={(e) => setProfile(prev => ({ ...prev, snacks_per_day: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Max Prep Time (minutes)</Label>
                <Input
                  type="number"
                  value={profile.prep_time_minutes}
                  onChange={(e) => setProfile(prev => ({ ...prev, prep_time_minutes: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Cooking Skill</Label>
                <select
                  value={profile.cooking_skill}
                  onChange={(e) => setProfile(prev => ({ ...prev, cooking_skill: e.target.value }))}
                  disabled={!editMode}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <Label>Budget</Label>
                <select
                  value={profile.budget}
                  onChange={(e) => setProfile(prev => ({ ...prev, budget: e.target.value }))}
                  disabled={!editMode}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="low">Budget-Friendly</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">No Limit</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dietary Preferences Tab */}
        <TabsContent value="dietary" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" />
                Diet Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {dietTypes.map(diet => (
                  <Button
                    key={diet.value}
                    variant={profile.diet_type === diet.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editMode && setProfile(prev => ({ ...prev, diet_type: diet.value }))}
                    disabled={!editMode}
                    className="w-full"
                  >
                    {diet.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" />
                Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {commonAllergies.map(allergy => (
                  <Badge
                    key={allergy}
                    variant={profile.allergies.includes(allergy) ? 'destructive' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => editMode && (profile.allergies.includes(allergy)
                      ? removeFromList('allergies', allergy)
                      : setProfile(prev => ({ ...prev, allergies: [...prev.allergies, allergy] })))}
                  >
                    {allergy}
                  </Badge>
                ))}
              </div>
              {editMode && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom allergy..."
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addToList('allergies', newAllergy, setProfile, setNewAllergy)}
                  />
                  <Button size="sm" onClick={() => addToList('allergies', newAllergy, setProfile, setNewAllergy)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {profile.allergies.filter(a => !commonAllergies.includes(a)).map(allergy => (
                  <Badge key={allergy} variant="destructive" className="flex items-center gap-1">
                    {allergy}
                    {editMode && (
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('allergies', allergy)} />
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-sm">Disliked Foods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {profile.disliked_foods.map(food => (
                    <Badge key={food} variant="secondary" className="flex items-center gap-1">
                      {food}
                      {editMode && (
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('disliked_foods', food)} />
                      )}
                    </Badge>
                  ))}
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add disliked food..."
                      value={newDislikedFood}
                      onChange={(e) => setNewDislikedFood(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('disliked_foods', newDislikedFood, setProfile, setNewDislikedFood)}
                    />
                    <Button size="sm" variant="outline" onClick={() => addToList('disliked_foods', newDislikedFood, setProfile, setNewDislikedFood)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-sm">Favorite Foods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_foods.map(food => (
                    <Badge key={food} variant="default" className="flex items-center gap-1 bg-green-500">
                      {food}
                      {editMode && (
                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromList('favorite_foods', food)} />
                      )}
                    </Badge>
                  ))}
                </div>
                {editMode && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add favorite food..."
                      value={newFavoriteFood}
                      onChange={(e) => setNewFavoriteFood(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addToList('favorite_foods', newFavoriteFood, setProfile, setNewFavoriteFood)}
                    />
                    <Button size="sm" variant="outline" onClick={() => addToList('favorite_foods', newFavoriteFood, setProfile, setNewFavoriteFood)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Health Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {healthConditions.map(condition => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition}
                      checked={profile.health_conditions.includes(condition)}
                      onCheckedChange={() => editMode && toggleHealthCondition(condition)}
                      disabled={!editMode}
                    />
                    <label htmlFor={condition} className="text-sm cursor-pointer">
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Medications & Supplements</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="List any medications or supplements the client is taking..."
                value={profile.medications}
                onChange={(e) => setProfile(prev => ({ ...prev, medications: e.target.value }))}
                disabled={!editMode}
                rows={4}
              />
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special dietary instructions or restrictions..."
                value={profile.special_instructions}
                onChange={(e) => setProfile(prev => ({ ...prev, special_instructions: e.target.value }))}
                disabled={!editMode}
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Primary Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {goals.map(goal => (
                  <Button
                    key={goal.value}
                    variant={profile.primary_goal === goal.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => editMode && setProfile(prev => ({ ...prev, primary_goal: goal.value }))}
                    disabled={!editMode}
                    className="w-full"
                  >
                    {goal.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Daily Macro Targets</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Calories</Label>
                <Input
                  type="number"
                  value={profile.target_calories}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_calories: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Protein (g)</Label>
                <Input
                  type="number"
                  value={profile.target_protein_g}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_protein_g: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Carbs (g)</Label>
                <Input
                  type="number"
                  value={profile.target_carbs_g}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_carbs_g: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
              <div>
                <Label>Fat (g)</Label>
                <Input
                  type="number"
                  value={profile.target_fat_g}
                  onChange={(e) => setProfile(prev => ({ ...prev, target_fat_g: parseInt(e.target.value) }))}
                  disabled={!editMode}
                />
              </div>
            </CardContent>
          </Card>

          {tdee && (
            <Card className="glass-effect bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-2">Recommended based on TDEE ({tdee} cal):</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Weight Loss</p>
                    <p className="font-bold text-red-500">{tdee - 500} cal</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maintenance</p>
                    <p className="font-bold text-green-500">{tdee} cal</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight Gain</p>
                    <p className="font-bold text-blue-500">{tdee + 500} cal</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Additional notes about the client's goals and preferences..."
                value={profile.notes}
                onChange={(e) => setProfile(prev => ({ ...prev, notes: e.target.value }))}
                disabled={!editMode}
                rows={4}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Weight Progress History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressHistory.length > 0 ? (
                <div className="space-y-2">
                  {progressHistory.map((entry, index) => {
                    const prevEntry = progressHistory[index + 1];
                    const change = prevEntry ? (entry.weight_kg - prevEntry.weight_kg).toFixed(1) : null;
                    const isLoss = change && parseFloat(change) < 0;

                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{format(new Date(entry.date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">{entry.weight_kg} kg</span>
                          {change && (
                            <Badge variant={isLoss ? 'default' : 'destructive'} className={isLoss ? 'bg-green-500' : ''}>
                              {isLoss ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
                              {Math.abs(change)} kg
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No progress data recorded yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientNutritionProfile;
