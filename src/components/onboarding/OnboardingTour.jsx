import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Target,
  Utensils,
  Dumbbell,
  TrendingUp,
  Award,
  Bell,
  Users,
  MessageSquare,
  Calendar,
  Heart,
  Zap,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const TOUR_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to GreenoFig! 🎉',
    description: 'Let\'s take a quick tour to show you around your new nutrition companion. This will only take a minute!',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    position: 'center',
    highlight: null,
    actions: ['Skip Tour', 'Start Tour']
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center! Track your daily progress, view your goals, and access all your nutrition data in one place.',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    position: 'top',
    highlight: '.dashboard-overview',
    tip: 'Check here daily to stay on track!'
  },
  {
    id: 'meal-logging',
    title: 'Log Your Meals',
    description: 'Quickly log your meals with our AI-powered calorie scanner. Just snap a photo or search our extensive food database!',
    icon: Utensils,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    position: 'right',
    highlight: '.quick-log-button',
    tip: 'Tap the + button to log meals instantly'
  },
  {
    id: 'workout-tracking',
    title: 'Track Workouts',
    description: 'Log your exercises and track calories burned. We\'ll help you find the perfect balance between nutrition and fitness!',
    icon: Dumbbell,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    position: 'right',
    highlight: '.workout-section',
    tip: 'Consistency is key - try to log daily!'
  },
  {
    id: 'goals',
    title: 'Set Your Goals',
    description: 'Define your nutrition and fitness goals. We\'ll personalize your experience and help you achieve them step by step.',
    icon: Target,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    position: 'left',
    highlight: '.goals-widget',
    tip: 'SMART goals work best: Specific, Measurable, Achievable'
  },
  {
    id: 'gamification',
    title: 'Earn Rewards',
    description: 'Complete challenges, maintain streaks, and unlock badges! Turn your nutrition journey into a fun game.',
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    position: 'bottom',
    highlight: '.gamification-section',
    tip: 'Check your achievements to see what you\'ve unlocked!'
  },
  {
    id: 'notifications',
    title: 'Stay on Track',
    description: 'Set up reminders for meals and workouts. We\'ll send you friendly notifications to keep you motivated!',
    icon: Bell,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    position: 'top-right',
    highlight: '.notifications-icon',
    tip: 'Customize notification times in Settings'
  },
  {
    id: 'nutritionist',
    title: 'Connect with Nutritionists',
    description: 'Need expert guidance? Connect with certified nutritionists for personalized meal plans and advice.',
    icon: MessageSquare,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    position: 'left',
    highlight: '.nutritionist-button',
    tip: 'Upgrade to Premium for unlimited messaging!',
    tierBadge: 'Premium'
  },
  {
    id: 'completion',
    title: 'You\'re All Set! 🚀',
    description: 'You\'re ready to start your journey! Remember, consistency beats perfection. We\'re here to support you every step of the way.',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    position: 'center',
    highlight: null,
    actions: ['Get Started']
  }
];

const OnboardingTour = ({ userId, onComplete, autoStart = false }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [highlightPosition, setHighlightPosition] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (userId) {
      checkTourStatus();
    }
  }, [userId]);

  useEffect(() => {
    if (isActive && currentStep < TOUR_STEPS.length) {
      updateHighlightPosition();
      window.addEventListener('resize', updateHighlightPosition);
      return () => window.removeEventListener('resize', updateHighlightPosition);
    }
  }, [isActive, currentStep]);

  const checkTourStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data?.onboarding_completed && autoStart) {
        // Start tour automatically for new users
        setTimeout(() => startTour(), 1000);
      }

      setTourCompleted(data?.onboarding_completed || false);
    } catch (error) {
      console.error('Error checking tour status:', error);
    }
  };

  const updateHighlightPosition = () => {
    const step = TOUR_STEPS[currentStep];
    if (!step.highlight) {
      setHighlightPosition(null);
      return;
    }

    const element = document.querySelector(step.highlight);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16
      });
    } else {
      setHighlightPosition(null);
    }
  };

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);

    // Trigger celebration animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    completeTour(true);
  };

  const completeTour = async (skipped = false) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setIsActive(false);
      setTourCompleted(true);

      if (!skipped) {
        // Celebration confetti
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 }
        });
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };

  const restartTour = () => {
    setCurrentStep(0);
    setIsActive(true);
    setTourCompleted(false);
  };

  if (!isActive) {
    return tourCompleted ? (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={restartTour}
          className="shadow-lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Replay Tour
        </Button>
      </div>
    ) : (
      <div className="fixed bottom-4 right-4 z-40">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <Button
            onClick={startTour}
            className="shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Tour
          </Button>
        </motion.div>
      </div>
    );
  }

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 pointer-events-none" />

      {/* Highlight */}
      <AnimatePresence>
        {highlightPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 pointer-events-none"
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6)',
              borderRadius: '12px',
              transition: 'all 0.3s ease-in-out'
            }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip/Modal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          ref={tooltipRef}
          className={`fixed z-[60] ${
            step.position === 'center'
              ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
              : step.position === 'top'
              ? 'top-24 left-1/2 transform -translate-x-1/2'
              : step.position === 'bottom'
              ? 'bottom-24 left-1/2 transform -translate-x-1/2'
              : step.position === 'left'
              ? 'top-1/2 left-8 transform -translate-y-1/2'
              : step.position === 'right'
              ? 'top-1/2 right-8 transform -translate-y-1/2'
              : step.position === 'top-right'
              ? 'top-24 right-8'
              : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          <Card className="w-96 max-w-[90vw] shadow-2xl border-2 border-purple-200">
            <CardContent className="p-6">
              {/* Close Button */}
              <button
                onClick={skipTour}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">
                    Step {currentStep + 1} of {TOUR_STEPS.length}
                  </span>
                  <span className="text-xs text-gray-600">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mb-4`}>
                <StepIcon className={`w-8 h-8 ${step.color}`} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 pr-8">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">
                {step.description}
              </p>

              {/* Tip */}
              {step.tip && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{step.tip}</p>
                  </div>
                </div>
              )}

              {/* Tier Badge */}
              {step.tierBadge && (
                <div className="mb-4">
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    {step.tierBadge} Feature
                  </Badge>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 mt-6">
                {step.actions ? (
                  <>
                    {step.actions[0] && (
                      <Button
                        variant="outline"
                        onClick={step.actions[0] === 'Skip Tour' ? skipTour : nextStep}
                        className="flex-1"
                      >
                        {step.actions[0]}
                      </Button>
                    )}
                    {step.actions[1] && (
                      <Button
                        onClick={step.actions[1] === 'Start Tour' ? nextStep : completeTour}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                      >
                        {step.actions[1]}
                        {step.actions[1] === 'Get Started' ? (
                          <Check className="w-4 h-4 ml-2" />
                        ) : (
                          <ArrowRight className="w-4 h-4 ml-2" />
                        )}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      disabled={currentStep === 0}
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </div>

              {/* Skip Link */}
              {!step.actions && currentStep < TOUR_STEPS.length - 1 && (
                <button
                  onClick={skipTour}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
                >
                  Skip tour
                </button>
              )}
            </CardContent>
          </Card>

          {/* Arrow pointer for non-center tooltips */}
          {step.position !== 'center' && highlightPosition && (
            <div
              className="absolute w-4 h-4 bg-white border-2 border-purple-200 transform rotate-45"
              style={{
                [step.position === 'top' ? 'bottom' : step.position === 'bottom' ? 'top' : step.position === 'left' ? 'right' : 'left']: '-10px',
                [step.position === 'top' || step.position === 'bottom' ? 'left' : 'top']: '50%',
                [step.position === 'top' || step.position === 'bottom' ? 'marginLeft' : 'marginTop']: '-8px'
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 left-4 z-[60] pointer-events-auto">
        <Card className="bg-white bg-opacity-90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded border">←</kbd>
                <span>Previous</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded border">→</kbd>
                <span>Next</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-gray-100 rounded border">Esc</kbd>
                <span>Skip</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OnboardingTour;
