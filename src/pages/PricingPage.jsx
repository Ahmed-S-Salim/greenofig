import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
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
    import FloatingFruits from '@/components/ui/FloatingFruits';

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

        // If user is logged in, navigate to survey to collect health data
        navigate('/survey', { state: { selectedPlan: plan } });
      };
      
      const yearlySavePercent = 25; // Fixed 25% discount for yearly plans

      return (
        <SiteLayout
          logoUrl={logoUrl}
          pageTitle={<>Simple, Transparent <span className="gradient-text">Pricing</span></>}
          pageDescription="Choose the perfect plan to kickstart your health transformation. No hidden fees."
        >
          <FloatingFruits />
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
                <div className="w-full space-y-12">
                {/* Free/Basic Plan - Full Width at Top */}
                {plans.filter(p => p.price_monthly === 0).map((plan) => {
                  const isRecommended = recommendedPlan === plan.name;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className={cn("glass-effect p-10 rounded-2xl border-2 relative max-w-3xl mx-auto",
                        isRecommended ? "border-primary ring-4 ring-primary/50" : "border-primary/50"
                      )}
                      style={{
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                      }}
                    >
                      {isRecommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-primary-foreground bg-green-500 rounded-full">Recommended</div>}

                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold mb-3">{plan.name}</h3>
                        <p className="text-text-secondary text-lg mb-6">{plan.description}</p>
                        <div className="mb-6">
                          <span className="text-6xl font-extrabold">Free</span>
                          <p className="text-text-secondary mt-2">Forever</p>
                        </div>
                        <Button onClick={() => handleChoosePlan(plan)} size="lg" className="px-12">
                          Get Started Free
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-8">
                        {plan.features?.map(feature => (
                          <div key={feature} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Paid Plans - Grid Below */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {plans.filter(p => p.price_monthly > 0).map((plan, i) => {
                  const isRecommended = recommendedPlan === plan.name;
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.6 }}
                      className={cn("glass-effect p-8 rounded-2xl flex flex-col border-2 relative hover:shadow-xl hover:shadow-primary/10 transition-all duration-300",
                        isRecommended ? "border-primary ring-4 ring-primary/50" : plan.is_popular ? "border-primary" : "border-border"
                      )}
                      style={{
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                      }}
                    >
                      {isRecommended && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-primary-foreground bg-green-500 rounded-full">Recommended</div>}
                      {!isRecommended && plan.is_popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-primary-foreground bg-primary rounded-full">Most Popular</div>}

                      <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                      <p className="text-text-secondary text-center min-h-[40px] mb-6">{plan.description}</p>

                      <div className="text-center mb-8">
                          <span className="text-5xl font-extrabold">
                              {billingCycle === 'monthly'
                                  ? `$${plan.price_monthly}`
                                  : `$${(plan.price_yearly / 12).toFixed(2)}`
                              }
                          </span>
                          <span className="text-lg font-medium text-text-secondary">/month</span>
                          {billingCycle === 'yearly' && <p className="text-sm text-text-secondary">billed annually (${plan.price_yearly}/year)</p>}
                      </div>

                      <div className="flex-grow">
                          <ul className="space-y-4">
                          {plan.features?.map(feature => (
                              <li key={feature} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                              <span>{feature}</span>
                              </li>
                          ))}
                          </ul>
                      </div>

                      <Button onClick={() => handleChoosePlan(plan)} className="w-full mt-8" variant={isRecommended || plan.is_popular ? 'default' : 'outline'}>
                          Choose Plan
                      </Button>
                    </motion.div>
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