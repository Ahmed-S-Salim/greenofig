import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Crown,
  Star,
  Zap,
  Sparkles,
  TrendingUp,
  Users,
  MessageCircle,
  Video,
  Dna,
  Award,
  BookOpen,
  Camera,
  Calendar,
  ShoppingCart,
  Apple,
  Activity,
  Heart,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

const FeatureComparison = ({ currentTier = 'base', highlightUpgrade = true }) => {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly, annual
  const navigate = useNavigate();

  const tiers = [
    {
      id: 'base',
      name: 'Base',
      tagline: 'Get Started Free',
      price: { monthly: 0, annual: 0 },
      icon: Users,
      color: 'from-gray-400 to-gray-600',
      popular: false,
      features: {
        core: ['Basic meal logging', 'Water tracking', 'Weight tracking', 'Daily streaks'],
        ai: ['10 AI messages/day', 'Basic recommendations'],
        tracking: ['Manual food entry', 'Basic progress charts'],
        support: ['Email support', 'Knowledge base access'],
        gamification: ['Achievements', 'Basic leaderboard', 'XP system']
      }
    },
    {
      id: 'premium',
      name: 'Premium',
      tagline: 'Most Popular',
      price: { monthly: 9.99, annual: 99.99 },
      icon: Star,
      color: 'from-blue-500 to-purple-600',
      popular: true,
      features: {
        core: ['Everything in Base', 'Unlimited AI messages', 'Meal prep guides', 'Shopping lists'],
        ai: ['Unlimited AI assistance', 'Smart meal recommendations', 'Recipe suggestions'],
        tracking: ['Progress photos', 'Body measurements (11 points)', 'Weekly PDF reports', 'Trend predictions'],
        support: ['Priority email support', 'Live chat', '24-hour response'],
        gamification: ['All Base features', 'Exclusive badges', 'Premium challenges']
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'Advanced Features',
      price: { monthly: 19.99, annual: 199.99 },
      icon: Zap,
      color: 'from-orange-500 to-red-600',
      popular: false,
      features: {
        core: ['Everything in Premium', 'Wearable device sync', 'Video consultations', 'Meal timing optimization'],
        ai: ['Advanced AI analytics', 'Predictive insights', 'Correlation analysis'],
        tracking: ['Real-time calorie tracking', 'Sleep analysis', 'Heart rate zones', 'Advanced reports'],
        support: ['Priority phone support', 'Video support calls', '2-hour response'],
        gamification: ['All Premium features', 'Pro-only tournaments', 'Special rewards']
      }
    },
    {
      id: 'elite',
      name: 'Elite',
      tagline: 'VIP Experience',
      price: { monthly: 29.99, annual: 299.99 },
      icon: Crown,
      color: 'from-yellow-400 to-orange-500',
      popular: false,
      features: {
        core: ['Everything in Pro', 'Dedicated nutritionist', 'Monthly video calls', 'Custom meal plans'],
        ai: ['DNA-based nutrition', 'Genetic insights', 'Food sensitivity analysis', 'Optimal macros'],
        tracking: ['All Pro features', 'DNA upload & analysis', 'Genetic reports', 'Personalized optimization'],
        support: ['24/7 priority support', 'Dedicated account manager', 'Instant response'],
        gamification: ['All Pro features', 'Elite-only events', 'Masterclass access', 'VIP rewards']
      }
    }
  ];

  const allFeatures = [
    { category: 'Core Features', icon: Apple, features: [
      { name: 'Meal Logging', base: 'Basic', premium: 'Unlimited', pro: 'Unlimited', elite: 'Unlimited' },
      { name: 'AI Messages', base: '10/day', premium: 'Unlimited', pro: 'Unlimited', elite: 'Unlimited' },
      { name: 'Progress Tracking', base: true, premium: true, pro: true, elite: true },
      { name: 'Water Tracking', base: true, premium: true, pro: true, elite: true },
      { name: 'Meal Prep Guides', base: false, premium: true, pro: true, elite: true },
      { name: 'Shopping Lists', base: false, premium: true, pro: true, elite: true },
    ]},
    { category: 'Tracking & Analytics', icon: BarChart3, features: [
      { name: 'Progress Photos', base: false, premium: true, pro: true, elite: true },
      { name: 'Body Measurements', base: false, premium: '11 points', pro: '11 points', elite: '11 points' },
      { name: 'Weekly Reports', base: false, premium: 'PDF', pro: 'Advanced PDF', elite: 'Custom PDF' },
      { name: 'Wearable Sync', base: false, premium: false, pro: true, elite: true },
      { name: 'Real-time Tracking', base: false, premium: false, pro: true, elite: true },
      { name: 'DNA Analysis', base: false, premium: false, pro: false, elite: true },
    ]},
    { category: 'Support & Consultations', icon: MessageCircle, features: [
      { name: 'Email Support', base: 'Standard', premium: 'Priority', pro: 'Priority', elite: '24/7' },
      { name: 'Live Chat', base: false, premium: true, pro: true, elite: true },
      { name: 'Video Consultations', base: false, premium: false, pro: 'Unlimited', elite: 'Unlimited' },
      { name: 'Dedicated Nutritionist', base: false, premium: false, pro: false, elite: true },
      { name: 'Monthly Check-ins', base: false, premium: false, pro: false, elite: true },
    ]},
    { category: 'Premium Content', icon: BookOpen, features: [
      { name: 'Recipe Library', base: 'Basic', premium: 'Full', pro: 'Full', elite: 'Full + Exclusive' },
      { name: 'Masterclasses', base: false, premium: false, pro: false, elite: true },
      { name: 'Wellness Challenges', base: 'Public', premium: 'Premium', pro: 'Pro', elite: 'Elite' },
    ]},
  ];

  const handleSelectPlan = (tierId) => {
    if (tierId === 'base') {
      navigate('/signup');
    } else {
      navigate(`/pricing?plan=${tierId}`);
    }
  };

  const getSavingsPercentage = (tier) => {
    if (tier.price.monthly === 0) return 0;
    const monthlyCost = tier.price.monthly * 12;
    const annualCost = tier.price.annual;
    return Math.round(((monthlyCost - annualCost) / monthlyCost) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            billingPeriod === 'monthly'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod('annual')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
            billingPeriod === 'annual'
              ? 'bg-primary text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Annual
          <Badge className="absolute -top-2 -right-2 bg-green-600 text-white text-xs">
            Save 17%
          </Badge>
        </button>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards">Pricing Cards</TabsTrigger>
          <TabsTrigger value="table">Feature Table</TabsTrigger>
        </TabsList>

        {/* Cards View */}
        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              const isCurrentTier = currentTier === tier.id;
              const price = billingPeriod === 'monthly' ? tier.price.monthly : tier.price.annual;
              const savings = getSavingsPercentage(tier);

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${tier.popular ? 'md:scale-105 z-10' : ''}`}
                >
                  <Card className={`relative overflow-hidden h-full ${
                    tier.popular ? 'border-primary border-2 shadow-xl' : ''
                  } ${isCurrentTier ? 'ring-2 ring-green-500' : ''}`}>
                    {/* Popular Badge */}
                    {tier.popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-1 text-xs font-semibold">
                        MOST POPULAR
                      </div>
                    )}

                    {/* Current Tier Badge */}
                    {isCurrentTier && (
                      <div className="absolute top-0 left-0 bg-green-600 text-white px-4 py-1 text-xs font-semibold">
                        CURRENT PLAN
                      </div>
                    )}

                    <CardHeader className="text-center pt-8">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-1">{tier.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tier.tagline}</p>

                      <div className="mt-4">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">${price}</span>
                          {price > 0 && (
                            <span className="text-muted-foreground">
                              /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </div>
                        {billingPeriod === 'annual' && savings > 0 && (
                          <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                            Save {savings}%
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Core Features */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          CORE FEATURES
                        </p>
                        <ul className="space-y-2">
                          {tier.features.core.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 text-green-600`} />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Features */}
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          AI POWERED
                        </p>
                        <ul className="space-y-2">
                          {tier.features.ai.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleSelectPlan(tier.id)}
                        disabled={isCurrentTier}
                        className={`w-full mt-4 ${
                          tier.popular
                            ? `bg-gradient-to-r ${tier.color} text-white hover:opacity-90`
                            : ''
                        }`}
                        variant={tier.popular ? 'default' : 'outline'}
                      >
                        {isCurrentTier ? 'Current Plan' : tier.id === 'base' ? 'Get Started Free' : `Upgrade to ${tier.name}`}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="mt-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left font-semibold min-w-[200px]">Features</th>
                    {tiers.map(tier => (
                      <th key={tier.id} className="p-4 text-center font-semibold min-w-[120px]">
                        <div className="flex flex-col items-center gap-2">
                          <span>{tier.name}</span>
                          <span className="text-lg font-bold">
                            ${billingPeriod === 'monthly' ? tier.price.monthly : tier.price.annual}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFeatures.map((category, categoryIndex) => (
                    <React.Fragment key={categoryIndex}>
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="p-3 font-semibold flex items-center gap-2">
                          <category.icon className="w-4 h-4" />
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIndex) => (
                        <tr key={featureIndex} className="border-b hover:bg-muted/20">
                          <td className="p-4">{feature.name}</td>
                          {['base', 'premium', 'pro', 'elite'].map(tierId => {
                            const value = feature[tierId];
                            return (
                              <td key={tierId} className="p-4 text-center">
                                {value === true ? (
                                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                                ) : value === false ? (
                                  <X className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                                ) : (
                                  <span className="text-sm">{value}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* CTA Buttons Below Table */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {tiers.map(tier => (
              <Button
                key={tier.id}
                onClick={() => handleSelectPlan(tier.id)}
                disabled={currentTier === tier.id}
                className={tier.popular ? `bg-gradient-to-r ${tier.color} text-white` : ''}
                variant={tier.popular ? 'default' : 'outline'}
              >
                {currentTier === tier.id ? 'Current Plan' : tier.id === 'base' ? 'Get Started' : `Choose ${tier.name}`}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Trust Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-6 border-t">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Cancel anytime</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>14-day money-back guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Secure payment</span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Instant access</span>
        </div>
      </div>
    </div>
  );
};

export default FeatureComparison;
