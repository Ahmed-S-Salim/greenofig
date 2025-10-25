import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Helmet } from 'react-helmet';
    import { ArrowLeft, ArrowRight, CheckCircle, Dumbbell, HeartPulse, Scale, Edit, Zap } from 'lucide-react';

    const SurveyPage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const [step, setStep] = useState(1);
      
      const [answers, setAnswers] = useState({
        primary_goal: '',
        experience_level: '',
      });
      
      const totalSteps = 2;

      const goals = [
        { id: 'lose_weight', label: 'Lose Weight', icon: Scale },
        { id: 'build_muscle', label: 'Build Muscle', icon: Dumbbell },
        { id: 'improve_endurance', label: 'Improve Endurance', icon: HeartPulse },
        { id: 'eat_healthier', label: 'Eat Healthier', icon: Edit },
        { id: 'increase_energy', label: 'Increase Energy', icon: Zap },
      ];

      const experienceLevels = [
        { id: 'beginner', label: 'Beginner', description: 'Just starting my fitness journey.' },
        { id: 'intermediate', label: 'Intermediate', description: 'I work out regularly.' },
        { id: 'advanced', label: 'Advanced', description: 'I\'m very experienced and train hard.' },
      ];

      const handleAnswer = (question, answer) => {
        setAnswers(prev => ({ ...prev, [question]: answer }));
      };

      const nextStep = () => {
        if (step < totalSteps) {
          setStep(s => s + 1);
        } else {
          handleSubmit();
        }
      };

      const prevStep = () => {
        if (step > 1) {
          setStep(s => s - 1);
        }
      };

      const handleSubmit = () => {
        let recommendedPlan = 'Starter'; // Default
        if (answers.primary_goal === 'build_muscle' || answers.experience_level === 'advanced') {
          recommendedPlan = 'Ultimate';
        } else if (answers.primary_goal !== '' || answers.experience_level === 'intermediate') {
          recommendedPlan = 'Pro';
        }
        
        navigate('/pricing', { state: { recommendedPlan } });
      };
      
      const renderStep = () => {
        switch (step) {
          case 1:
            return (
              <motion.div key="step1" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="survey-question">What is your primary health goal?</h2>
                <p className="text-text-secondary text-center">This will help us recommend the best starting point for you.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="radiogroup" aria-labelledby="survey-question">
                  {goals.map(goal => {
                    const Icon = goal.icon;
                    const isSelected = answers.primary_goal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleAnswer('primary_goal', goal.id)}
                        className={`flex flex-col items-center justify-center p-4 aspect-square rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={goal.label}
                      >
                        <Icon className="w-8 h-8 mb-2 text-primary" aria-hidden="true" />
                        <span className="font-semibold text-center">{goal.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 2:
            return (
              <motion.div key="step2" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="experience-question">What's your fitness experience level?</h2>
                <div className="space-y-3" role="radiogroup" aria-labelledby="experience-question">
                  {experienceLevels.map(level => {
                    const isSelected = answers.experience_level === level.id;
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleAnswer('experience_level', level.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${level.label}: ${level.description}`}
                      >
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-text-secondary">{level.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          default:
            return null;
        }
      };

      return (
        <>
          <Helmet>
            <title>Find Your Plan - GreenoFig</title>
            <meta name="description" content="Take a quick survey to find the perfect GreenoFig plan for you." />
          </Helmet>
          <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <img src={logoUrl} alt="GreenoFig Logo" className="w-20 h-20 mx-auto mb-4" />
                <h1 className="text-4xl font-bold gradient-text">Find Your Perfect Plan</h1>
                <p className="text-text-secondary">Just a couple of questions to get you started.</p>
              </div>
              
              <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                <div className="mb-6">
                    <div className="w-full bg-muted rounded-full h-2.5" role="progressbar" aria-valuenow={((step / totalSteps) * 100)} aria-valuemin="0" aria-valuemax="100" aria-label="Survey progress">
                        <motion.div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-text-secondary mt-2 text-center">Step {step} of {totalSteps}</p>
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

                <div className="flex justify-between items-center mt-8">
                  <Button variant="outline" onClick={prevStep} disabled={step === 1} aria-label="Go to previous step">
                    <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Back
                  </Button>

                  <Button onClick={nextStep} aria-label={step < totalSteps ? 'Go to next step' : 'View recommended plans'}>
                    {step < totalSteps ? 'Next' : 'Find My Plan'} <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    };

    export default SurveyPage;