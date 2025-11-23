import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Zap,
  Star,
  TrendingUp,
  Lock,
  Sparkles,
  Award,
  CheckCircle,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const UpgradePrompts = ({ trigger = 'feature_limit', feature = 'AI Meal Plan', userTier = 'base' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [promptType, setPromptType] = useState('banner'); // banner, modal, inline
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Show prompt based on trigger
    if (trigger) {
      setIsVisible(true);
    }
  }, [trigger]);

  const promptContent = {
    feature_limit: {
      title: 'Unlock Premium Features',
      subtitle: `${feature} is available for Premium members`,
      icon: Lock,
      color: 'from-purple-500 to-pink-600',
      benefits: [
        'Unlimited AI meal plans',
        'Advanced progress tracking',
        'Priority support',
        'Custom workout plans'
      ],
      cta: 'Upgrade to Premium',
      price: '$9.99/month'
    },
    daily_limit: {
      title: 'You\'ve Reached Your Daily Limit',
      subtitle: 'Upgrade to get unlimited access',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      benefits: [
        'Unlimited daily logs',
        'Advanced analytics',
        'Custom goals',
        'Export your data'
      ],
      cta: 'Remove Limits',
      price: '$9.99/month'
    },
    pro_feature: {
      title: 'This is a Pro Feature',
      subtitle: 'Unlock advanced tools with Pro',
      icon: Crown,
      color: 'from-blue-500 to-purple-600',
      benefits: [
        'Video consultations',
        'Wearable device sync',
        'Predictive analytics',
        'Meal timing optimization'
      ],
      cta: 'Upgrade to Pro',
      price: '$19.99/month'
    },
    elite_feature: {
      title: 'Elite Members Only',
      subtitle: 'Get VIP treatment with Elite',
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      benefits: [
        'DNA-based nutrition',
        'Dedicated nutritionist',
        'Monthly video calls',
        'Exclusive masterclasses'
      ],
      cta: 'Go Elite',
      price: '$29.99/month'
    },
    trial_ending: {
      title: 'Your Trial is Ending Soon',
      subtitle: 'Continue your progress with Premium',
      icon: Gift,
      color: 'from-green-500 to-emerald-600',
      benefits: [
        'Don\'t lose your progress',
        'Keep all your data',
        'Continue with nutritionist',
        'Unlock all features'
      ],
      cta: 'Continue with Premium',
      price: '$9.99/month',
      discount: '20% OFF'
    },
    achievement_unlock: {
      title: 'Congratulations! 🎉',
      subtitle: 'You\'ve unlocked exclusive Premium benefits',
      icon: Award,
      color: 'from-purple-500 to-pink-500',
      benefits: [
        'Special achievement unlocked',
        'Exclusive Premium perks',
        'Advanced tracking tools',
        'Priority customer support'
      ],
      cta: 'Claim Your Reward',
      price: '$9.99/month',
      discount: '15% OFF'
    }
  };

  const content = promptContent[trigger] || promptContent.feature_limit;
  const Icon = content.icon;

  const handleUpgrade = () => {
    navigate('/pricing');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to avoid showing too frequently
    localStorage.setItem(`upgrade_prompt_${trigger}_dismissed`, Date.now().toString());
  };

  // Banner variant (top of screen)
  if (promptType === 'banner' && isVisible) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 p-3 bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Icon className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold">{content.title}</p>
                <p className="text-sm text-white/90 hidden sm:block">{content.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {content.discount && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {content.discount}
                </Badge>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpgrade}
                className="flex-shrink-0"
              >
                {content.cta}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8 text-white hover:bg-white/20 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Modal variant (center of screen)
  if (promptType === 'modal' && isVisible) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="glass-effect overflow-hidden">
              <div className={`relative bg-gradient-to-r ${content.color} p-8 text-white`}>
                {/* Close Button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* Icon */}
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="mb-4"
                >
                  <Icon className="w-16 h-16" />
                </motion.div>

                {/* Title */}
                <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
                <p className="text-lg text-white/90 mb-4">{content.subtitle}</p>

                {/* Price Badge */}
                <div className="flex items-center gap-2">
                  {content.discount && (
                    <Badge className="bg-white/20 text-white border-white/30">
                      {content.discount}
                    </Badge>
                  )}
                  <p className="text-2xl font-bold">{content.price}</p>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Benefits List */}
                <div className="space-y-3 mb-6">
                  {content.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r ${content.color} flex items-center justify-center`}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm">{benefit}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpgrade}
                    className={`flex-1 bg-gradient-to-r ${content.color} text-white hover:opacity-90`}
                  >
                    {content.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDismiss}
                  >
                    Maybe Later
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>14-day money-back</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Inline variant (within content)
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className={`overflow-hidden border-2 border-primary/20 bg-gradient-to-r ${content.color} bg-opacity-5`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r ${content.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{content.title}</h3>
                      <p className="text-sm text-muted-foreground">{content.subtitle}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="h-6 w-6 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Compact Benefits */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {content.benefits.slice(0, 4).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="text-xs truncate">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleUpgrade}
                      size="sm"
                      className={`bg-gradient-to-r ${content.color} text-white hover:opacity-90`}
                    >
                      {content.cta} - {content.price}
                    </Button>
                    {content.discount && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-400">
                        {content.discount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Export different prompt types as named exports
export const BannerPrompt = (props) => <UpgradePrompts {...props} />;
export const ModalPrompt = (props) => <UpgradePrompts {...props} />;
export const InlinePrompt = (props) => <UpgradePrompts {...props} />;

export default UpgradePrompts;
