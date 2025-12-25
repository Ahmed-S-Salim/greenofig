import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UtensilsCrossed, Calendar, Target, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const MyMealPlanWidget = () => {
  const { userProfile } = useAuth();
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullPlanDialog, setShowFullPlanDialog] = useState(false);

  useEffect(() => {
    if (userProfile?.id) {
      fetchMealPlan();
    }
  }, [userProfile?.id]);

  const fetchMealPlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_meal_plans')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setMealPlan(data);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!mealPlan) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" />
            My Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
          <p className="text-muted-foreground">No meal plan assigned yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your nutritionist will assign a personalized meal plan for you
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get today's meal
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dailyMeals = mealPlan.daily_meals || {};
  const todaysMeals = dailyMeals[today] || dailyMeals['day1'] || {};

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-effect hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                My Meal Plan
              </CardTitle>
              <Badge>{mealPlan.tier_name || 'Custom'}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Plan Info */}
            <div>
              <h3 className="font-semibold text-lg">{mealPlan.plan_name}</h3>
              {mealPlan.plan_description && (
                <p className="text-sm text-muted-foreground mt-1">{mealPlan.plan_description}</p>
              )}
            </div>

            {/* Nutrition Targets */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Calories</p>
                <p className="font-semibold text-sm">{mealPlan.target_calories || 0}</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Protein</p>
                <p className="font-semibold text-sm">{mealPlan.target_protein_g || 0}g</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Carbs</p>
                <p className="font-semibold text-sm">{mealPlan.target_carbs_g || 0}g</p>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <p className="text-xs text-muted-foreground">Fat</p>
                <p className="font-semibold text-sm">{mealPlan.target_fat_g || 0}g</p>
              </div>
            </div>

            {/* Today's Meals Preview */}
            {Object.keys(todaysMeals).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="w-4 h-4" />
                  Today's Meals
                </div>
                <div className="space-y-1">
                  {todaysMeals.breakfast && (
                    <div className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Breakfast:</span>
                      <span className="font-medium">{todaysMeals.breakfast.name}</span>
                    </div>
                  )}
                  {todaysMeals.lunch && (
                    <div className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Lunch:</span>
                      <span className="font-medium">{todaysMeals.lunch.name}</span>
                    </div>
                  )}
                  {todaysMeals.dinner && (
                    <div className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Dinner:</span>
                      <span className="font-medium">{todaysMeals.dinner.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              className="w-full"
              variant="outline"
              onClick={() => setShowFullPlanDialog(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Full {mealPlan.duration_days || 7}-Day Plan
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Full Plan Dialog */}
      <Dialog open={showFullPlanDialog} onOpenChange={setShowFullPlanDialog}>
        <DialogContent className="glass-effect max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" />
              {mealPlan.plan_name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="day1" className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {Array.from({ length: mealPlan.duration_days || 7 }, (_, i) => (
                <TabsTrigger key={`day${i + 1}`} value={`day${i + 1}`}>
                  Day {i + 1}
                </TabsTrigger>
              ))}
            </TabsList>

            {Array.from({ length: mealPlan.duration_days || 7 }, (_, i) => {
              const dayKey = `day${i + 1}`;
              const dayMeals = dailyMeals[dayKey] || {};

              return (
                <TabsContent key={dayKey} value={dayKey} className="space-y-4">
                  {Object.keys(dayMeals).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No meals planned for this day
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dayMeals.breakfast && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Breakfast</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium mb-2">{dayMeals.breakfast.name}</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="font-medium ml-1">{dayMeals.breakfast.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="font-medium ml-1">{dayMeals.breakfast.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="font-medium ml-1">{dayMeals.breakfast.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="font-medium ml-1">{dayMeals.breakfast.fat}g</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {dayMeals.lunch && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Lunch</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium mb-2">{dayMeals.lunch.name}</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="font-medium ml-1">{dayMeals.lunch.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="font-medium ml-1">{dayMeals.lunch.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="font-medium ml-1">{dayMeals.lunch.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="font-medium ml-1">{dayMeals.lunch.fat}g</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {dayMeals.dinner && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Dinner</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium mb-2">{dayMeals.dinner.name}</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="font-medium ml-1">{dayMeals.dinner.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="font-medium ml-1">{dayMeals.dinner.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="font-medium ml-1">{dayMeals.dinner.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="font-medium ml-1">{dayMeals.dinner.fat}g</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {dayMeals.snack1 && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Snack 1</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium mb-2">{dayMeals.snack1.name}</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="font-medium ml-1">{dayMeals.snack1.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="font-medium ml-1">{dayMeals.snack1.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="font-medium ml-1">{dayMeals.snack1.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="font-medium ml-1">{dayMeals.snack1.fat}g</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {dayMeals.snack2 && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm">Snack 2</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-medium mb-2">{dayMeals.snack2.name}</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Calories:</span>
                                <span className="font-medium ml-1">{dayMeals.snack2.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Protein:</span>
                                <span className="font-medium ml-1">{dayMeals.snack2.protein}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Carbs:</span>
                                <span className="font-medium ml-1">{dayMeals.snack2.carbs}g</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Fat:</span>
                                <span className="font-medium ml-1">{dayMeals.snack2.fat}g</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyMealPlanWidget;
