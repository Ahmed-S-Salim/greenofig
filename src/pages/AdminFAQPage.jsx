import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Save, Loader2, ArrowLeft } from 'lucide-react';

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

const AdminFAQPage = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('page_key', 'faq_page')
      .single();

    if (error) {
      console.error('Error fetching FAQs:', error);
      // If no FAQs exist, use defaults
      setFaqs(defaultFAQs);
    } else {
      setFaqs(data.content.faqs || defaultFAQs);
    }
    setLoading(false);
  };

  const handleAddFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFAQ = (index) => {
    const newFaqs = faqs.filter((_, i) => i !== index);
    setFaqs(newFaqs);
  };

  const handleQuestionChange = (index, value) => {
    const newFaqs = [...faqs];
    newFaqs[index].question = value;
    setFaqs(newFaqs);
  };

  const handleAnswerChange = (index, value) => {
    const newFaqs = [...faqs];
    newFaqs[index].answer = value;
    setFaqs(newFaqs);
  };

  const handleSave = async () => {
    setSaving(true);

    const faqData = {
      page_key: 'faq_page',
      content: {
        faqs: faqs.filter(faq => faq.question && faq.answer)
      }
    };

    // Check if FAQ data exists
    const { data: existing } = await supabase
      .from('site_content')
      .select('*')
      .eq('page_key', 'faq_page')
      .single();

    let error;
    if (existing) {
      // Update existing
      const result = await supabase
        .from('site_content')
        .update(faqData)
        .eq('page_key', 'faq_page');
      error = result.error;
    } else {
      // Insert new
      const result = await supabase
        .from('site_content')
        .insert([faqData]);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error saving FAQs', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success!', description: 'FAQs saved successfully' });
      fetchFAQs();
    }

    setSaving(false);
  };

  const handleLoadDefaults = () => {
    setFaqs(defaultFAQs);
    toast({ title: 'Defaults loaded', description: '10 default FAQs loaded. Click Save to store them.' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Helmet>
        <title>Admin FAQ Management - GreenoFig</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">FAQ Management</h1>
            <p className="text-text-secondary mt-2">Manage frequently asked questions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleLoadDefaults} variant="outline">
              Load Default FAQs
            </Button>
            <Button onClick={handleAddFAQ} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save All
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-effect">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">FAQ #{index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFAQ(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    <Input
                      value={faq.question}
                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                      placeholder="Enter question..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Answer</label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      placeholder="Enter answer..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {faqs.length === 0 && (
          <Card className="glass-effect text-center p-12">
            <p className="text-text-secondary mb-4">No FAQs yet. Click "Add FAQ" or "Load Default FAQs" to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminFAQPage;
