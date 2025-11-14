import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { useNavigate } from 'react-router-dom';
    import { useTranslation } from 'react-i18next';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, CheckCircle, Carrot, Dumbbell, BrainCircuit, Heart, Moon, Users, BarChart3, Camera, Watch, Loader2 } from 'lucide-react';
    import SiteLayout from '@/components/SiteLayout';
    import { supabase } from '@/lib/customSupabaseClient';
    import { toast } from '@/components/ui/use-toast';
    import * as LucideIcons from 'lucide-react';
    import FloatingFruits from '@/components/ui/FloatingFruits';

    const getIcon = (name) => {
        const Icon = LucideIcons[name];
        return Icon ? <Icon className="w-6 h-6 text-primary" /> : <CheckCircle className="w-6 h-6 text-primary" />;
    };

    const getCategoryIcon = (name) => {
      const Icon = LucideIcons[name];
      return Icon ? <Icon className="w-10 h-10 text-primary" /> : <Heart className="w-10 h-10 text-primary" />;
    };

    const FeaturesPage = ({ logoUrl }) => {
      const navigate = useNavigate();
      const { t } = useTranslation();
      const [featureCategories, setFeatureCategories] = useState([]);
      const [loading, setLoading] = useState(true);

      // Helper function to get localized content
      const getLocalizedContent = (item, field) => {
        if (!item) return '';
        const currentLang = localStorage.getItem('language') || 'en';
        const arField = `${field}_ar`;
        return (currentLang === 'ar' && item[arField]) ? item[arField] : item[field];
      };

      useEffect(() => {
        const fetchFeatures = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('features').select('*').order('display_order');
          if (error) {
            toast({ title: 'Error fetching features', description: error.message, variant: 'destructive' });
          } else {
            const grouped = data.reduce((acc, feature) => {
              const categoryKey = feature.category;
              if (!acc[categoryKey]) {
                acc[categoryKey] = {
                  category: feature.category,
                  category_ar: feature.category_ar,
                  icon: feature.category_icon,
                  features: []
                };
              }
              acc[categoryKey].features.push(feature);
              return acc;
            }, {});
            setFeatureCategories(Object.values(grouped));
          }
          setLoading(false);
        };
        fetchFeatures();
      }, []);

      const getPlanTag = (plan) => {
        const planLower = plan?.toLowerCase();
        let planKey;

        switch (planLower) {
          case "premium": planKey = 'pricing.premiumPlan'; break;
          case "pro": planKey = 'pricing.ultimatePlan'; break; // Map "Pro" to "Ultimate"
          case "elite": planKey = 'pricing.elitePlan'; break;
          case "ultimate": planKey = 'pricing.ultimatePlan'; break;
          case "free": planKey = 'pricing.freePlan'; break;
          case "basic": planKey = 'pricing.basicPlan'; break;
          default: planKey = 'pricing.basicPlan';
        }

        const planName = t(planKey);

        switch (planLower) {
          case "premium": return <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full">{planName}</span>;
          case "pro": return <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded-full">{planName}</span>; // Blue for Pro/Ultimate
          case "ultimate": return <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded-full">{planName}</span>;
          case "elite": return <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">{planName}</span>;
          case "basic": return <span className="bg-gray-500/20 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{planName}</span>;
          default: return <span className="bg-gray-500/20 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{planName}</span>;
        }
      }

      return (
        <>
          <FloatingFruits />
          <SiteLayout
            logoUrl={logoUrl}
            pageTitle={<>{t('features.title')}</>}
            pageDescription={t('features.subtitle')}
          >
          <Helmet>
            <title>{t('features.title')} - GreenoFig</title>
            <meta name="description" content={t('features.subtitle')} />
            <link rel="canonical" href="https://greenofig.com/features" />
            <meta property="og:title" content={`${t('features.title')} - GreenoFig`} />
            <meta property="og:description" content={t('features.subtitle')} />
            <meta property="og:url" content="https://greenofig.com/features" />
            <meta property="og:type" content="website" />
            <meta name="robots" content="index, follow" />
          </Helmet>
           {loading ? (
             <div className="flex flex-col justify-center items-center min-h-[50vh]" role="status" aria-live="polite">
               <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
               <p className="mt-4 text-text-secondary">{t('common.loading')}</p>
               <span className="sr-only">{t('common.loading')}</span>
             </div>
           ) : (
             <div className="space-y-20">
               {featureCategories.map((category, catIndex) => (
                 <div
                   key={category.category}
                   className="page-section"
                 >
                   <div className="flex items-center gap-4 mb-8 section-content">
                     {getCategoryIcon(category.icon)}
                     <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                       <span className="gradient-text">{getLocalizedContent(category, 'category')}</span>
                     </h2>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                     {category.features.map((feature, featIndex) => (
                       <div
                         key={feature.name}
                         className="card card-scale glass-effect p-6 rounded-2xl flex flex-col animate-item"
                         role="article"
                         aria-label={`${feature.name} feature`}
                       >
                         <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                             <div aria-hidden="true">{getIcon(feature.feature_icon)}</div>
                             <h3 className="text-xl font-bold">{getLocalizedContent(feature, 'name')}</h3>
                           </div>
                           {getPlanTag(feature.plan_tier)}
                         </div>
                         <p className="text-text-secondary flex-grow">{getLocalizedContent(feature, 'description')}</p>
                       </div>
                     ))}
                   </div>
                 </div>
               ))}
               {featureCategories.length === 0 && (
                <div className="text-center py-20 glass-effect rounded-2xl p-12" role="status">
                    <div className="mb-6 flex justify-center">
                      <Heart className="w-20 h-20 text-primary/50" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">{t('common.comingSoon')}</h2>
                    <p className="text-text-secondary">{t('features.subtitle')}</p>
                </div>
               )}

               <section className="page-section py-24 text-center">
                   <div className="container mx-auto px-4 sm:px-6 lg:px-8 glass-effect p-12 rounded-2xl section-content">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        <span className="gradient-text">{t('home.cta.title')}</span>
                      </h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary mb-8">{t('home.cta.subtitle')}</p>
                      <Button size="lg" onClick={() => navigate('/pricing')} className="btn-primary" aria-label="Navigate to pricing page">
                         {t('pricing.viewAllPlans') || t('home.pricing.viewAllPlans')} <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                      </Button>
                   </div>
               </section>
             </div>
           )}
        </SiteLayout>
        </>
      );
    };

    export default FeaturesPage;