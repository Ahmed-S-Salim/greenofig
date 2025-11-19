import React, { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const FaqPageContent = () => {
    const { t, i18n } = useTranslation();
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('content, content_ar')
                .eq('page_key', 'faq_page')
                .single();

            if (error) {
                toast({ title: t('faq.errorFetching'), description: error.message, variant: 'destructive' });
            } else if (data) {
                // Use Arabic content if language is Arabic and Arabic content exists
                const currentLang = i18n.language;
                const content = (currentLang === 'ar' && data.content_ar) ? data.content_ar : data.content;
                setFaqs(content.faqs || []);
            }
            setLoading(false);
        };
        fetchFaqs();
    }, [t, i18n.language]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (faqs.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-semibold">{t('faq.noFaqsFound')}</h2>
                <p className="text-text-secondary mt-2">{t('faq.checkBackSoon')}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-3xl mx-auto"
        >
            <Accordion type="single" collapsible className="w-full space-y-4">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="glass-effect rounded-lg border-border px-6">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-text-secondary text-base">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </motion.div>
    );
};

const FaqPage = ({ logoUrl }) => {
    const { t } = useTranslation();
    return (
        <SiteLayout
            logoUrl={logoUrl}
            pageTitle={<>{t('faq.title')}</>}
            pageDescription={t('faq.pageDescription')}
        >
             <Helmet>
                <title>{t('faq.title')} - GreenoFig</title>
                <meta name="description" content={t('faq.metaDescription')} />
                <link rel="canonical" href="https://greenofig.com/faq" />
                <meta property="og:title" content={`${t('faq.title')} - GreenoFig`} />
                <meta property="og:description" content={t('faq.metaDescription')} />
                <meta property="og:url" content="https://greenofig.com/faq" />
                <meta property="og:type" content="website" />
            </Helmet>
            <FaqPageContent />
        </SiteLayout>
    );
};

export default FaqPage;