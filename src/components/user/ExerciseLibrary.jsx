import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Dumbbell, Heart, Loader2, Play, Info, Filter, Star } from 'lucide-react';
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

const ExerciseLibrary = () => {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchExercises();
    fetchFavorites();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [exercises, searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToLoadExercises') || 'Failed to load exercises',
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
        .from('user_favorite_exercises')
        .select('exercise_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map(f => f.exercise_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const filterExercises = () => {
    let filtered = [...exercises];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Muscle group filter
    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(exercise => exercise.muscle_group === selectedMuscleGroup);
    }

    // Equipment filter
    if (selectedEquipment !== 'all') {
      filtered = filtered.filter(exercise => exercise.equipment === selectedEquipment);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const toggleFavorite = async (exerciseId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const isFavorite = favorites.includes(exerciseId);

      if (isFavorite) {
        await supabase
          .from('user_favorite_exercises')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', exerciseId);
        setFavorites(favorites.filter(id => id !== exerciseId));
      } else {
        await supabase
          .from('user_favorite_exercises')
          .insert({ user_id: user.id, exercise_id: exerciseId });
        setFavorites([...favorites, exerciseId]);
      }

      toast({
        title: isFavorite ? t('removedFromFavorites') || 'Removed from favorites' : t('addedToFavorites') || 'Added to favorites',
        description: isFavorite ? t('exerciseRemovedFromFavorites') || 'Exercise removed from your favorites' : t('exerciseSavedToFavorites') || 'Exercise saved to your favorites',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToUpdateFavorites') || 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  const getDifficultyBadgeColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-300',
      intermediate: 'bg-yellow-500/20 text-yellow-300',
      advanced: 'bg-red-500/20 text-red-300',
    };
    return colors[difficulty] || 'bg-gray-500/20 text-gray-300';
  };

  const getMuscleGroupColor = (muscleGroup) => {
    const colors = {
      chest: 'bg-blue-500/20 text-blue-300',
      back: 'bg-purple-500/20 text-purple-300',
      shoulders: 'bg-orange-500/20 text-orange-300',
      arms: 'bg-pink-500/20 text-pink-300',
      legs: 'bg-green-500/20 text-green-300',
      core: 'bg-yellow-500/20 text-yellow-300',
      fullBody: 'bg-red-500/20 text-red-300',
    };
    return colors[muscleGroup] || 'bg-gray-500/20 text-gray-300';
  };

  const ExerciseCard = ({ exercise }) => {
    const isFavorite = favorites.includes(exercise.id);

    return (
      <Card className="glass-effect hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <CardContent className="p-0">
          {exercise.thumbnail_url && (
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img
                src={exercise.thumbnail_url}
                alt={exercise.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(exercise.id);
                }}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </Button>
              {exercise.video_url && (
                <div className="absolute bottom-2 left-2 bg-black/70 rounded-full p-2">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          )}
          <div className="p-4" onClick={() => setSelectedExercise(exercise)}>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold line-clamp-1">{exercise.name}</h3>
              <Badge className={`${getDifficultyBadgeColor(exercise.difficulty)} text-xs ml-2`}>
                {exercise.difficulty}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`${getMuscleGroupColor(exercise.muscle_group)} text-xs`}>
                {exercise.muscle_group}
              </Badge>
              {exercise.equipment && (
                <Badge className="bg-gray-500/20 text-gray-300 text-xs">
                  {exercise.equipment}
                </Badge>
              )}
            </div>
            <p className="text-sm text-text-secondary line-clamp-2">
              {exercise.description}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Dumbbell className="w-6 h-6 text-primary" />
          {t('exerciseLibrary') || 'Exercise Library'}
        </CardTitle>
        <p className="text-sm text-text-secondary">
          {t('exerciseLibraryDescription') || 'Browse our comprehensive exercise library with video demonstrations and detailed instructions'}
        </p>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder={t('searchExercises') || 'Search exercises...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
              <SelectTrigger>
                <SelectValue placeholder={t('allMuscleGroups') || 'All Muscle Groups'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allMuscleGroups') || 'All Muscle Groups'}</SelectItem>
                <SelectItem value="chest">{t('chest') || 'Chest'}</SelectItem>
                <SelectItem value="back">{t('back') || 'Back'}</SelectItem>
                <SelectItem value="shoulders">{t('shoulders') || 'Shoulders'}</SelectItem>
                <SelectItem value="arms">{t('arms') || 'Arms'}</SelectItem>
                <SelectItem value="legs">{t('legs') || 'Legs'}</SelectItem>
                <SelectItem value="core">{t('core') || 'Core'}</SelectItem>
                <SelectItem value="fullBody">{t('fullBody') || 'Full Body'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder={t('allEquipment') || 'All Equipment'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allEquipment') || 'All Equipment'}</SelectItem>
                <SelectItem value="bodyweight">{t('bodyweight') || 'Bodyweight'}</SelectItem>
                <SelectItem value="dumbbells">{t('dumbbells') || 'Dumbbells'}</SelectItem>
                <SelectItem value="barbell">{t('barbell') || 'Barbell'}</SelectItem>
                <SelectItem value="machine">{t('machine') || 'Machine'}</SelectItem>
                <SelectItem value="cables">{t('cables') || 'Cables'}</SelectItem>
                <SelectItem value="kettlebell">{t('kettlebell') || 'Kettlebell'}</SelectItem>
                <SelectItem value="bands">{t('bands') || 'Resistance Bands'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder={t('allDifficulties') || 'All Difficulties'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allDifficulties') || 'All Difficulties'}</SelectItem>
                <SelectItem value="beginner">{t('beginner') || 'Beginner'}</SelectItem>
                <SelectItem value="intermediate">{t('intermediate') || 'Intermediate'}</SelectItem>
                <SelectItem value="advanced">{t('advanced') || 'Advanced'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">{t('allExercises') || 'All Exercises'}</TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="w-4 h-4 mr-2" />
              {t('favorites') || 'Favorites'} ({favorites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredExercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map(exercise => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary">{t('noExercisesFound') || 'No exercises found matching your filters'}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {filteredExercises.filter(e => favorites.includes(e.id)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises
                  .filter(e => favorites.includes(e.id))
                  .map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
                <p className="text-text-secondary">{t('noFavoriteExercises') || 'No favorite exercises yet'}</p>
                <p className="text-sm text-text-secondary mt-2">
                  {t('clickHeartToAddFavorites') || 'Click the heart icon on any exercise to add it to your favorites'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Exercise Detail Dialog */}
        {selectedExercise && (
          <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center justify-between">
                  {selectedExercise.name}
                  <Badge className={getDifficultyBadgeColor(selectedExercise.difficulty)}>
                    {selectedExercise.difficulty}
                  </Badge>
                </DialogTitle>
                <DialogDescription>{selectedExercise.description}</DialogDescription>
              </DialogHeader>

              {/* Video Section */}
              {selectedExercise.video_url && (
                <div className="w-full rounded-lg overflow-hidden bg-black">
                  <video
                    controls
                    className="w-full"
                    poster={selectedExercise.thumbnail_url}
                  >
                    <source src={selectedExercise.video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {!selectedExercise.video_url && selectedExercise.thumbnail_url && (
                <img
                  src={selectedExercise.thumbnail_url}
                  alt={selectedExercise.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}

              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Badge className={getMuscleGroupColor(selectedExercise.muscle_group)}>
                    {selectedExercise.muscle_group}
                  </Badge>
                  <p className="text-xs text-text-secondary mt-2">{t('muscleGroup') || 'Muscle Group'}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm font-semibold">{selectedExercise.equipment || 'Bodyweight'}</p>
                  <p className="text-xs text-text-secondary">{t('equipment') || 'Equipment'}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Badge className={getDifficultyBadgeColor(selectedExercise.difficulty)}>
                    {selectedExercise.difficulty}
                  </Badge>
                  <p className="text-xs text-text-secondary mt-2">{t('difficulty') || 'Difficulty'}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Proper Form Instructions */}
                {selectedExercise.instructions && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      {t('properForm') || 'Proper Form & Instructions'}
                    </h3>
                    <ol className="list-decimal list-inside space-y-2">
                      {selectedExercise.instructions.map((instruction, idx) => (
                        <li key={idx} className="text-sm">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* Tips & Safety */}
                {selectedExercise.tips && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('tipsAndSafety') || 'Tips & Safety'}</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedExercise.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-text-secondary">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Target Muscles */}
                {selectedExercise.target_muscles && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{t('targetMuscles') || 'Target Muscles'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.target_muscles.map((muscle, idx) => (
                        <Badge key={idx} variant="outline">{muscle}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => toggleFavorite(selectedExercise.id)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${favorites.includes(selectedExercise.id) ? 'fill-current' : ''}`} />
                  {favorites.includes(selectedExercise.id) ? t('removeFromFavorites') || 'Remove from Favorites' : t('addToFavorites') || 'Add to Favorites'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedExercise(null)}
                >
                  {t('close') || 'Close'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseLibrary;
