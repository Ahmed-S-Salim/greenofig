import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Trash2, Download } from 'lucide-react';

const defaultFAQs = [
  {
    question: 'What is GreenoFig and how does it work?',
    answer: 'GreenoFig is an AI-powered health and wellness platform that creates personalized meal plans, workout routines, and provides 24/7 AI coaching. Simply complete our onboarding survey, and our AI will generate a customized plan based on your goals, dietary preferences, and fitness level.'
  },
  {
    question: 'How much does GreenoFig cost?',
    answer: 'We offer three subscription tiers: Premium ($9.99/month), Pro ($19.99/month), and Elite ($29.99/month). All plans include access to personalized meal plans and workouts. Higher tiers unlock features like AI coach chat, wearable integration, and photo food recognition. Save 25% with annual billing!'
  },
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes! You can cancel your GreenoFig subscription at any time from your account settings. There are no cancellation fees, and you\'ll continue to have access until the end of your current billing period.'
  },
  {
    question: 'Is GreenoFig suitable for people with dietary restrictions?',
    answer: 'Absolutely! GreenoFig supports various dietary preferences including vegan, vegetarian, keto, paleo, gluten-free, dairy-free, and more. During onboarding, you can specify your dietary restrictions and food allergies, and our AI will create meal plans that fit your needs.'
  },
  {
    question: 'Do I need special equipment for the workout plans?',
    answer: 'No special equipment is required! Our AI generates workout plans based on what you have available. During setup, you can specify if you have access to a gym, home equipment, or prefer bodyweight exercises only. The AI adapts accordingly.'
  },
  {
    question: 'How does the AI coach work?',
    answer: 'Our AI coach (available in Pro and Elite plans) is available 24/7 to answer questions, provide motivation, and help you stay on track. You can chat about nutrition, workouts, progress, or general health questions. The AI learns from your interactions to provide increasingly personalized guidance.'
  },
  {
    question: 'Can I sync GreenoFig with my fitness tracker or smartwatch?',
    answer: 'Yes! Pro and Elite plans include wearable integration. GreenoFig syncs with popular devices like Apple Watch, Fitbit, Garmin, and more. This allows us to track your activity, calories burned, and sleep patterns to optimize your personalized plan.'
  },
  {
    question: 'What makes GreenoFig different from other health apps?',
    answer: 'GreenoFig combines advanced AI with comprehensive wellness features. Unlike basic calorie counters or generic workout apps, we provide hyper-personalized meal plans, adaptive workouts, 24/7 AI coaching, and real-time plan adjustments based on your progress. Everything is tailored specifically to you.'
  },
  {
    question: 'Is my health data secure and private?',
    answer: 'Yes, your privacy is our top priority. We use industry-standard encryption to protect your data. We never sell your personal information to third parties. All health data is stored securely and used only to personalize your experience. See our Privacy Policy for full details.'
  },
  {
    question: 'How quickly will I see results?',
    answer: 'Results vary based on your goals and commitment, but most users report feeling more energized within the first week and seeing physical changes within 2-4 weeks. Our AI tracks your progress and adjusts your plan to ensure steady, sustainable results. Consistency is key!'
  }
];

const SiteContentManager = ({ pageKey, pageName }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchContent = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('site_content').select('content').eq('page_key', pageKey).single();
        if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
            toast({ title: `Error fetching ${pageName} content`, description: error.message, variant: "destructive" });
        } else {
            if (pageKey === 'faq_page') {
                setContent(data?.content || { faqs: [] });
            } else if (pageKey === 'privacy_policy' || pageKey === 'terms_of_service') {
                setContent(data?.content || { sections: [] });
            } else if (pageKey === 'about_page') {
                setContent(data?.content || { title: '', description: '', sections: [] });
            } else {
                setContent(data?.content || {});
            }
        }
        setLoading(false);
    }, [pageKey, pageName]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleSave = async () => {
        console.log('Saving content:', { page_key: pageKey, content });

        const { data, error } = await supabase.from('site_content').upsert({ page_key: pageKey, content }, { onConflict: 'page_key' }).select();

        if (error) {
            console.error('Save error:', error);
            toast({
                title: `Error saving ${pageName} content`,
                description: `${error.message} (Code: ${error.code})`,
                variant: "destructive"
            });
        } else {
            console.log('Save successful:', data);
            toast({ title: `${pageName} content saved successfully` });
        }
    };

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...content.faqs];
        newFaqs[index][field] = value;
        setContent({ ...content, faqs: newFaqs });
    };

    const addFaq = () => {
        setContent({ ...content, faqs: [...(content.faqs || []), { question: '', answer: '' }] });
    };

    const removeFaq = (index) => {
        const newFaqs = content.faqs.filter((_, i) => i !== index);
        setContent({ ...content, faqs: newFaqs });
    };

    const handleAboutChange = (field, value) => {
        setContent(prev => ({...prev, [field]: value}));
    }

    const handleSectionChange = (index, field, value) => {
        const newSections = [...(content.sections || [])];
        newSections[index][field] = value;
        setContent({ ...content, sections: newSections });
    };

    const addSection = () => {
        setContent({ ...content, sections: [...(content.sections || []), { title: '', content: '' }] });
    };

    const removeSection = (index) => {
        const newSections = (content.sections || []).filter((_, i) => i !== index);
        setContent({ ...content, sections: newSections });
    };

    const loadDefaultFAQs = () => {
        setContent({ faqs: defaultFAQs });
        toast({
            title: '✅ 10 Default FAQs loaded!',
            description: '⚠️ IMPORTANT: Click "Save Content" button now to store them in the database!',
            duration: 10000
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-4 text-lg">Loading Content...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">
                    {pageKey === 'faq_page' ? 'FAQ Page Manager' :
                     pageKey === 'about_page' ? 'About Us Page Manager' :
                     pageKey === 'privacy_policy' ? 'Privacy Policy Manager' :
                     pageKey === 'terms_of_service' ? 'Terms of Service Manager' :
                     `Manage ${pageName}`}
                </h2>
                <div className="flex gap-2">
                    {pageKey === 'faq_page' && (
                        <Button onClick={loadDefaultFAQs} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Load 10 Default FAQs
                        </Button>
                    )}
                    <Button onClick={handleSave}>Save Content</Button>
                </div>
            </div>
            
            {pageKey === 'about_page' && (
                <div className="space-y-4">
                    <Card className="glass-effect p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="about-title">Page Title</Label>
                            <Input id="about-title" value={content?.title || ''} onChange={(e) => handleAboutChange('title', e.target.value)} placeholder="e.g., About GreenoFig" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="about-description">Page Description</Label>
                            <Textarea id="about-description" value={content?.description || ''} onChange={(e) => handleAboutChange('description', e.target.value)} rows={3} placeholder="Brief description that appears below the title" />
                        </div>
                    </Card>

                    <div className="glass-effect p-4 rounded-lg">
                        <p className="text-text-secondary">
                            <strong>Total Sections:</strong> {content?.sections?.length || 0}
                        </p>
                    </div>

                    {content?.sections?.map((section, index) => (
                        <Card key={index} className="glass-effect">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary">Section #{index + 1}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeSection(index)} className="text-red-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`about-section-title-${index}`}>Section Title</Label>
                                    <Input id={`about-section-title-${index}`} value={section.title} onChange={(e) => handleSectionChange(index, 'title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`about-section-content-${index}`}>Section Content</Label>
                                    <Textarea id={`about-section-content-${index}`} value={section.content} onChange={(e) => handleSectionChange(index, 'content', e.target.value)} rows={6} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Button onClick={addSection} variant="outline">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Section
                    </Button>
                </div>
            )}

            {pageKey === 'faq_page' && (
                <div className="space-y-4">
                    <div className="glass-effect p-4 rounded-lg">
                        <p className="text-text-secondary">
                            <strong>Total FAQs:</strong> {content?.faqs?.length || 0}
                        </p>
                    </div>
                    {content?.faqs?.map((faq, index) => (
                        <Card key={index} className="glass-effect">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary">FAQ #{index + 1}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeFaq(index)} className="text-red-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`question-${index}`}>Question</Label>
                                    <Input id={`question-${index}`} value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`answer-${index}`}>Answer</Label>
                                    <Textarea id={`answer-${index}`} value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)} rows={4} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                     <Button onClick={addFaq} variant="outline">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add FAQ
                    </Button>
                </div>
            )}

            {(pageKey === 'privacy_policy' || pageKey === 'terms_of_service') && (
                <div className="space-y-4">
                    <div className="glass-effect p-4 rounded-lg">
                        <p className="text-text-secondary">
                            <strong>Total Sections:</strong> {content?.sections?.length || 0}
                        </p>
                    </div>
                    {content?.sections?.map((section, index) => (
                        <Card key={index} className="glass-effect">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-primary">Section #{index + 1}</span>
                                    <Button variant="ghost" size="icon" onClick={() => removeSection(index)} className="text-red-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`section-title-${index}`}>Section Title</Label>
                                    <Input id={`section-title-${index}`} value={section.title} onChange={(e) => handleSectionChange(index, 'title', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`section-content-${index}`}>Section Content</Label>
                                    <Textarea id={`section-content-${index}`} value={section.content} onChange={(e) => handleSectionChange(index, 'content', e.target.value)} rows={6} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <Button onClick={addSection} variant="outline">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Section
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SiteContentManager;