import React, { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const FaqPageContent = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('content')
                .eq('page_key', 'faq_page')
                .single();
            
            if (error) {
                toast({ title: 'Error fetching FAQs', description: error.message, variant: 'destructive' });
            } else if (data) {
                setFaqs(data.content.faqs || []);
            }
            setLoading(false);
        };
        fetchFaqs();
    }, []);

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
                <h2 className="text-2xl font-semibold">No FAQs Found.</h2>
                <p className="text-text-secondary mt-2">Check back soon or contact support if you have questions.</p>
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
    return (
        <SiteLayout
            logoUrl={logoUrl}
            pageTitle={<>Frequently Asked <span className="gradient-text">Questions</span></>}
            pageDescription="Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us."
        >
             <Helmet>
                <title>FAQ - GreenoFig</title>
                <meta name="description" content="Find answers to frequently asked questions about GreenoFig's services, plans, and features." />
                <link rel="canonical" href="https://greenofig.com/faq" />
                <meta property="og:title" content="FAQ - GreenoFig" />
                <meta property="og:description" content="Find answers to frequently asked questions about GreenoFig's services, plans, and features." />
                <meta property="og:url" content="https://greenofig.com/faq" />
                <meta property="og:type" content="website" />
            </Helmet>
            <FaqPageContent />
        </SiteLayout>
    );
};

export default FaqPage;