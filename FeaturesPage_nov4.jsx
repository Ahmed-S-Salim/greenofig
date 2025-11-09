import React, { useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { ArrowRight, CheckCircle, Carrot, Dumbbell, BrainCircuit, Heart, Moon, Users, BarChart3, Camera, Watch, Loader2 } from 'lucide-react';
    import SiteLayout from '@/components/SiteLayout';
    import { supabase } from '@/lib/customSupabaseClient';
    import { toast } from '@/components/ui/use-toast';
    import * as LucideIcons from 'lucide-react';

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
      const [featureCategories, setFeatureCategories] = useState([]);
      const [loading, setLoading] = useState(true);
      
      useEffect(() => {
        const fetchFeatures = async () => {
          setLoading(true);
          const { data, error } = await supabase.from('features').select('*').order('display_order');
          if (error) {
            toast({ title: 'Error fetching features', description: error.message, variant: 'destructive' });
          } else {
            const grouped = data.reduce((acc, feature) => {
              if (!acc[feature.category]) {
                acc[feature.category] = { category: feature.category, icon: feature.category_icon, features: [] };
              }
              acc[feature.category].features.push(feature);
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
        switch (planLower) {
          case "premium": return <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full">{plan}</span>;
          case "pro": return <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded-full">{plan}</span>;
          case "elite": return <span className="bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">{plan}</span>;
          default: return <span className="bg-gray-500/20 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">{plan || 'Basic'}</span>;
        }
      }

      return (
        <SiteLayout
          logoUrl={logoUrl}
          pageTitle={<>A Symphony of <span className="gradient-text">Intelligent Features</span></>}
          pageDescription="Explore the tools designed to make your health journey effective, enjoyable, and uniquely yours."
        >
          <Helmet>
            <title>Features - GreenoFig</title>
            <meta name="description" content="Discover GreenoFig's powerful AI-driven features for personalized health, nutrition, and fitness coaching." />
            <link rel="canonical" href="https://greenofig.com/features" />
            <meta property="og:title" content="Features - GreenoFig" />
            <meta property="og:description" content="Discover GreenoFig's powerful AI-driven features for personalized health, nutrition, and fitness coaching." />
            <meta property="og:url" content="https://greenofig.com/features" />
            <meta property="og:type" content="website" />
            <meta name="robots" content="index, follow" />
          </Helmet>
           {loading ? (
             <div className="flex flex-col justify-center items-center min-h-[50vh]" role="status" aria-live="polite">
               <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
               <p className="mt-4 text-text-secondary">Loading features...</p>
               <span className="sr-only">Loading features, please wait</span>
             </div>
           ) : (
             <div className="space-y-20">
               {featureCategories.map((category) => (
                 <motion.div
                   key={category.category}
                   initial={{ opacity: 0, y: 50 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, amount: 0.3 }}
                   transition={{ duration: 0.6, ease: "easeOut" }}
                 >
                   <div className="flex items-center gap-4 mb-8">
                     {getCategoryIcon(category.icon)}
                     <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{category.category}</h2>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                     {category.features.map((feature, featIndex) => (
                       <motion.div
                         key={feature.name}
                         initial={{ opacity: 0, y: 20 }}
                         whileInView={{ opacity: 1, y: 0 }}
                         viewport={{ once: true, amount: 0.5 }}
                         transition={{ duration: 0.6, ease: "easeOut" }}
                         className="glass-effect p-6 rounded-2xl flex flex-col hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                         role="article"
                         aria-label={`${feature.name} feature`}
                       >
                         <div className="flex justify-between items-start mb-3">
                           <div className="flex items-center gap-3">
                             <div aria-hidden="true">{getIcon(feature.feature_icon)}</div>
                             <h3 className="text-xl font-bold">{feature.name}</h3>
                           </div>
                           {getPlanTag(feature.plan_tier)}
                         </div>
                         <p className="text-text-secondary flex-grow">{feature.description}</p>
                       </motion.div>
                     ))}
                   </div>
                 </motion.div>
               ))}
               {featureCategories.length === 0 && (
                <div className="text-center py-20 glass-effect rounded-2xl p-12" role="status">
                    <div className="mb-6 flex justify-center">
                      <Heart className="w-20 h-20 text-primary/50" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Features Coming Soon!</h2>
                    <p className="text-text-secondary">Our team is hard at work. Check back soon for exciting new features.</p>
                </div>
               )}

               <section className="py-24 text-center">
                   <div className="container mx-auto px-4 sm:px-6 lg:px-8 glass-effect p-12 rounded-2xl">
                      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to Experience the Future of Health?</h2>
                      <p className="max-w-xl mx-auto mt-4 text-text-secondary mb-8">Choose a plan that fits your life and start your journey to a better you.</p>
                      <Button size="lg" onClick={() => navigate('/pricing')} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" aria-label="Navigate to pricing page">
                         View Plans & Pricing <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                      </Button>
                   </div>
               </section>
             </div>
           )}
        </SiteLayout>
      );
    };

    export default FeaturesPage;