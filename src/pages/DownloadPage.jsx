import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Apple, Download, Smartphone, Star, CheckCircle, Carrot, Dumbbell, BrainCircuit, Camera, TrendingUp, Clock } from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';

const DownloadPage = ({ logoUrl }) => {
  const { t } = useTranslation();
  const features = [
    { icon: Carrot, title: t('download.appFeatures.aiMealPlans'), description: t('download.appFeatures.aiMealPlansDesc') },
    { icon: Dumbbell, title: t('download.appFeatures.customWorkouts'), description: t('download.appFeatures.customWorkoutsDesc') },
    { icon: BrainCircuit, title: t('download.appFeatures.aiCoach247'), description: t('download.appFeatures.aiCoach247Desc') },
    { icon: Camera, title: t('download.appFeatures.foodRecognition'), description: t('download.appFeatures.foodRecognitionDesc') },
    { icon: TrendingUp, title: t('download.appFeatures.progressTracking'), description: t('download.appFeatures.progressTrackingDesc') },
    { icon: Clock, title: t('download.appFeatures.smartReminders'), description: t('download.appFeatures.smartRemindersDesc') }
  ];

  const screenshots = [
    { title: t('download.screenshots.dashboard'), description: t('download.screenshots.dashboardDesc'), color: "from-green-500 to-emerald-600" },
    { title: t('download.screenshots.mealPlans'), description: t('download.screenshots.mealPlansDesc'), color: "from-blue-500 to-cyan-600" },
    { title: t('download.screenshots.workouts'), description: t('download.screenshots.workoutsDesc'), color: "from-purple-500 to-pink-600" },
    { title: t('download.screenshots.aiCoach'), description: t('download.screenshots.aiCoachDesc'), color: "from-orange-500 to-red-600" }
  ];

  return (
    <SiteLayout
      logoUrl={logoUrl}
      pageTitle={
        <>
          Download <span className="gradient-text">GreenoFig</span>
        </>
      }
      pageDescription={t('download.subtitle')}
    >
      <Helmet>
        <title>{t('download.title')} - GreenoFig</title>
        <meta name="description" content={t('download.subtitle')} />
        <link rel="canonical" href="https://greenofig.com/download" />
        <meta property="og:title" content={`${t('download.title')} - GreenoFig`} />
        <meta property="og:description" content={t('download.subtitle')} />
        <meta property="og:url" content="https://greenofig.com/download" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="space-y-20">
        {/* Download Buttons Section */}
        <section className="page-section text-center">
          <div className="section-content glass-effect p-12 rounded-2xl max-w-4xl mx-auto">
            <div className="mb-8">
              <img src={logoUrl} alt="GreenoFig Logo" className="w-24 h-24 mx-auto mb-4 rounded-3xl shadow-2xl" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Get <span className="gradient-text">GreenoFig</span> Today
              </h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                {t('download.appDescription')}
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
                    <div className="text-xs opacity-80">{t('download.downloadIOS')}</div>
                  </div>
                </Button>
                <p className="text-xs text-text-secondary mt-2">{t('download.iosVersion')}</p>
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
                    <div className="text-xs opacity-80">{t('download.downloadAndroid')}</div>
                  </div>
                </Button>
                <p className="text-xs text-text-secondary mt-2">{t('download.androidVersion')}</p>
              </div>
            </div>

            {/* Beta Testing Notice */}
            <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Download className="w-5 h-5" />
                <span className="font-semibold">{t('download.joinBeta')}</span>
              </div>
              <p className="text-sm text-text-secondary">
                {t('download.betaDescription')}
                <button className="text-primary hover:underline ml-1">{t('download.contactInvite')}</button>
              </p>
            </div>
          </div>
        </section>

        {/* App Preview Section */}
        <section className="page-section">
          <div className="section-content text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('download.seeInAction')}</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              {t('download.sneakPeek')}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('download.powerfulFeatures')}</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              {t('download.featuresDescription')}
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('download.lovedByThousands')}</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
              ))}
              <span className="text-2xl font-bold ml-2">{t('download.rating')}</span>
            </div>
            <p className="text-text-secondary text-lg">{t('download.basedOnReviews')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah L.", review: t('download.userReviews.review1'), rating: 5 },
              { name: "Mike T.", review: t('download.userReviews.review2'), rating: 5 },
              { name: "Jessica P.", review: t('download.userReviews.review3'), rating: 5 }
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('download.readyToTransform')}</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              {t('download.joinThousands')}
            </p>
            <Button size="lg" className="btn-primary">
              <Download className="w-6 h-6 mr-2" />
              {t('download.downloadNow')}
            </Button>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default DownloadPage;
