import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { Helmet } from 'react-helmet';
    import { ArrowLeft, ArrowRight, CheckCircle, Dumbbell, HeartPulse, Scale, Edit, Zap, DollarSign, Utensils, Clock, MessageCircle, Sparkles, Activity, Calendar } from 'lucide-react';

    const SurveyPage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const [step, setStep] = useState(1);
      
      const [answers, setAnswers] = useState({
        primary_goal: '',
        experience_level: '',
        budget: '',
        dietary_preferences: [],
        time_availability: '',
        need_guidance: '',
        feature_interest: [],
        health_status: '',
        goal_timeline: '',
      });

      const totalSteps = 9;

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

      const budgetOptions = [
        { id: 'basic', label: 'Budget-Friendly', description: 'Under $10/month', icon: DollarSign },
        { id: 'moderate', label: 'Moderate', description: '$10-$20/month', icon: DollarSign },
        { id: 'premium', label: 'Premium', description: '$20-$30/month', icon: DollarSign },
      ];

      const dietaryOptions = [
        { id: 'none', label: 'No Restrictions' },
        { id: 'vegetarian', label: 'Vegetarian' },
        { id: 'vegan', label: 'Vegan' },
        { id: 'gluten_free', label: 'Gluten-Free' },
        { id: 'keto', label: 'Keto' },
        { id: 'halal', label: 'Halal' },
      ];

      const timeAvailability = [
        { id: 'minimal', label: '15-30 min/day', description: 'I have limited time' },
        { id: 'moderate', label: '30-60 min/day', description: 'I can dedicate some time' },
        { id: 'extensive', label: '60+ min/day', description: 'I have plenty of time' },
      ];

      const guidanceOptions = [
        { id: 'self_guided', label: 'Self-Guided', description: 'I prefer to work independently' },
        { id: 'ai_coach', label: 'AI Coach', description: 'I want AI-powered guidance' },
        { id: 'professional', label: 'Professional Support', description: 'I need expert nutritionist help' },
      ];

      const featureInterests = [
        { id: 'meal_planning', label: 'Meal Planning', icon: Utensils },
        { id: 'workout_plans', label: 'Workout Plans', icon: Dumbbell },
        { id: 'progress_tracking', label: 'Progress Tracking', icon: Activity },
        { id: 'ai_chat', label: 'AI Chat Support', icon: MessageCircle },
        { id: 'photo_recognition', label: 'Photo Food Recognition', icon: Sparkles },
        { id: 'expert_consultation', label: 'Expert Consultation', icon: HeartPulse },
      ];

      const healthStatusOptions = [
        { id: 'excellent', label: 'Excellent', description: 'No health concerns' },
        { id: 'good', label: 'Good', description: 'Minor concerns, generally healthy' },
        { id: 'fair', label: 'Fair', description: 'Managing some health conditions' },
        { id: 'needs_attention', label: 'Needs Attention', description: 'Require professional guidance' },
      ];

      const timelineOptions = [
        { id: 'relaxed', label: 'Relaxed', description: '6+ months', icon: Calendar },
        { id: 'moderate', label: 'Moderate', description: '3-6 months', icon: Calendar },
        { id: 'urgent', label: 'Urgent', description: 'Within 3 months', icon: Calendar },
      ];

      const handleAnswer = (question, answer) => {
        setAnswers(prev => ({ ...prev, [question]: answer }));
      };

      const handleMultipleAnswer = (question, answerId) => {
        setAnswers(prev => {
          const currentAnswers = prev[question] || [];
          const newAnswers = currentAnswers.includes(answerId)
            ? currentAnswers.filter(id => id !== answerId)
            : [...currentAnswers, answerId];
          return { ...prev, [question]: newAnswers };
        });
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
        // Calculate scores for each plan based on user answers
        // Using actual plan names from database: Basic (free), Premium, Elite
        const planScores = {
          'Basic': 0,
          'Premium': 0,
          'Elite': 0,
        };

        // Budget scoring (highest weight)
        if (answers.budget === 'basic') {
          planScores['Basic'] += 10;
          planScores['Premium'] += 5;
        } else if (answers.budget === 'moderate') {
          planScores['Premium'] += 10;
          planScores['Elite'] += 3;
        } else if (answers.budget === 'premium') {
          planScores['Premium'] += 3;
          planScores['Elite'] += 10;
        }

        // Experience level scoring
        if (answers.experience_level === 'advanced') {
          planScores['Elite'] += 8;
          planScores['Premium'] += 5;
        } else if (answers.experience_level === 'intermediate') {
          planScores['Premium'] += 8;
          planScores['Elite'] += 3;
        } else {
          planScores['Basic'] += 5;
          planScores['Premium'] += 3;
        }

        // Guidance needs scoring
        if (answers.need_guidance === 'professional') {
          planScores['Elite'] += 10;
          planScores['Premium'] += 3;
        } else if (answers.need_guidance === 'ai_coach') {
          planScores['Premium'] += 8;
          planScores['Elite'] += 5;
        } else {
          planScores['Basic'] += 5;
          planScores['Premium'] += 3;
        }

        // Feature interests scoring
        const advancedFeatures = ['photo_recognition', 'expert_consultation'];
        const premiumFeatures = ['ai_chat', 'progress_tracking'];
        advancedFeatures.forEach(feature => {
          if (answers.feature_interest.includes(feature)) {
            planScores['Elite'] += 6;
            planScores['Premium'] += 2;
          }
        });
        premiumFeatures.forEach(feature => {
          if (answers.feature_interest.includes(feature)) {
            planScores['Premium'] += 5;
            planScores['Elite'] += 3;
          }
        });

        // Health status scoring
        if (answers.health_status === 'needs_attention' || answers.health_status === 'fair') {
          planScores['Elite'] += 7;
          planScores['Premium'] += 4;
        }

        // Goal and timeline scoring
        if (answers.primary_goal === 'build_muscle' || answers.goal_timeline === 'urgent') {
          planScores['Elite'] += 4;
          planScores['Premium'] += 3;
        }

        // Dietary preferences (complex needs)
        if (answers.dietary_preferences.length > 2) {
          planScores['Premium'] += 4;
          planScores['Elite'] += 5;
        }

        // Time availability
        if (answers.time_availability === 'extensive') {
          planScores['Elite'] += 3;
          planScores['Premium'] += 2;
        }

        // Find the plan with highest score
        let recommendedPlan = 'Premium'; // Default
        let maxScore = planScores['Premium'];

        Object.entries(planScores).forEach(([plan, score]) => {
          if (score > maxScore) {
            maxScore = score;
            recommendedPlan = plan;
          }
        });

        console.log('Plan Scores:', planScores);
        console.log('Recommended Plan:', recommendedPlan);

        // Navigate to pricing with recommended plan
        navigate('/pricing', { state: { recommendedPlan, scrollToPlan: true } });
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
          case 3:
            return (
              <motion.div key="step3" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="budget-question">What's your budget for a health plan?</h2>
                <p className="text-text-secondary text-center">Choose a range that works for you.</p>
                <div className="space-y-3" role="radiogroup" aria-labelledby="budget-question">
                  {budgetOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = answers.budget === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('budget', option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-sm text-text-secondary">{option.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 4:
            return (
              <motion.div key="step4" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="dietary-question">Any dietary preferences or restrictions?</h2>
                <p className="text-text-secondary text-center">Select all that apply.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map(option => {
                    const isSelected = answers.dietary_preferences.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleMultipleAnswer('dietary_preferences', option.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 font-medium text-center ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 5:
            return (
              <motion.div key="step5" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="time-question">How much time can you dedicate daily?</h2>
                <p className="text-text-secondary text-center">For workouts and meal preparation.</p>
                <div className="space-y-3" role="radiogroup" aria-labelledby="time-question">
                  {timeAvailability.map(option => {
                    const isSelected = answers.time_availability === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('time_availability', option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-text-secondary">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 6:
            return (
              <motion.div key="step6" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="guidance-question">What type of guidance do you prefer?</h2>
                <div className="space-y-3" role="radiogroup" aria-labelledby="guidance-question">
                  {guidanceOptions.map(option => {
                    const isSelected = answers.need_guidance === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('need_guidance', option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-text-secondary">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 7:
            return (
              <motion.div key="step7" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="features-question">Which features interest you most?</h2>
                <p className="text-text-secondary text-center">Select all that appeal to you.</p>
                <div className="grid grid-cols-2 gap-4">
                  {featureInterests.map(feature => {
                    const Icon = feature.icon;
                    const isSelected = answers.feature_interest.includes(feature.id);
                    return (
                      <button
                        key={feature.id}
                        onClick={() => handleMultipleAnswer('feature_interest', feature.id)}
                        className={`flex flex-col items-center justify-center p-4 aspect-square rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                      >
                        <Icon className="w-8 h-8 mb-2 text-primary" />
                        <span className="font-semibold text-center text-sm">{feature.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 8:
            return (
              <motion.div key="step8" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="health-question">How would you describe your current health?</h2>
                <div className="space-y-3" role="radiogroup" aria-labelledby="health-question">
                  {healthStatusOptions.map(option => {
                    const isSelected = answers.health_status === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('health_status', option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-sm text-text-secondary">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 9:
            return (
              <motion.div key="step9" className="space-y-6">
                <h2 className="text-3xl font-bold text-center" id="timeline-question">What's your timeline for achieving your goals?</h2>
                <p className="text-text-secondary text-center">How soon do you want to see results?</p>
                <div className="space-y-3" role="radiogroup" aria-labelledby="timeline-question">
                  {timelineOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = answers.goal_timeline === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('goal_timeline', option.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold">{option.label}</p>
                          <p className="text-sm text-text-secondary">{option.description}</p>
                        </div>
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
                <p className="text-text-secondary">Answer a few questions to get your personalized plan recommendation.</p>
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