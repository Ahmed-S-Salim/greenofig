
    import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useNavigate, Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { Loader2, ArrowLeft, ArrowRight, CheckCircle, Scale, Dumbbell, HeartPulse, Zap } from 'lucide-react';
    import { Helmet } from 'react-helmet';

    const OnboardingSurvey = ({ logoUrl }) => {
      const { user, userProfile, refreshUserProfile } = useAuth();
      const navigate = useNavigate();
      const [step, setStep] = useState(1);
      const [loading, setLoading] = useState(false);
      
      const [formData, setFormData] = useState({
        age: userProfile?.age || '',
        gender: userProfile?.gender || '',
        height_cm: userProfile?.height_cm || '',
        weight_kg: userProfile?.weight_kg || '',
        activity_level: userProfile?.activity_level || '',
        health_goals: userProfile?.health_goals || [],
      });
      
      const totalSteps = 4;

      const activityLevels = [
        { id: 'sedentary', label: 'Sedentary', description: 'Little or no exercise' },
        { id: 'lightly_active', label: 'Lightly Active', description: 'Light exercise/sports 1-3 days/week' },
        { id: 'moderately_active', label: 'Moderately Active', description: 'Moderate exercise/sports 3-5 days/week' },
        { id: 'very_active', label: 'Very Active', description: 'Hard exercise/sports 6-7 days a week' },
        { id: 'super_active', label: 'Super Active', description: 'Very hard exercise & physical job' },
      ];
      
      const healthGoals = [
        { id: 'lose_weight', label: 'Lose Weight', icon: Scale },
        { id: 'build_muscle', label: 'Build Muscle', icon: Dumbbell },
        { id: 'improve_endurance', label: 'Improve Endurance', icon: HeartPulse },
        { id: 'eat_healthier', label: 'Eat Healthier', icon: HeartPulse },
        { id: 'increase_energy', label: 'Increase Energy', icon: Zap },
      ];

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
        if (!user) return;
        setLoading(true);

        const { error } = await supabase
          .from('user_profiles')
          .update(formData)
          .eq('id', user.id);
        
        if (error) {
          setLoading(false);
          toast({
            title: "Error updating profile",
            description: error.message,
            variant: "destructive",
          });
        } else {
          await refreshUserProfile();
          setLoading(false);
          setStep(s => s + 1); // Move to completion step
        }
      };
      
      const finishOnboarding = () => {
        navigate('/app', { replace: true });
      };
      
      const renderStep = () => {
        switch (step) {
          case 1:
            return (
              <motion.div key="step1" className="space-y-6">
                <h2 className="text-3xl font-bold">About You</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full bg-background border border-border rounded-lg p-3" placeholder="e.g., 28" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-background border border-border rounded-lg p-3">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          case 2:
            return (
              <motion.div key="step2" className="space-y-6">
                <h2 className="text-3xl font-bold">Your Body Metrics</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Height (cm)</label>
                    <input type="number" name="height_cm" value={formData.height_cm} onChange={handleInputChange} className="w-full bg-background border border-border rounded-lg p-3" placeholder="e.g., 175" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Weight (kg)</label>
                    <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleInputChange} className="w-full bg-background border border-border rounded-lg p-3" placeholder="e.g., 70" />
                  </div>
                </div>
              </motion.div>
            );
          case 3:
            return (
              <motion.div key="step3" className="space-y-6">
                <h2 className="text-3xl font-bold">Your Lifestyle</h2>
                 <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-secondary">Activity Level</label>
                  {activityLevels.map(level => (
                    <button key={level.id} onClick={() => setFormData(p => ({...p, activity_level: level.id}))} className={`w-full text-left p-4 rounded-lg border-2 transition-all ${formData.activity_level === level.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                      <p className="font-semibold">{level.label}</p>
                      <p className="text-sm text-text-secondary">{level.description}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            );
          case 4:
            return (
              <motion.div key="step4" className="space-y-6">
                <h2 className="text-3xl font-bold">Your Goals</h2>
                <p className="text-text-secondary">Select your primary health and fitness goals. You can select multiple.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {healthGoals.map(goal => {
                    const Icon = goal.icon;
                    return (
                      <button key={goal.id} onClick={() => handleGoalToggle(goal.id)} className={`flex flex-col items-center justify-center p-4 aspect-square rounded-lg border-2 transition-all ${formData.health_goals.includes(goal.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                        <Icon className="w-8 h-8 mb-2 text-primary" />
                        <span className="font-semibold text-center">{goal.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 5:
            return (
              <motion.div key="step5" className="text-center flex flex-col items-center">
                 <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
                 <h2 className="text-3xl font-bold">Setup Complete!</h2>
                 <p className="text-text-secondary mt-2 mb-8">Your profile is personalized. Get ready to start your wellness journey.</p>
                 <Button onClick={finishOnboarding}>Go to Dashboard</Button>
              </motion.div>
            );
          default:
            return null;
        }
      };

      return (
        <>
          <Helmet>
            <title>Onboarding - GreenoFig</title>
            <meta name="description" content="Personalize your GreenoFig experience." />
          </Helmet>
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <Link to="/home" className="inline-block mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src={logoUrl} alt="GreenoFig Logo" className="w-20 h-20" />
                  </motion.div>
                </Link>
                <h1 className="text-4xl font-bold gradient-text">Welcome to GreenoFig</h1>
                <p className="text-text-secondary">Let's personalize your experience.</p>
              </div>
              
              <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                    {step <= totalSteps && (
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <motion.div
                                className="bg-primary h-2.5 rounded-full"
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
                  <div className="flex justify-between items-center mt-8">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1 || loading}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    
                    {step < totalSteps ? (
                      <Button onClick={nextStep}>
                        Next <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
  