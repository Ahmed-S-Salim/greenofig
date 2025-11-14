import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import { Button } from '@/components/ui/button';
    import { CheckCircle, Loader2 } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import SiteLayout from '@/components/SiteLayout';
    import { toast } from '@/components/ui/use-toast';
    import { Helmet } from 'react-helmet';
    import { supabase } from '@/lib/customSupabaseClient';
    import CheckoutDialog from '@/components/CheckoutDialog';
    import { useAuth } from '@/contexts/SupabaseAuthContext';

    const PricingPage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const location = useLocation();
      const { t } = useTranslation();
      const { user } = useAuth();
      const [billingCycle, setBillingCycle] = useState('monthly');
      const [plans, setPlans] = useState([]);
      const [loading, setLoading] = useState(true);
      const [recommendedPlan, setRecommendedPlan] = useState(null);
      const [checkoutPlan, setCheckoutPlan] = useState(null);
      const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

      // Get translated plan description
      const getPlanDescription = (planName) => {
        const key = `pricing.planDescriptions.${planName}`;
        const translated = t(key);
        // If translation key doesn't exist, return empty string (fallback handled in JSX)
        return translated !== key ? translated : '';
      };

      // Plan-specific features using translation keys
      const planFeatures = {
        'Base': [
          t('pricing.planFeatures.base.adSupported'),
          t('pricing.planFeatures.base.mealPlans'),
          t('pricing.planFeatures.base.workoutPlans'),
          t('pricing.planFeatures.base.chatMessages'),
          t('pricing.planFeatures.base.basicTracking'),
          t('pricing.planFeatures.base.communityAccess'),
          t('pricing.planFeatures.base.mobileAccess'),
          t('pricing.planFeatures.base.smartLogging')
        ],
        'Premium': [
          t('pricing.planFeatures.premium.adFree'),
          t('pricing.planFeatures.premium.unlimitedMeals'),
          t('pricing.planFeatures.premium.unlimitedWorkouts'),
          t('pricing.planFeatures.premium.unlimitedChat'),
          t('pricing.planFeatures.premium.analytics'),
          t('pricing.planFeatures.premium.goalTracking'),
          t('pricing.planFeatures.premium.customPreferences'),
          t('pricing.planFeatures.premium.wearableSync'),
          t('pricing.planFeatures.premium.reports'),
          t('pricing.planFeatures.premium.communityAccess'),
          t('pricing.planFeatures.premium.mobileAccess')
        ],
        'Ultimate': [
          t('pricing.planFeatures.ultimate.everythingPremium'),
          t('pricing.planFeatures.ultimate.nutritionists'),
          t('pricing.planFeatures.ultimate.prioritySupport'),
          t('pricing.planFeatures.ultimate.videoConsultations'),
          t('pricing.planFeatures.ultimate.mealPlanningTools'),
          t('pricing.planFeatures.ultimate.workoutBuilder'),
          t('pricing.planFeatures.ultimate.performanceOptimization'),
          t('pricing.planFeatures.ultimate.bodyAnalysis'),
          t('pricing.planFeatures.ultimate.exclusiveChallenges')
        ],
        'Elite': [
          t('pricing.planFeatures.elite.everythingUltimate'),
          t('pricing.planFeatures.elite.photoRecognition'),
          t('pricing.planFeatures.elite.unlimitedCoaching'),
          t('pricing.planFeatures.elite.doctorConsultations'),
          t('pricing.planFeatures.elite.appointmentScheduling'),
          t('pricing.planFeatures.elite.priority247'),
          t('pricing.planFeatures.elite.supplementPlan'),
          t('pricing.planFeatures.elite.vipAccess'),
          t('pricing.planFeatures.elite.concierge')
        ]
      };

      useEffect(() => {
        if (location.state?.recommendedPlan) {
          setRecommendedPlan(location.state.recommendedPlan);
        }
      }, [location.state]);

      useEffect(() => {
        const fetchPlans = async () => {
          setLoading(true);
          const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });
          if (error) {
            toast({ title: "Error fetching pricing", description: error.message, variant: "destructive" });
          } else {
            setPlans(data);
          }
          setLoading(false);
        };
        fetchPlans();
      }, []);

      const handleChoosePlan = (plan) => {
        if (!user) {
          navigate('/signup', { state: { selectedPlan: plan.name } });
          return;
        }

        // If user is logged in, open checkout dialog
        setCheckoutPlan(plan);
        setIsCheckoutOpen(true);
      };
      
      const yearlySavePercent = 25; // Fixed 25% discount for yearly plans

      return (
        <SiteLayout
          logoUrl={logoUrl}
          pageTitle={<>{t('pricing.title')}</>}
          pageDescription={t('pricing.subtitle')}
        >
          <Helmet>
            <title>{t('pricing.title')} - GreenoFig</title>
            <meta name="description" content={t('pricing.subtitle')} />
            <link rel="canonical" href="https://greenofig.com/pricing" />
            <meta property="og:title" content={`${t('pricing.title')} - GreenoFig`} />
            <meta property="og:description" content={t('pricing.subtitle')} />
            <meta property="og:url" content="https://greenofig.com/pricing" />
            <meta property="og:type" content="website" />
          </Helmet>
          <div className="flex flex-col items-center">
            <div className="mb-12 flex items-center gap-2 glass-effect p-1 rounded-full" style={{
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            }}>
              <Button onClick={() => setBillingCycle('monthly')} variant={billingCycle === 'monthly' ? 'default' : 'ghost'} className="rounded-full px-6">{t('pricing.monthly')}</Button>
              <Button onClick={() => setBillingCycle('yearly')} variant={billingCycle === 'yearly' ? 'default' : 'ghost'} className="rounded-full px-6 relative">
                {t('pricing.yearly')}
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">{t('pricing.save25')}</span>
              </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="w-full space-y-8">
                {/* Free/Basic Plan - Full Width at Top */}
                {plans.filter(p => p.price_monthly === 0).map((plan) => {
                  const isRecommended = recommendedPlan === plan.name;
                  return (
                    <div
                      key={plan.id}
                      className={cn("card card-scale glass-effect p-6 rounded-xl border-2 relative max-w-2xl mx-auto animate-item",
                        isRecommended ? "border-primary ring-4 ring-primary/50" : "border-primary/50"
                      )}
                      style={{
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      }}
                    >
                      {isRecommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-primary-foreground bg-green-500 rounded-full">{t('pricing.popularChoice')}</div>}

                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-text-secondary text-sm mb-4">{getPlanDescription(plan.name) || plan.description}</p>
                        <div className="mb-4">
                          <span className="text-4xl font-extrabold">{t('pricing.freePlan')}</span>
                          <p className="text-text-secondary text-sm mt-1">{t('common.comingSoon')}</p>
                        </div>
                        <Button onClick={() => handleChoosePlan(plan)} size="default" className="px-8">
                          {t('common.getStarted')}
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 mt-4">
                        {(planFeatures[plan.name] || plan.features || []).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Paid Plans - Grid Below */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {plans.filter(p => p.price_monthly > 0).map((plan, i) => {
                  const isRecommended = recommendedPlan === plan.name;
                  return (
                    <div
                      key={plan.id}
                      className={cn("card card-scale glass-effect p-5 rounded-xl flex flex-col border-2 relative animate-item",
                        isRecommended ? "border-primary ring-4 ring-primary/50" : plan.is_popular ? "border-primary" : "border-border"
                      )}
                      style={{
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                    >
                      {isRecommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-primary-foreground bg-green-500 rounded-full">{t('pricing.popularChoice')}</div>}
                      {!isRecommended && plan.is_popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full">{t('pricing.mostPopular')}</div>}

                      <h3 className="text-xl font-bold text-center mb-1">{plan.name}</h3>
                      <p className="text-text-secondary text-center text-sm min-h-[35px] mb-4">{getPlanDescription(plan.name) || plan.description}</p>

                      <div className="text-center mb-4">
                          <span className="text-4xl font-extrabold">
                              {billingCycle === 'monthly'
                                  ? `$${plan.price_monthly}`
                                  : `$${(plan.price_yearly / 12).toFixed(2)}`
                              }
                          </span>
                          <span className="text-base font-medium text-text-secondary">{t('pricing.perMonth')}</span>
                          {billingCycle === 'yearly' && <p className="text-xs text-text-secondary mt-1">{t('pricing.billedYearly')} (${plan.price_yearly}{t('pricing.perYear')})</p>}
                      </div>

                      <div className="flex-grow">
                          <ul className="space-y-2">
                          {(planFeatures[plan.name] || plan.features || []).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                              </li>
                          ))}
                          </ul>
                      </div>

                      <Button onClick={() => handleChoosePlan(plan)} className={`w-full mt-5 ${isRecommended || plan.is_popular ? 'btn-primary' : 'btn-secondary'}`} variant={isRecommended || plan.is_popular ? 'default' : 'outline'}>
                          {t('pricing.selectPlan')}
                      </Button>
                    </div>
                  )
                })}
                </div>
                </div>
            )}
          </div>

          {/* Checkout Dialog */}
          <CheckoutDialog
            open={isCheckoutOpen}
            onOpenChange={setIsCheckoutOpen}
            plan={checkoutPlan}
            billingCycle={billingCycle}
          />
        </SiteLayout>
      );
    };

    export default PricingPage;