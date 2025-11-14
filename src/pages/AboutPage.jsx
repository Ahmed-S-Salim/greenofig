import React, { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const AboutPageContent = () => {
    const { t } = useTranslation();
    const [pageContent, setPageContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('content, content_ar')
                .eq('page_key', 'about_page')
                .single();

            if (error) {
                toast({ title: t('about.errorFetchingContent'), description: error.message, variant: 'destructive' });
            } else if (data) {
                // Use Arabic content if language is Arabic and Arabic content exists
                const currentLang = localStorage.getItem('language') || 'en';
                const content = (currentLang === 'ar' && data.content_ar) ? data.content_ar : data.content;
                setPageContent(content);
            }
            setLoading(false);
        };
        fetchContent();
    }, [t]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!pageContent) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">{t('about.contentNotAvailable')}</h2>
                <p className="text-text-secondary mt-2">{t('about.checkBackLater')}</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
        >
            <motion.div variants={itemVariants} className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                    <span className="gradient-text">{pageContent.title}</span>
                </h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary">
                    {pageContent.description}
                </p>
            </motion.div>

            <div className="space-y-12">
                {pageContent.sections.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6 }}
                        className="glass-effect p-8 rounded-2xl"
                    >
                        <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                        <p className="text-text-secondary leading-relaxed">
                            {section.content}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};


const AboutPage = ({ logoUrl }) => {
    const { t } = useTranslation();
    return (
        <SiteLayout logoUrl={logoUrl}>
            <Helmet>
                <title>{t('about.title')} - GreenoFig</title>
                <meta name="description" content={t('about.metaDescription')} />
                <link rel="canonical" href="https://greenofig.com/about" />
                <meta property="og:title" content={`${t('about.title')} - GreenoFig`} />
                <meta property="og:description" content={t('about.metaDescription')} />
                <meta property="og:url" content="https://greenofig.com/about" />
                <meta property="og:type" content="website" />
            </Helmet>
            <AboutPageContent />
        </SiteLayout>
    );
};

export default AboutPage;