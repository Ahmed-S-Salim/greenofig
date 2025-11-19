
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Scale, Dumbbell, HeartPulse, Zap, X } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

const OnboardingSurvey = ({ logoUrl, isOpen, setIsOpen, inline = false }) => {
  const { t } = useTranslation();
  const { user, userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unitSystem, setUnitSystem] = useState('metric'); // 'metric' or 'imperial'

  const [formData, setFormData] = useState({
    age: userProfile?.age || '',
    gender: userProfile?.gender || '',
    height_cm: userProfile?.height_cm || '',
    weight_kg: userProfile?.weight_kg || '',
    activity_level: userProfile?.activity_level || '',
    health_goals: userProfile?.health_goals || [],
  });

  // Update form data when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFormData({
        age: userProfile.age || '',
        gender: userProfile.gender || '',
        height_cm: userProfile.height_cm || '',
        weight_kg: userProfile.weight_kg || '',
        activity_level: userProfile.activity_level || '',
        health_goals: userProfile.health_goals || [],
      });
    }
  }, [userProfile]);

  const totalSteps = 4;

  const activityLevels = [
    { id: 'sedentary', label: t('onboarding.activitySedentary'), description: t('onboarding.activitySedentaryDesc') },
    { id: 'lightly_active', label: t('onboarding.activityLightlyActive'), description: t('onboarding.activityLightlyActiveDesc') },
    { id: 'moderately_active', label: t('onboarding.activityModeratelyActive'), description: t('onboarding.activityModeratelyActiveDesc') },
    { id: 'very_active', label: t('onboarding.activityVeryActive'), description: t('onboarding.activityVeryActiveDesc') },
    { id: 'super_active', label: t('onboarding.activitySuperActive'), description: t('onboarding.activitySuperActiveDesc') },
  ];

  const healthGoals = [
    { id: 'lose_weight', label: t('onboarding.goalLoseWeight'), icon: Scale },
    { id: 'build_muscle', label: t('onboarding.goalBuildMuscle'), icon: Dumbbell },
    { id: 'improve_endurance', label: t('onboarding.goalImproveEndurance'), icon: HeartPulse },
    { id: 'eat_healthier', label: t('onboarding.goalEatHealthier'), icon: HeartPulse },
    { id: 'increase_energy', label: t('onboarding.goalIncreaseEnergy'), icon: Zap },
  ];

  // Unit conversion helpers
  const cmToInches = (cm) => (cm / 2.54).toFixed(1);
  const inchesToCm = (inches) => (inches * 2.54).toFixed(1);
  const kgToLbs = (kg) => (kg * 2.20462).toFixed(1);
  const lbsToKg = (lbs) => (lbs / 2.20462).toFixed(1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    if (unitSystem === 'metric') {
      setFormData(prev => ({ ...prev, height_cm: value }));
    } else {
      // Convert inches to cm
      const cm = inchesToCm(value);
      setFormData(prev => ({ ...prev, height_cm: cm }));
    }
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    if (unitSystem === 'metric') {
      setFormData(prev => ({ ...prev, weight_kg: value }));
    } else {
      // Convert lbs to kg
      const kg = lbsToKg(value);
      setFormData(prev => ({ ...prev, weight_kg: kg }));
    }
  };

  const getDisplayHeight = () => {
    if (!formData.height_cm) return '';
    if (unitSystem === 'metric') {
      return formData.height_cm;
    }
    return cmToInches(formData.height_cm);
  };

  const getDisplayWeight = () => {
    if (!formData.weight_kg) return '';
    if (unitSystem === 'metric') {
      return formData.weight_kg;
    }
    return kgToLbs(formData.weight_kg);
  };

  const handleGoalToggle = (goalId) => {
    setFormData(prev => {
      const newGoals = prev.health_goals.includes(goalId)
        ? prev.health_goals.filter(g => g !== goalId)
        : [...prev.health_goals, goalId];
      return { ...prev, health_goals: newGoals };
    });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(s => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Sign Up Required",
        description: "Please sign up to save your personalized profile",
      });
      navigate('/signup');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      await refreshUserProfile();

      toast({
        title: "Success! 🎉",
        description: "Your profile has been updated successfully",
      });

      setLoading(false);
      setStep(s => s + 1); // Move to completion step
    } catch (error) {
      console.error('Submit error:', error);
      setLoading(false);
      toast({
        title: "Error updating profile",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const finishOnboarding = () => {
    if (inline) {
      // In inline mode, reset to first step but keep survey visible
      setStep(1);
      return;
    }

    if (setIsOpen) {
      setIsOpen(false);
      setStep(1); // Reset to first step
    }
    navigate('/app', { replace: true });
  };

  const handleClose = () => {
    if (setIsOpen) {
      setIsOpen(false);
      setStep(1); // Reset to first step
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" className="space-y-3">
            <h2 className="text-lg font-bold">{t('onboarding.aboutYou')}</h2>
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">{t('onboarding.age')}</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md p-2 text-sm" placeholder={t('onboarding.agePlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">{t('onboarding.gender')}</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md p-2 text-sm">
                  <option value="">{t('onboarding.selectGender')}</option>
                  <option value="male">{t('onboarding.male')}</option>
                  <option value="female">{t('onboarding.female')}</option>
                  <option value="other">{t('onboarding.other')}</option>
                  <option value="prefer_not_to_say">{t('onboarding.preferNotToSay')}</option>
                </select>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">{t('onboarding.bodyMetrics')}</h2>
              <div className="flex gap-1 bg-muted rounded-md p-0.5">
                <button
                  onClick={() => setUnitSystem('metric')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    unitSystem === 'metric' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {t('onboarding.metric')}
                </button>
                <button
                  onClick={() => setUnitSystem('imperial')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    unitSystem === 'imperial' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {t('onboarding.imperial')}
                </button>
              </div>
            </div>
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('onboarding.height')} {unitSystem === 'metric' ? '(cm)' : '(inches)'}
                </label>
                <input
                  type="number"
                  value={getDisplayHeight()}
                  onChange={handleHeightChange}
                  className="w-full bg-background border border-border rounded-md p-2 text-sm"
                  placeholder={unitSystem === 'metric' ? t('onboarding.heightPlaceholderMetric') : t('onboarding.heightPlaceholderImperial')}
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('onboarding.weight')} {unitSystem === 'metric' ? '(kg)' : '(lbs)'}
                </label>
                <input
                  type="number"
                  value={getDisplayWeight()}
                  onChange={handleWeightChange}
                  className="w-full bg-background border border-border rounded-md p-2 text-sm"
                  placeholder={unitSystem === 'metric' ? t('onboarding.weightPlaceholderMetric') : t('onboarding.weightPlaceholderImperial')}
                  step="0.1"
                />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" className="space-y-3">
            <h2 className="text-lg font-bold">{t('onboarding.lifestyle')}</h2>
             <div className="space-y-1.5">
              <label className="block text-xs font-medium text-text-secondary mb-1">{t('onboarding.activityLevel')}</label>
              {activityLevels.map(level => (
                <button key={level.id} onClick={() => setFormData(p => ({...p, activity_level: level.id}))} className={`w-full text-left p-2 rounded-md border-2 transition-all ${formData.activity_level === level.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                  <p className="text-xs font-semibold">{level.label}</p>
                  <p className="text-xs text-text-secondary">{level.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" className="space-y-3">
            <h2 className="text-lg font-bold">{t('onboarding.goals')}</h2>
            <p className="text-xs text-text-secondary">{t('onboarding.goalsSubtitle')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {healthGoals.map(goal => {
                const Icon = goal.icon;
                return (
                  <button key={goal.id} onClick={() => handleGoalToggle(goal.id)} className={`flex flex-col items-center justify-center p-2 aspect-square rounded-md border-2 transition-all ${formData.health_goals.includes(goal.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                    <Icon className="w-5 h-5 mb-1 text-primary" />
                    <span className="text-xs font-semibold text-center">{goal.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div key="step5" className="text-center flex flex-col items-center py-3">
             <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
             <h2 className="text-lg font-bold">{t('onboarding.setupComplete')}</h2>
             <p className="text-xs text-text-secondary mt-1.5 mb-4">{t('onboarding.setupCompleteDesc')}</p>
             <Button onClick={finishOnboarding} size="sm">{t('onboarding.goToDashboard')}</Button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Render as inline compact component if inline prop is true
  if (inline) {
    // Show for all users - if not logged in, prompt to sign up on submit
    const isLoggedIn = user && userProfile;

    return (
      <div className="w-full max-w-4xl mx-auto relative">
        <div className="glass-effect rounded-lg p-4 shadow-lg border border-border">
          <div className="flex items-center gap-3 mb-3">
            <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8" />
            <div className="flex-1">
              <h2 className="text-sm font-bold gradient-text">
                {isLoggedIn ? t('onboarding.completeProfile') : t('onboarding.getPersonalizedGuidance')}
              </h2>
              <p className="text-xs text-text-secondary">
                {isLoggedIn ? t('onboarding.personalizeExperience') : t('onboarding.signUpToPlan')}
              </p>
            </div>
            {!isLoggedIn && (
              <Button
                size="sm"
                onClick={() => navigate('/signup')}
                className="bg-primary text-primary-foreground text-xs px-3 py-1 h-auto"
              >
                {t('onboarding.signUp')}
              </Button>
            )}
          </div>

          <div className="mb-3">
            <div className="w-full bg-muted rounded-full h-1.5">
              <motion.div
                className="bg-primary h-1.5 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(step - 1) / totalSteps * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {step <= totalSteps && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={step === 1 || loading}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> {t('onboarding.back')}
              </Button>

              {step < totalSteps ? (
                <Button size="sm" onClick={nextStep} className="text-xs">
                  {t('onboarding.next')} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={handleSubmit} disabled={loading} className="text-xs">
                  {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  {t('onboarding.finish')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render as dialog if isOpen and setIsOpen props are provided
  if (isOpen !== undefined && setIsOpen) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="glass-effect custom-scrollbar max-w-md max-h-[90vh] overflow-y-auto p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img src={logoUrl} alt="GreenoFig Logo" className="w-8 h-8" />
                <div>
                  <h1 className="text-base font-bold gradient-text">{t('onboarding.welcomeTitle')}</h1>
                  <p className="text-xs text-text-secondary">{t('onboarding.welcomeSubtitle')}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="glass-effect rounded-lg p-3 sm:p-4">
              <div className="mb-3">
                  {step <= totalSteps && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                          <motion.div
                              className="bg-primary h-1.5 rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: `${(step - 1) / totalSteps * 100}%` }}
                          />
                      </div>
                  )}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {step <= totalSteps && (
                <div className="flex justify-between items-center mt-4">
                  <Button variant="outline" size="sm" onClick={prevStep} disabled={step === 1 || loading} className="text-xs">
                    <ArrowLeft className="w-3 h-3 mr-1" /> {t('onboarding.back')}
                  </Button>

                  {step < totalSteps ? (
                    <Button size="sm" onClick={nextStep} className="text-xs">
                      {t('onboarding.next')} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={handleSubmit} disabled={loading} className="text-xs">
                      {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                      {t('onboarding.finish')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
    );
  }

  // Render as full page if no dialog props
  return (
    <>
      <Helmet>
        <title>Onboarding - GreenoFig</title>
        <meta name="description" content="Personalize your GreenoFig experience." />
      </Helmet>
      <div className="flex flex-col items-center py-8 px-3 sm:px-4 bg-background text-foreground">
        <div className="w-full max-w-md">
          <div className="text-center mb-3">
            <Link to="/home" className="inline-block mb-1.5">
              <img src={logoUrl} alt="GreenoFig Logo" className="w-10 h-10" />
            </Link>
            <h1 className="text-xl font-bold gradient-text">Welcome to GreenoFig</h1>
            <p className="text-xs text-text-secondary">Let's personalize your experience.</p>
          </div>

          <div className="glass-effect rounded-lg p-3 sm:p-4 shadow-xl">
            <div className="mb-3">
                {step <= totalSteps && (
                    <div className="w-full bg-muted rounded-full h-1.5">
                        <motion.div
                            className="bg-primary h-1.5 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step - 1) / totalSteps * 100}%` }}
                        />
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {step <= totalSteps && (
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="sm" onClick={prevStep} disabled={step === 1 || loading} className="text-xs">
                  <ArrowLeft className="w-3 h-3 mr-1" /> Back
                </Button>

                {step < totalSteps ? (
                  <Button size="sm" onClick={nextStep} className="text-xs">
                    Next <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleSubmit} disabled={loading} className="text-xs">
                    {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    Finish
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingSurvey;
