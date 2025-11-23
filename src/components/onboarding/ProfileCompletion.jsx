import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  Target,
  Heart,
  Activity,
  MapPin,
  Phone,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PROFILE_FIELDS = [
  {
    id: 'full_name',
    label: 'Full Name',
    icon: User,
    category: 'basic',
    required: true,
    points: 25,
    tip: 'Help us personalize your experience'
  },
  {
    id: 'email',
    label: 'Email Address',
    icon: Mail,
    category: 'basic',
    required: true,
    points: 0, // Already set during signup
    tip: 'For account security and notifications'
  },
  {
    id: 'date_of_birth',
    label: 'Date of Birth',
    icon: Calendar,
    category: 'basic',
    required: true,
    points: 25,
    tip: 'Helps us calculate accurate calorie needs'
  },
  {
    id: 'gender',
    label: 'Gender',
    icon: User,
    category: 'basic',
    required: true,
    points: 25,
    tip: 'Affects metabolism calculations'
  },
  {
    id: 'height',
    label: 'Height',
    icon: Ruler,
    category: 'physical',
    required: true,
    points: 50,
    tip: 'Essential for BMI and calorie calculations'
  },
  {
    id: 'weight',
    label: 'Current Weight',
    icon: Weight,
    category: 'physical',
    required: true,
    points: 50,
    tip: 'Track your progress over time'
  },
  {
    id: 'goal_weight',
    label: 'Goal Weight',
    icon: Target,
    category: 'physical',
    required: true,
    points: 50,
    tip: 'What weight are you aiming for?'
  },
  {
    id: 'activity_level',
    label: 'Activity Level',
    icon: Activity,
    category: 'lifestyle',
    required: true,
    points: 50,
    tip: 'How active are you daily?'
  },
  {
    id: 'dietary_preferences',
    label: 'Dietary Preferences',
    icon: Heart,
    category: 'lifestyle',
    required: false,
    points: 25,
    tip: 'Vegetarian, vegan, keto, etc.'
  },
  {
    id: 'allergies',
    label: 'Food Allergies',
    icon: AlertCircle,
    category: 'health',
    required: false,
    points: 25,
    tip: 'Important for safe meal recommendations'
  },
  {
    id: 'medical_conditions',
    label: 'Medical Conditions',
    icon: Heart,
    category: 'health',
    required: false,
    points: 25,
    tip: 'Diabetes, high blood pressure, etc.'
  },
  {
    id: 'phone',
    label: 'Phone Number',
    icon: Phone,
    category: 'contact',
    required: false,
    points: 25,
    tip: 'For SMS reminders (optional)'
  },
  {
    id: 'location',
    label: 'Location',
    icon: MapPin,
    category: 'contact',
    required: false,
    points: 25,
    tip: 'To find nutritionists near you'
  }
];

const CATEGORIES = [
  { id: 'basic', name: 'Basic Info', icon: User, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { id: 'physical', name: 'Physical Stats', icon: Ruler, color: 'text-green-600', bgColor: 'bg-green-50' },
  { id: 'lifestyle', name: 'Lifestyle', icon: Activity, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'health', name: 'Health Info', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50' },
  { id: 'contact', name: 'Contact Details', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-50' }
];

const ProfileCompletion = ({ userId, compact = false }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFieldComplete = (fieldId) => {
    if (!profile) return false;

    const value = profile[fieldId];

    if (fieldId === 'dietary_preferences' || fieldId === 'allergies' || fieldId === 'medical_conditions') {
      return value && Array.isArray(value) && value.length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  };

  const completedFields = PROFILE_FIELDS.filter(field => isFieldComplete(field.id));
  const requiredFields = PROFILE_FIELDS.filter(field => field.required);
  const completedRequired = requiredFields.filter(field => isFieldComplete(field.id));

  const totalProgress = (completedFields.length / PROFILE_FIELDS.length) * 100;
  const requiredProgress = (completedRequired.length / requiredFields.length) * 100;
  const earnedPoints = completedFields.reduce((sum, field) => sum + field.points, 0);
  const totalPoints = PROFILE_FIELDS.reduce((sum, field) => sum + field.points, 0);

  const getCategoryProgress = (categoryId) => {
    const categoryFields = PROFILE_FIELDS.filter(f => f.category === categoryId);
    const completedInCategory = categoryFields.filter(f => isFieldComplete(f.id));
    return {
      completed: completedInCategory.length,
      total: categoryFields.length,
      percentage: (completedInCategory.length / categoryFields.length) * 100
    };
  };

  if (loading) {
    return (
      <Card className={compact ? '' : 'shadow-lg'}>
        <CardContent className="p-6 text-center">
          <Sparkles className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
          <p className="text-gray-600">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = '/app/profile'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${requiredProgress === 100 ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
                {requiredProgress === 100 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Profile Setup</CardTitle>
                <p className="text-sm text-gray-600">
                  {Math.round(totalProgress)}% complete
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={totalProgress} className="h-2 mb-3" />
          {requiredProgress < 100 && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{requiredFields.length - completedRequired.length} required fields remaining</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full ${requiredProgress === 100 ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
                {requiredProgress === 100 ? (
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                ) : (
                  <User className="w-7 h-7 text-blue-600" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">Profile Completion</CardTitle>
                <p className="text-gray-600">
                  {requiredProgress === 100 ? 'All required fields complete!' : 'Complete your profile to unlock features'}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                <Award className="w-4 h-4 mr-1" />
                {earnedPoints}/{totalPoints} XP
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-gray-900">{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Required Fields</span>
              <span className="text-sm font-bold text-gray-900">
                {completedRequired.length}/{requiredFields.length}
              </span>
            </div>
            <Progress value={requiredProgress} className="h-2" />
          </div>

          {requiredProgress < 100 && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">
                Complete {requiredFields.length - completedRequired.length} more required field{requiredFields.length - completedRequired.length !== 1 ? 's' : ''} to unlock all features
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="space-y-4">
        {CATEGORIES.map((category, index) => {
          const CategoryIcon = category.icon;
          const progress = getCategoryProgress(category.id);
          const fields = PROFILE_FIELDS.filter(f => f.category === category.id);
          const isExpanded = expandedCategory === category.id;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`transition-all cursor-pointer ${
                  progress.percentage === 100
                    ? 'border-2 border-green-300 bg-green-50'
                    : 'border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${progress.percentage === 100 ? 'bg-green-100' : category.bgColor} flex items-center justify-center`}>
                        {progress.percentage === 100 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">
                          {progress.completed}/{progress.total} completed
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                    </motion.div>
                  </div>

                  <Progress value={progress.percentage} className="h-2 mb-3" />

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 pt-3 border-t"
                      >
                        {fields.map(field => {
                          const FieldIcon = field.icon;
                          const isComplete = isFieldComplete(field.id);

                          return (
                            <div
                              key={field.id}
                              className={`p-3 rounded-lg flex items-center justify-between ${
                                isComplete ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <FieldIcon className={`w-4 h-4 ${isComplete ? 'text-green-600' : 'text-gray-400'}`} />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isComplete ? 'text-green-900' : 'text-gray-700'}`}>
                                      {field.label}
                                    </span>
                                    {field.required && !isComplete && (
                                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600">{field.tip}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {field.points > 0 && (
                                  <Badge variant="outline" className={isComplete ? 'bg-green-50 text-green-700' : 'bg-gray-100'}>
                                    +{field.points} XP
                                  </Badge>
                                )}
                                {isComplete ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Action Button */}
      {requiredProgress < 100 && (
        <Card className="shadow-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg mb-1">Complete Your Profile</h3>
                <p className="text-blue-100">
                  Fill in the remaining fields to unlock all features and earn {totalPoints - earnedPoints} XP
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/app/profile'}
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg flex-shrink-0"
              >
                Go to Profile
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Badge */}
      {requiredProgress === 100 && (
        <Card className="shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-xl mb-2">Profile Complete! 🎉</h3>
            <p className="text-green-100 mb-4">
              Great job! You've completed all required fields. Keep going to earn bonus XP!
            </p>
            <Badge className="bg-white text-green-600 px-4 py-2">
              <Award className="w-4 h-4 mr-1" />
              +{earnedPoints} XP Earned
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileCompletion;
