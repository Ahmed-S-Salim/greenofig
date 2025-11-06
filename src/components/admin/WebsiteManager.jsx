import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  ArrowLeft,
  Info,
  HelpCircle,
  Home,
  MessageSquare,
  Contact,
  TrendingUp,
  Shield,
  FileCheck
} from 'lucide-react';
import FeaturesManager from '@/components/admin/FeaturesManager';
import PricingManager from '@/components/admin/PricingManager';
import HomepageManager from '@/components/admin/HomepageManager';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import ContactInfoManager from '@/components/admin/ContactInfoManager';
import SEOManager from '@/components/admin/SEOManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import SiteContentManager from '@/components/admin/SiteContentManager';


const WebsiteManager = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeView, setActiveView] = useState('main');
    const [pageKey, setPageKey] = useState('');
    
    const handleUnimplemented = () => {
        toast({
          title: "🚧 Feature In-Progress!",
          description: "This content manager is under construction. You can ask me to build it next! 🚀",
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };
    
    const handleManagePage = (key) => {
        setPageKey(key);
        setActiveView('siteContent');
    }

    const renderContent = () => {
        switch (activeView) {
            case 'features':
                return <FeaturesManager />;
            case 'pricing':
                return <PricingManager />;
            case 'homepage':
                return <HomepageManager />;
            case 'testimonials':
                return <TestimonialsManager />;
            case 'contact':
                return <ContactInfoManager />;
            case 'seo':
                return <SEOManager />;
            case 'siteContent':
                return <SiteContentManager pageKey={pageKey} pageName={`${pageKey.charAt(0).toUpperCase() + pageKey.slice(1)} Page`} />;
            default:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Website Content Management</h2>
                                    <p className="text-xs sm:text-sm text-text-secondary mt-1">Update content across your public-facing website pages.</p>
                                </div>
                                <Button size="sm" className="h-9 px-3 text-sm" variant="ghost" onClick={() => navigate('/app/admin?tab=dashboard')}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <Home className="w-6 h-6 text-primary" />
                                        <span>Homepage</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Manage homepage sections, hero, CTAs, and content blocks.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setActiveView('homepage')}>Manage Homepage</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-primary" />
                                        <span>Features Page</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Manage the list of features displayed on the features page.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setActiveView('features')}>Manage Features</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <DollarSign className="w-6 h-6 text-primary" />
                                        <span>Pricing Page</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Update pricing plans, features, and popular status.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setActiveView('pricing')}>Manage Pricing</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <MessageSquare className="w-6 h-6 text-primary" />
                                        <span>Testimonials</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Manage customer reviews, ratings, and testimonials.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setActiveView('testimonials')}>Manage Testimonials</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <Contact className="w-6 h-6 text-primary" />
                                        <span>Contact Info</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Update contact details, social links, and business hours.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setActiveView('contact')}>Manage Contact</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                        <span>SEO Settings</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Manage meta tags, Open Graph, and SEO for all pages.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => setActiveView('seo')}>Manage SEO</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <Info className="w-6 h-6 text-primary" />
                                        <span>About Page</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Edit the content of the About Us page.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => handleManagePage('about_page')}>Manage About Page</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <HelpCircle className="w-6 h-6 text-primary" />
                                        <span>FAQ Page</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Add, edit, or remove FAQ items.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => handleManagePage('faq_page')}>Manage FAQs</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <Shield className="w-6 h-6 text-primary" />
                                        <span>Privacy Policy</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Edit Privacy Policy content and sections.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => handleManagePage('privacy_policy')}>Manage Privacy Policy</Button>
                                </CardContent>
                            </Card>

                            <Card className="glass-effect hover:border-primary/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <FileCheck className="w-6 h-6 text-primary" />
                                        <span>Terms of Service</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6">
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4">Edit Terms of Service content and sections.</p>
                                    <Button size="sm" className="h-9 px-3 text-sm" onClick={() => handleManagePage('terms_of_service')}>Manage Terms of Service</Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                );
        }
    };

    return (
        <motion.div
            key={activeView}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {activeView !== 'main' && (
                 <Button size="sm" className="h-9 px-3 text-sm" variant="ghost" onClick={() => setActiveView('main')} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Website Management
                </Button>
            )}
            {renderContent()}
        </motion.div>
    );
};

export default WebsiteManager;