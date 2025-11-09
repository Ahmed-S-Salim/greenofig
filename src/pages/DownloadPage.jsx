import React from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Apple, Download, Smartphone, Star, CheckCircle, Carrot, Dumbbell, BrainCircuit, Camera, TrendingUp, Clock } from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';

const DownloadPage = ({ logoUrl }) => {
  const features = [
    { icon: Carrot, title: "AI Meal Plans", description: "Personalized nutrition tailored to your goals" },
    { icon: Dumbbell, title: "Custom Workouts", description: "Exercise routines that adapt to your progress" },
    { icon: BrainCircuit, title: "24/7 AI Coach", description: "Your personal health companion" },
    { icon: Camera, title: "Food Recognition", description: "Snap photos to log meals instantly" },
    { icon: TrendingUp, title: "Progress Tracking", description: "Watch your transformation in real-time" },
    { icon: Clock, title: "Smart Reminders", description: "Never miss a meal or workout" }
  ];

  const screenshots = [
    { title: "Dashboard", description: "Track your daily health metrics", color: "from-green-500 to-emerald-600" },
    { title: "Meal Plans", description: "Delicious recipes personalized for you", color: "from-blue-500 to-cyan-600" },
    { title: "Workouts", description: "Exercise plans that work", color: "from-purple-500 to-pink-600" },
    { title: "AI Coach", description: "Chat with your personal coach", color: "from-orange-500 to-red-600" }
  ];

  return (
    <SiteLayout
      logoUrl={logoUrl}
      pageTitle={<>Download <span className="gradient-text">GreenoFig</span></>}
      pageDescription="Get the app on iOS and start your health journey today"
    >
      <Helmet>
        <title>Download GreenoFig - iOS & Android App</title>
        <meta name="description" content="Download GreenoFig app for iOS and Android. Your AI-powered health companion for personalized nutrition and fitness coaching." />
        <link rel="canonical" href="https://greenofig.com/download" />
        <meta property="og:title" content="Download GreenoFig App" />
        <meta property="og:description" content="Get the GreenoFig app on iOS and Android for personalized health coaching." />
        <meta property="og:url" content="https://greenofig.com/download" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="space-y-20">
        {/* Download Buttons Section */}
        <section className="page-section text-center">
          <div className="section-content glass-effect p-12 rounded-2xl max-w-4xl mx-auto">
            <div className="mb-8">
              <img src={logoUrl} alt="GreenoFig Logo" className="w-24 h-24 mx-auto mb-4 rounded-3xl shadow-2xl" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get GreenoFig Today</h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Transform your health with AI-powered coaching. Available now on iOS, coming soon to Android.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* iOS Download */}
              <div className="animate-item">
                <Button
                  size="lg"
                  className="btn-primary w-full h-20 text-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white shadow-xl"
                  onClick={() => window.open('https://testflight.apple.com', '_blank')}
                >
                  <Apple className="w-8 h-8 mr-3" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="text-xl font-bold">App Store</div>
                  </div>
                </Button>
                <p className="text-xs text-text-secondary mt-2">iOS 14.0 or later</p>
              </div>

              {/* Android Download */}
              <div className="animate-item">
                <Button
                  size="lg"
                  className="btn-primary w-full h-20 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-xl"
                  onClick={() => window.open('https://play.google.com', '_blank')}
                >
                  <Smartphone className="w-8 h-8 mr-3" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <div className="text-xl font-bold">Google Play</div>
                  </div>
                </Button>
                <p className="text-xs text-text-secondary mt-2">Android 8.0 or later</p>
              </div>
            </div>

            {/* Beta Testing Notice */}
            <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Download className="w-5 h-5" />
                <span className="font-semibold">Join Beta Testing</span>
              </div>
              <p className="text-sm text-text-secondary">
                Want early access? Install directly on your iPhone using TestFlight.
                <button className="text-primary hover:underline ml-1">Contact us for invite</button>
              </p>
            </div>
          </div>
        </section>

        {/* App Preview Section */}
        <section className="page-section">
          <div className="section-content text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              A sneak peek at what awaits you inside the app
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {screenshots.map((screenshot, index) => (
              <div
                key={screenshot.title}
                className="card card-scale glass-effect rounded-2xl overflow-hidden group cursor-pointer animate-item"
              >
                {/* Mock Screenshot */}
                <div className={`h-96 bg-gradient-to-br ${screenshot.color} relative flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-white text-center p-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Smartphone className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{screenshot.title}</h3>
                    <p className="text-sm opacity-90">{screenshot.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="page-section">
          <div className="section-content text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Everything you need to achieve your health goals in one app
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card card-scale glass-effect p-6 rounded-2xl animate-item"
              >
                <div className="inline-block p-4 bg-primary/10 rounded-xl mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="page-section">
          <div className="section-content text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Thousands</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
              <span className="text-2xl font-bold ml-2">4.9</span>
            </div>
            <p className="text-text-secondary text-lg">Based on 10,000+ reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah L.", review: "GreenoFig changed my life! Lost 20 pounds and feel amazing.", rating: 5 },
              { name: "Mike T.", review: "Best health app I've ever used. The AI coach is incredible!", rating: 5 },
              { name: "Jessica P.", review: "So easy to use and the results speak for themselves!", rating: 5 }
            ].map((review, index) => (
              <div
                key={review.name}
                className="card card-scale glass-effect p-6 rounded-2xl animate-item"
              >
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-secondary mb-4">"{review.review}"</p>
                <p className="font-bold">- {review.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="page-section text-center">
          <div className="section-content glass-effect p-12 rounded-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Health?</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Join thousands of users who have already started their journey to a healthier life
            </p>
            <Button size="lg" className="btn-primary">
              <Download className="w-6 h-6 mr-2" />
              Download Now
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default DownloadPage;
