import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import { useTranslation } from 'react-i18next';
    import SiteLayout from '@/components/SiteLayout';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { Send, Mail, MessageSquare, User } from 'lucide-react';
    import { AdContainer } from '@/components/ads';

    const ContactPage = ({ logoUrl }) => {
      const { t } = useTranslation();

      const handleSubmit = (e) => {
        e.preventDefault();
        toast({
          title: t('contact.messageSent'),
          description: t('contact.demoMessage'),
        });
        e.target.reset();
      };

      return (
        <SiteLayout
          logoUrl={logoUrl}
          pageTitle={<>{t('contact.title')}</>}
          pageDescription={t('contact.pageDescription')}
        >
          <Helmet>
            <title>{t('contact.title')} - GreenoFig</title>
            <meta name="description" content={t('contact.metaDescription')} />
            <link rel="canonical" href="https://greenofig.com/contact" />
            <meta property="og:title" content={`${t('contact.title')} - GreenoFig`} />
            <meta property="og:description" content={t('contact.metaDescription')} />
            <meta property="og:url" content="https://greenofig.com/contact" />
            <meta property="og:type" content="website" />
            <meta name="robots" content="index, follow" />
          </Helmet>
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Contact form">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-text-secondary mb-2">{t('contact.fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" aria-hidden="true" />
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-primary/50"
                      placeholder={t('contact.namePlaceholder')}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-text-secondary mb-2">{t('contact.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" aria-hidden="true" />
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-primary/50"
                      placeholder={t('contact.emailPlaceholder')}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-text-secondary mb-2">{t('contact.message')}</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-primary pointer-events-none" aria-hidden="true" />
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-primary/50 resize-none"
                      placeholder={t('contact.messagePlaceholder')}
                      required
                      aria-required="true"
                    ></textarea>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg py-3" aria-label="Send contact message">
                  {t('contact.send')} <Send className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Ad placement at bottom of contact page */}
          <div className="max-w-4xl mx-auto mt-12">
            <AdContainer placementName="contact_banner" />
          </div>
        </SiteLayout>
      );
    };

    export default ContactPage;