import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Star, ShieldCheck, Dumbbell, Carrot, BrainCircuit, CheckCircle, Loader2 } from 'lucide-react';
    import SiteLayout from '@/components/SiteLayout';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import CheckoutDialog from '@/components/CheckoutDialog';
    import { cn } from '@/lib/utils';

    const HomePage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const { user } = useAuth();
      const [plans, setPlans] = useState([]);
      const [loadingPlans, setLoadingPlans] = useState(true);
      const [checkoutPlan, setCheckoutPlan] = useState(null);
      const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

      // Plan-specific features matching the PricingPage
      const planFeatures = {
        'Premium': [
          '✨ Ad-free experience',
          'Unlimited AI meal plans',
          'Unlimited AI workout plans',
          'Advanced progress analytics'
        ],
        'Ultimate': [
          '✨ Everything in Premium',
          'AI Coach Chat',
          'Wearable device sync',
          'Video consultations'
        ],
        'Elite': [
          '✨ Everything in Ultimate',
          '📸 Photo food recognition',
          'Doctor consultations',
          'Priority 24/7 support'
        ]
      };

      useEffect(() => {
        const fetchPlans = async () => {
          setLoadingPlans(true);
          const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .gt('price_monthly', 0)
            .order('price_monthly', { ascending: true });
          if (!error && data) {
            setPlans(data);
          }
          setLoadingPlans(false);
        };
        fetchPlans();
      }, []);

      const handleChoosePlan = (plan) => {
        if (!user) {
          navigate('/signup', { state: { selectedPlan: plan.name } });
          return;
        }
        setCheckoutPlan(plan);
        setIsCheckoutOpen(true);
      };

      return (
        <>
        <SiteLayout logoUrl={logoUrl}>
          <section className="hero-section text-center">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="hero-content">
                      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                        Your AI-Powered <span className="gradient-text">Health Companion</span>
                      </h1>
                      <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-8">
                        Achieve your wellness goals with hyper-personalized nutrition, fitness, and lifestyle coaching. All powered by cutting-edge AI.
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/survey')} className="btn-primary">
                          Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/features')} className="btn-secondary">
                          Explore Features
                        </Button>
                      </div>
                    </div>
                    <div className="mt-10 animate-item">
                      <div className="relative glass-effect rounded-2xl shadow-2xl p-2 max-w-6xl mx-auto img-zoom">
                        <div className="w-full h-64 md:h-80 overflow-hidden rounded-xl">
                          <img className="w-full h-full object-cover object-center" alt="Fresh fruits and healthy food arrangement" src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1920&h=1080&fit=crop" />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="page-section py-8">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Transform Your Health Journey</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">Unlock your full potential with our suite of intelligent features.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        { icon: Carrot, title: "AI Meal Plans", text: "Get delicious, easy-to-make meal plans tailored to your goals and dietary preferences." },
                        { icon: Dumbbell, title: "Personalized Workouts", text: "Custom-built exercise routines that adapt to your progress and keep you challenged." },
                        { icon: BrainCircuit, title: "Your AI Coach", text: "24/7 guidance and motivation from your personal AI health companion." }
                      ].map((feat, i) => (
                        <div
                          key={i}
                          className="card card-scale glass-effect p-8 rounded-2xl text-center animate-item"
                        >
                          <div className="inline-block p-4 bg-primary/10 rounded-xl mb-4">
                            <feat.icon className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                          <p className="text-text-secondary">{feat.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="page-section py-8">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose Your Perfect Plan</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">Simple, transparent pricing. Save 25% with any yearly plan!</p>
                    </div>
                    {loadingPlans ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
                          {plans.map((plan, i) => (
                            <div
                              key={plan.id}
                              className={cn("card card-scale relative glass-effect p-8 rounded-2xl border-2 animate-item flex flex-col",
                                plan.is_popular ? 'border-primary' : 'border-border'
                              )}
                              style={{
                                backdropFilter: 'blur(20px) saturate(180%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                              }}
                            >
                              {plan.is_popular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-primary-foreground bg-primary rounded-full">
                                  Most Popular
                                </div>
                              )}
                              <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                              <p className="text-center text-4xl font-extrabold mb-4">
                                ${plan.price_monthly}
                                <span className="text-lg font-medium text-text-secondary">/mo</span>
                              </p>
                              <ul className="space-y-3 mb-8 flex-grow">
                                {(planFeatures[plan.name] || []).map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="text-sm">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                              <Button
                                className={`w-full mt-auto ${plan.is_popular ? 'btn-primary' : 'btn-secondary'}`}
                                variant={plan.is_popular ? 'default' : 'outline'}
                                onClick={() => handleChoosePlan(plan)}
                              >
                                Choose {plan.name}
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="text-center mt-8">
                          <Button variant="link" onClick={() => navigate('/pricing')}>View All Plans & Features</Button>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className="page-section py-8">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How It Works</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">Start your transformation in three simple steps.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                      {[
                        { num: "01", title: "Tell Us Your Goals", text: "Complete a quick survey to help our AI understand you." },
                        { num: "02", title: "Get Your Personalized Plan", text: "Receive your unique fitness and nutrition plan instantly." },
                        { num: "03", title: "Achieve Your Best Self", text: "Track your progress, adapt, and reach your wellness goals." },
                      ].map((step, i) => (
                        <div
                          key={i}
                          className="card card-rotate glass-effect p-8 rounded-2xl animate-item"
                        >
                          <h3 className="text-6xl font-extrabold gradient-text mb-4">{step.num}</h3>
                          <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                          <p className="text-text-secondary">{step.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="page-section py-8">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by users worldwide</h2>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                      {[
                        { name: "Sarah L.", review: "GreenoFig changed my life. I've lost 20 pounds and have never felt more energetic. The AI coach is like having a personal cheerleader!", rating: 5 },
                        { name: "Mike T.", review: "As a busy professional, the meal plans are a lifesaver. Healthy eating has never been so easy and delicious.", rating: 5 },
                        { name: "Jessica P.", review: "I love how it syncs with my watch. Seeing all my health data in one place is incredibly motivating. Highly recommend!", rating: 5 },
                      ].map((t, i) => (
                        <div
                          key={i}
                          className="card card-scale glass-effect p-8 rounded-2xl animate-item"
                        >
                          <div className="flex items-center mb-4">
                            {Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />)}
                          </div>
                          <p className="mb-4 text-text-secondary">"{t.review}"</p>
                          <p className="font-bold text-right">- {t.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="page-section py-8 text-center">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 glass-effect p-12 rounded-2xl section-content">
                     <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Transform Your Health?</h2>
                     <p className="max-w-xl mx-auto mt-4 text-text-secondary mb-8">Join thousands of users who are already on their journey to a healthier, happier life.</p>
                     <Button size="lg" onClick={() => navigate('/survey')} className="btn-primary">
                        Get Started Today <ArrowRight className="ml-2 w-5 h-5" />
                     </Button>
                  </div>
                </section>
        </SiteLayout>

        {/* Checkout Dialog */}
        <CheckoutDialog
          open={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
          plan={checkoutPlan}
          billingCycle="monthly"
        />
      </>
      );
    };

    export default HomePage;