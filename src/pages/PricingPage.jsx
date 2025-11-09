import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
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
      const { user } = useAuth();
      const [billingCycle, setBillingCycle] = useState('monthly');
      const [plans, setPlans] = useState([]);
      const [loading, setLoading] = useState(true);
      const [recommendedPlan, setRecommendedPlan] = useState(null);
      const [checkoutPlan, setCheckoutPlan] = useState(null);
      const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

      // Plan-specific features matching the feature access control system
      const planFeatures = {
        'Base': [
          '⚠️ Ad-supported experience',
          '2 AI meal plans per month',
          '2 AI workout plans per month',
          '10 AI chat messages per month',
          'Basic progress tracking',
          'Community access',
          'Mobile app access',
          'Smart meal logging'
        ],
        'Premium': [
          '✨ Ad-free experience',
          'Unlimited AI meal plans',
          'Unlimited AI workout plans',
          'Unlimited AI chat support',
          'Advanced progress analytics',
          'Goal tracking & insights',
          'Custom meal preferences',
          'Wearable device sync',
          'Weekly & monthly reports',
          'Community access',
          'Mobile app access'
        ],
        'Ultimate': [
          '✨ Everything in Premium',
          'Access to certified nutritionists',
          'Priority customer support',
          'Video consultations (2/month)',
          'Advanced meal planning tools',
          'Custom workout builder',
          'Performance optimization',
          'Body composition analysis',
          'Exclusive challenges'
        ],
        'Elite': [
          '✨ Everything in Ultimate',
          '📸 Photo food recognition & logging',
          'Unlimited video coaching',
          'Doctor consultations (2/month)',
          'Priority 24/7 support',
          'Personalized supplement plan',
          'VIP community access',
          'Concierge service'
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
          pageTitle={<>Simple, Transparent <span className="gradient-text">Pricing</span></>}
          pageDescription="Choose the perfect plan to kickstart your health transformation. No hidden fees."
        >
          <Helmet>
            <title>Pricing - GreenoFig</title>
            <meta name="description" content="Explore GreenoFig's flexible pricing plans and find the perfect fit for your health and wellness journey." />
            <link rel="canonical" href="https://greenofig.com/pricing" />
            <meta property="og:title" content="Pricing - GreenoFig" />
            <meta property="og:description" content="Explore GreenoFig's flexible pricing plans and find the perfect fit for your health and wellness journey." />
            <meta property="og:url" content="https://greenofig.com/pricing" />
            <meta property="og:type" content="website" />
          </Helmet>
          <div className="flex flex-col items-center">
            <div className="mb-12 flex items-center gap-2 glass-effect p-1 rounded-full" style={{
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            }}>
              <Button onClick={() => setBillingCycle('monthly')} variant={billingCycle === 'monthly' ? 'default' : 'ghost'} className="rounded-full px-6">Monthly</Button>
              <Button onClick={() => setBillingCycle('yearly')} variant={billingCycle === 'yearly' ? 'default' : 'ghost'} className="rounded-full px-6 relative">
                Yearly
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-0.5 rounded-full">Save {yearlySavePercent}%</span>
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
                      {isRecommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-primary-foreground bg-green-500 rounded-full">Recommended</div>}

                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-text-secondary text-sm mb-4">{plan.description}</p>
                        <div className="mb-4">
                          <span className="text-4xl font-extrabold">Free</span>
                          <p className="text-text-secondary text-sm mt-1">Forever</p>
                        </div>
                        <Button onClick={() => handleChoosePlan(plan)} size="default" className="px-8">
                          Get Started Free
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
                      {isRecommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-primary-foreground bg-green-500 rounded-full">Recommended</div>}
                      {!isRecommended && plan.is_popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold text-primary-foreground bg-primary rounded-full">Most Popular</div>}

                      <h3 className="text-xl font-bold text-center mb-1">{plan.name}</h3>
                      <p className="text-text-secondary text-center text-sm min-h-[35px] mb-4">{plan.description}</p>

                      <div className="text-center mb-4">
                          <span className="text-4xl font-extrabold">
                              {billingCycle === 'monthly'
                                  ? `$${plan.price_monthly}`
                                  : `$${(plan.price_yearly / 12).toFixed(2)}`
                              }
                          </span>
                          <span className="text-base font-medium text-text-secondary">/month</span>
                          {billingCycle === 'yearly' && <p className="text-xs text-text-secondary mt-1">billed annually (${plan.price_yearly}/year)</p>}
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
                          Choose Plan
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