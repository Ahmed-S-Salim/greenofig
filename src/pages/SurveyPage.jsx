import React, { useState } from 'react';
    import { motion, AnimatePresence } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import { Button } from '@/components/ui/button';
    import { Helmet } from 'react-helmet';
    import { ArrowLeft, ArrowRight, CheckCircle, Dumbbell, HeartPulse, Scale, Edit, Zap, DollarSign, Utensils, Clock, MessageCircle, Sparkles, Activity, Calendar, Home } from 'lucide-react';

    const SurveyPage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const { t, i18n } = useTranslation();
      const [step, setStep] = useState(1);
      
      const [answers, setAnswers] = useState({
        primary_goal: [],
        experience_level: [],
        budget: [],
        dietary_preferences: [],
        time_availability: [],
        need_guidance: [],
        feature_interest: [],
        health_status: [],
        goal_timeline: [],
      });

      const totalSteps = 9;

      const goals = [
        { id: 'lose_weight', label: t('survey.step1.loseWeight'), icon: Scale },
        { id: 'build_muscle', label: t('survey.step1.buildMuscle'), icon: Dumbbell },
        { id: 'improve_endurance', label: t('survey.step1.improveEndurance'), icon: HeartPulse },
        { id: 'eat_healthier', label: t('survey.step1.eatHealthier'), icon: Edit },
        { id: 'increase_energy', label: t('survey.step1.increaseEnergy'), icon: Zap },
      ];

      const experienceLevels = [
        { id: 'beginner', label: t('survey.step2.beginner'), description: t('survey.step2.beginnerDesc') },
        { id: 'intermediate', label: t('survey.step2.intermediate'), description: t('survey.step2.intermediateDesc') },
        { id: 'advanced', label: t('survey.step2.advanced'), description: t('survey.step2.advancedDesc') },
      ];

      const budgetOptions = [
        { id: 'basic', label: t('survey.step3.budgetFriendly'), description: t('survey.step3.budgetFriendlyDesc'), icon: DollarSign },
        { id: 'moderate', label: t('survey.step3.moderate'), description: t('survey.step3.moderateDesc'), icon: DollarSign },
        { id: 'premium', label: t('survey.step3.premium'), description: t('survey.step3.premiumDesc'), icon: DollarSign },
      ];

      const dietaryOptions = [
        { id: 'none', label: t('survey.step4.noRestrictions') },
        { id: 'vegetarian', label: t('survey.step4.vegetarian') },
        { id: 'vegan', label: t('survey.step4.vegan') },
        { id: 'gluten_free', label: t('survey.step4.glutenFree') },
        { id: 'keto', label: t('survey.step4.keto') },
        { id: 'halal', label: t('survey.step4.halal') },
      ];

      const timeAvailability = [
        { id: 'minimal', label: t('survey.step5.minimal'), description: t('survey.step5.minimalDesc') },
        { id: 'moderate', label: t('survey.step5.moderate'), description: t('survey.step5.moderateDesc') },
        { id: 'extensive', label: t('survey.step5.extensive'), description: t('survey.step5.extensiveDesc') },
      ];

      const guidanceOptions = [
        { id: 'self_guided', label: t('survey.step6.selfGuided'), description: t('survey.step6.selfGuidedDesc') },
        { id: 'ai_coach', label: t('survey.step6.aiCoach'), description: t('survey.step6.aiCoachDesc') },
        { id: 'professional', label: t('survey.step6.professional'), description: t('survey.step6.professionalDesc') },
      ];

      const featureInterests = [
        { id: 'meal_planning', label: t('survey.step7.mealPlanning'), icon: Utensils },
        { id: 'workout_plans', label: t('survey.step7.workoutPlans'), icon: Dumbbell },
        { id: 'progress_tracking', label: t('survey.step7.progressTracking'), icon: Activity },
        { id: 'ai_chat', label: t('survey.step7.aiChat'), icon: MessageCircle },
        { id: 'photo_recognition', label: t('survey.step7.photoRecognition'), icon: Sparkles },
        { id: 'expert_consultation', label: t('survey.step7.expertConsultation'), icon: HeartPulse },
      ];

      const healthStatusOptions = [
        { id: 'excellent', label: t('survey.step8.excellent'), description: t('survey.step8.excellentDesc') },
        { id: 'good', label: t('survey.step8.good'), description: t('survey.step8.goodDesc') },
        { id: 'fair', label: t('survey.step8.fair'), description: t('survey.step8.fairDesc') },
        { id: 'needs_attention', label: t('survey.step8.needsAttention'), description: t('survey.step8.needsAttentionDesc') },
      ];

      const timelineOptions = [
        { id: 'relaxed', label: t('survey.step9.relaxed'), description: t('survey.step9.relaxedDesc'), icon: Calendar },
        { id: 'moderate', label: t('survey.step9.moderate'), description: t('survey.step9.moderateDesc'), icon: Calendar },
        { id: 'urgent', label: t('survey.step9.urgent'), description: t('survey.step9.urgentDesc'), icon: Calendar },
      ];

      const handleAnswer = (question, answerId) => {
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
        if (answers.budget.includes('basic')) {
          planScores['Basic'] += 10;
          planScores['Premium'] += 5;
        }
        if (answers.budget.includes('moderate')) {
          planScores['Premium'] += 10;
          planScores['Elite'] += 3;
        }
        if (answers.budget.includes('premium')) {
          planScores['Premium'] += 3;
          planScores['Elite'] += 10;
        }

        // Experience level scoring
        if (answers.experience_level.includes('advanced')) {
          planScores['Elite'] += 8;
          planScores['Premium'] += 5;
        }
        if (answers.experience_level.includes('intermediate')) {
          planScores['Premium'] += 8;
          planScores['Elite'] += 3;
        }
        if (answers.experience_level.includes('beginner')) {
          planScores['Basic'] += 5;
          planScores['Premium'] += 3;
        }

        // Guidance needs scoring
        if (answers.need_guidance.includes('professional')) {
          planScores['Elite'] += 10;
          planScores['Premium'] += 3;
        }
        if (answers.need_guidance.includes('ai_coach')) {
          planScores['Premium'] += 8;
          planScores['Elite'] += 5;
        }
        if (answers.need_guidance.includes('self_guided')) {
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
        if (answers.health_status.includes('needs_attention') || answers.health_status.includes('fair')) {
          planScores['Elite'] += 7;
          planScores['Premium'] += 4;
        }

        // Goal and timeline scoring
        if (answers.primary_goal.includes('build_muscle') || answers.goal_timeline.includes('urgent')) {
          planScores['Elite'] += 4;
          planScores['Premium'] += 3;
        }

        // Dietary preferences (complex needs)
        if (answers.dietary_preferences.length > 2) {
          planScores['Premium'] += 4;
          planScores['Elite'] += 5;
        }

        // Time availability
        if (answers.time_availability.includes('extensive')) {
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
              <motion.div key="step1" className="space-y-1.5">
                <h2 className="text-sm font-bold text-center" id="survey-question">{t('survey.step1.question')}</h2>
                <p className="text-text-secondary text-center text-[10px]">{t('survey.step1.description')}</p>
                <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-labelledby="survey-question">
                  {goals.map(goal => {
                    const Icon = goal.icon;
                    const isSelected = answers.primary_goal.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => handleAnswer('primary_goal', goal.id)}
                        className={`flex flex-col items-center justify-center p-1.5 aspect-square rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={goal.label}
                      >
                        <Icon className="w-8 h-8 mb-0.5 text-primary" aria-hidden="true" />
                        <span className="font-semibold text-center text-[10px] leading-tight">{goal.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 2:
            return (
              <motion.div key="step2" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="experience-question">{t('survey.step2.question')}</h2>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="experience-question">
                  {experienceLevels.map(level => {
                    const isSelected = answers.experience_level.includes(level.id);
                    return (
                      <button
                        key={level.id}
                        onClick={() => handleAnswer('experience_level', level.id)}
                        className={`w-full text-left p-2 rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${level.label}: ${level.description}`}
                      >
                        <p className="font-semibold text-xs">{level.label}</p>
                        <p className="text-xs text-text-secondary">{level.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 3:
            return (
              <motion.div key="step3" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="budget-question">{t('survey.step3.question')}</h2>
                <p className="text-text-secondary text-center text-sm">{t('survey.step3.description')}</p>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="budget-question">
                  {budgetOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = answers.budget.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('budget', option.id)}
                        className={`w-full text-left p-2 rounded-md border-2 transition-all duration-200 flex items-center gap-3 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{option.label}</p>
                          <p className="text-xs text-text-secondary">{option.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 4:
            return (
              <motion.div key="step4" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="dietary-question">{t('survey.step4.question')}</h2>
                <p className="text-text-secondary text-center text-sm">{t('survey.step4.description')}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dietaryOptions.map(option => {
                    const isSelected = answers.dietary_preferences.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('dietary_preferences', option.id)}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 font-medium text-center text-sm ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
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
              <motion.div key="step5" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="time-question">{t('survey.step5.question')}</h2>
                <p className="text-text-secondary text-center text-sm">{t('survey.step5.description')}</p>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="time-question">
                  {timeAvailability.map(option => {
                    const isSelected = answers.time_availability.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('time_availability', option.id)}
                        className={`w-full text-left p-2 rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-text-secondary">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 6:
            return (
              <motion.div key="step6" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="guidance-question">{t('survey.step6.question')}</h2>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="guidance-question">
                  {guidanceOptions.map(option => {
                    const isSelected = answers.need_guidance.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('need_guidance', option.id)}
                        className={`w-full text-left p-2 rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-text-secondary">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 7:
            return (
              <motion.div key="step7" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="features-question">{t('survey.step7.question')}</h2>
                <p className="text-text-secondary text-center text-[10px]">{t('survey.step7.description')}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {featureInterests.map(feature => {
                    const Icon = feature.icon;
                    const isSelected = answers.feature_interest.includes(feature.id);
                    return (
                      <button
                        key={feature.id}
                        onClick={() => handleAnswer('feature_interest', feature.id)}
                        className={`flex flex-col items-center justify-center p-1.5 aspect-square rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                      >
                        <Icon className="w-8 h-8 mb-0.5 text-primary" />
                        <span className="font-semibold text-center text-[10px] leading-tight">{feature.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 8:
            return (
              <motion.div key="step8" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="health-question">{t('survey.step8.question')}</h2>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="health-question">
                  {healthStatusOptions.map(option => {
                    const isSelected = answers.health_status.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('health_status', option.id)}
                        className={`w-full text-left p-2 rounded-md border-2 transition-all duration-200 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <p className="font-semibold text-sm">{option.label}</p>
                        <p className="text-xs text-text-secondary">{option.description}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            );
          case 9:
            return (
              <motion.div key="step9" className="space-y-2">
                <h2 className="text-lg font-bold text-center" id="timeline-question">{t('survey.step9.question')}</h2>
                <p className="text-text-secondary text-center text-sm">{t('survey.step9.description')}</p>
                <div className="space-y-1.5" role="radiogroup" aria-labelledby="timeline-question">
                  {timelineOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = answers.goal_timeline.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer('goal_timeline', option.id)}
                        className={`w-full text-left p-2 rounded-md border-2 transition-all duration-200 flex items-center gap-3 ${isSelected ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50 hover:shadow-md'}`}
                        role="radio"
                        aria-checked={isSelected}
                      >
                        <Icon className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{option.label}</p>
                          <p className="text-xs text-text-secondary">{option.description}</p>
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
          <div className="h-screen flex items-center justify-center p-2 bg-background text-foreground overflow-hidden">
            <div className="w-full max-w-xl h-full max-h-[98vh] flex flex-col py-2">
              {/* Header with Home Button */}
              <div className="flex items-center justify-between mb-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-[10px] h-7 px-2"
                >
                  <Home className="w-3 h-3 mr-0.5" /> {t('common.backToHome')}
                </Button>
                <img src={logoUrl} alt="GreenoFig Logo" className="w-10 h-10" />
                <div className="w-20"></div>
              </div>

              <div className="text-center mb-1.5">
                <h1 className="text-base font-bold gradient-text">{t('survey.title')}</h1>
                <p className="text-text-secondary text-[10px]">{t('survey.subtitle')}</p>
              </div>

              <div className="glass-effect rounded-lg p-2.5 shadow-2xl flex-1 flex flex-col min-h-0">
                <div className="mb-1.5">
                    <div className="w-full bg-muted rounded-full h-1" role="progressbar" aria-valuenow={((step / totalSteps) * 100)} aria-valuemin="0" aria-valuemax="100" aria-label="Survey progress">
                        <motion.div
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-text-secondary mt-0.5 text-center">{t('survey.stepProgress', { step, total: totalSteps })}</p>
                </div>

                <div className="flex-1 min-h-0 mb-1.5 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: i18n.language === 'ar' ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: i18n.language === 'ar' ? 50 : -50 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {renderStep()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-border">
                  <Button variant="outline" onClick={prevStep} disabled={step === 1} aria-label="Go to previous step" className="text-[11px] h-8 px-3">
                    {i18n.language === 'ar' ? <ArrowRight className="w-3 h-3 mr-1" aria-hidden="true" /> : <ArrowLeft className="w-3 h-3 mr-1" aria-hidden="true" />}
                    {t('survey.back')}
                  </Button>

                  <Button onClick={nextStep} aria-label={step < totalSteps ? 'Go to next step' : 'View recommended plans'} className="text-[11px] h-8 px-3">
                    {step < totalSteps ? t('survey.next') : t('survey.findMyPlan')}
                    {i18n.language === 'ar' ? <ArrowLeft className="w-3 h-3 ml-1" aria-hidden="true" /> : <ArrowRight className="w-3 h-3 ml-1" aria-hidden="true" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    };

    export default SurveyPage;