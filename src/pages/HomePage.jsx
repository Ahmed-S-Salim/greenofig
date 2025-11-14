import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Star, ShieldCheck, Dumbbell, Carrot, BrainCircuit, CheckCircle, Loader2 } from 'lucide-react';
    import SiteLayout from '@/components/SiteLayout';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import CheckoutDialog from '@/components/CheckoutDialog';
    import { cn } from '@/lib/utils';

    const HomePage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const { t } = useTranslation();
      const { user } = useAuth();
      const [plans, setPlans] = useState([]);
      const [loadingPlans, setLoadingPlans] = useState(true);
      const [checkoutPlan, setCheckoutPlan] = useState(null);
      const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
      const [currentSlide, setCurrentSlide] = useState(0);

      // Hero slideshow images
      const heroImages = [
        { url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1920&h=1080&fit=crop", alt: "Fresh fruits and healthy food arrangement" },
        { url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&h=1080&fit=crop", alt: "Fresh vegetables and produce" },
        { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop", alt: "Healthy salad bowl with fresh ingredients" },
        { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop", alt: "Person exercising and working out" },
        { url: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&h=1080&fit=crop", alt: "Colorful fresh fruits" },
        { url: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=1920&h=1080&fit=crop", alt: "Nutritionist consultation session" },
        { url: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1920&h=1080&fit=crop", alt: "Meal planning and healthy eating" },
        { url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&h=1080&fit=crop", alt: "Female fitness coach training with client" }
      ];

      // Plan-specific features matching the PricingPage (showing key highlights)
      const planFeatures = {
        'Premium': [
          t('pricing.planFeatures.premium.adFree'),
          t('pricing.planFeatures.premium.unlimitedMeals'),
          t('pricing.planFeatures.premium.unlimitedWorkouts'),
          t('pricing.planFeatures.premium.analytics')
        ],
        'Ultimate': [
          t('pricing.planFeatures.ultimate.everythingPremium'),
          t('pricing.planFeatures.ultimate.nutritionists'),
          t('pricing.planFeatures.ultimate.videoConsultations'),
          t('pricing.planFeatures.ultimate.workoutBuilder')
        ],
        'Elite': [
          t('pricing.planFeatures.elite.everythingUltimate'),
          t('pricing.planFeatures.elite.photoRecognition'),
          t('pricing.planFeatures.elite.doctorConsultations'),
          t('pricing.planFeatures.elite.appointmentScheduling')
        ]
      };

      // Auto-advance slideshow
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 4000); // Change slide every 4 seconds

        return () => clearInterval(interval);
      }, []);

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
                        <span className="gradient-text">{t('home.hero.title')}</span>
                      </h1>
                      <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary mb-8">
                        {t('home.hero.subtitle')}
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button size="lg" onClick={() => navigate('/survey')} className="btn-primary">
                          {t('home.hero.getStarted')} <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/features')} className="btn-secondary">
                          {t('home.hero.learnMore')}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-10 animate-item">
                      <div className="relative glass-effect rounded-2xl shadow-2xl p-2 max-w-6xl mx-auto overflow-hidden">
                        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-xl">
                          {/* Slideshow Images */}
                          {heroImages.map((image, index) => (
                            <div
                              key={index}
                              className={`absolute inset-0 transition-opacity duration-1000 ${
                                index === currentSlide ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              <img
                                className="w-full h-full object-cover object-center"
                                alt={image.alt}
                                src={image.url}
                              />
                            </div>
                          ))}

                          {/* Navigation Dots */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {heroImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                  index === currentSlide
                                    ? 'bg-primary w-8'
                                    : 'bg-white/50 hover:bg-white/80'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="page-section py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.features.title')}</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">{t('home.features.subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {[
                        { icon: Carrot, title: t('home.features.aiMealPlans'), text: t('home.features.aiMealPlansDesc') },
                        { icon: Dumbbell, title: t('home.features.personalizedWorkouts'), text: t('home.features.personalizedWorkoutsDesc') },
                        { icon: BrainCircuit, title: t('home.features.aiCoach'), text: t('home.features.aiCoachDesc') }
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

                <section className="page-section py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.pricing.title')}</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">{t('home.pricing.subtitle')}</p>
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
                                  {t('home.pricing.mostPopular')}
                                </div>
                              )}
                              <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                              <p className="text-center text-4xl font-extrabold mb-4">
                                ${plan.price_monthly}
                                <span className="text-lg font-medium text-text-secondary">{t('home.pricing.perMonth')}</span>
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
                                {t('home.pricing.choosePlan')} {plan.name}
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="text-center mt-8">
                          <Button variant="link" onClick={() => navigate('/pricing')}>{t('home.pricing.viewAllPlans')}</Button>
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className="page-section py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.howItWorks.title')}</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">{t('home.howItWorks.subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                      {[
                        { num: "01", title: t('home.howItWorks.step1Title'), text: t('home.howItWorks.step1Text') },
                        { num: "02", title: t('home.howItWorks.step2Title'), text: t('home.howItWorks.step2Text') },
                        { num: "03", title: t('home.howItWorks.step3Title'), text: t('home.howItWorks.step3Text') },
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

                <section className="page-section py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.reviews.title')}</h2>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8">
                      {[
                        { name: t('home.reviews.author1'), review: t('home.reviews.review1'), rating: 5 },
                        { name: t('home.reviews.author2'), review: t('home.reviews.review2'), rating: 5 },
                        { name: t('home.reviews.author3'), review: t('home.reviews.review3'), rating: 5 },
                      ].map((review, i) => (
                        <div
                          key={i}
                          className="card card-scale glass-effect p-8 rounded-2xl animate-item"
                        >
                          <div className="flex items-center mb-4">
                            {Array(review.rating).fill(0).map((_, j) => <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />)}
                          </div>
                          <p className="mb-4 text-text-secondary">"{review.review}"</p>
                          <p className="font-bold text-right">- {review.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="page-section py-16 text-center">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 glass-effect p-12 rounded-2xl section-content">
                     <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('home.cta.title')}</h2>
                     <p className="max-w-xl mx-auto mt-4 text-text-secondary mb-8">{t('home.cta.subtitle')}</p>
                     <Button size="lg" onClick={() => navigate('/survey')} className="btn-primary">
                        {t('home.cta.button')} <ArrowRight className="ml-2 w-5 h-5" />
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