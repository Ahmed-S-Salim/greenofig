import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, Star, ShieldCheck, Dumbbell, Carrot, BrainCircuit } from 'lucide-react';
    import SiteLayout from '@/components/SiteLayout';

    const HomePage = ({ logoUrl }) => {
      const navigate = useNavigate();

      return (
        <SiteLayout logoUrl={logoUrl}>
          <section className="hero-section py-8 sm:py-12 lg:py-16 text-center">
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
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary">Simple, transparent pricing. Save 17% with any yearly plan!</p>
                    </div>
                    <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                      {[
                        { name: "Premium", price: 9.99, popular: true, features: ["Ad-Free Experience", "Unlimited Meal Plans", "Advanced Analytics"] },
                        { name: "Pro", price: 19.99, popular: false, features: ["Everything in Premium", "AI Coach Chat", "Wearable Integration"] },
                        { name: "Elite", price: 29.99, popular: false, features: ["Everything in Pro", "Photo Food Recognition", "Doctor Consultations"] },
                      ].map((plan, i) => (
                         <div
                            key={plan.name}
                            className={`card card-scale relative glass-effect p-8 rounded-2xl border-2 animate-item ${plan.popular ? 'border-primary' : 'border-border'}`}
                          >
                          {plan.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-primary-foreground bg-primary rounded-full">Most Popular</div>}
                          <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                          <p className="text-center text-4xl font-extrabold mb-4">${plan.price}<span className="text-lg font-medium text-text-secondary">/mo</span></p>
                          <ul className="space-y-3 mb-8">
                            {plan.features.map(f => <li key={f} className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-primary" /><span>{f}</span></li>)}
                          </ul>
                          <Button className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`} variant={plan.popular ? 'default' : 'outline'} onClick={() => navigate('/pricing')}>Choose {plan.name}</Button>
                         </div>
                      ))}
                    </div>
                    <div className="text-center mt-8">
                      <Button variant="link" onClick={() => navigate('/pricing')}>View All Plans & Features</Button>
                    </div>
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
      );
    };

    export default HomePage;