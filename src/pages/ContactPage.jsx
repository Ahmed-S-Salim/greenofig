import React from 'react';
    import { Helmet } from 'react-helmet';
    import { motion } from 'framer-motion';
    import SiteLayout from '@/components/SiteLayout';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { Send, Mail, MessageSquare, User } from 'lucide-react';

    const ContactPage = ({ logoUrl }) => {
      const handleSubmit = (e) => {
        e.preventDefault();
        toast({
          title: "Message Sent! (Just Kidding 😉)",
          description: "This is a demo, but in a real app, your message would be on its way!",
        });
        e.target.reset();
      };

      return (
        <SiteLayout
          logoUrl={logoUrl}
          pageTitle={<>Get In <span className="gradient-text">Touch</span></>}
          pageDescription="Have questions or feedback? We'd love to hear from you. Reach out and we'll get back to you shortly."
        >
          <Helmet>
            <title>Contact Us - GreenoFig</title>
            <meta name="description" content="Get in touch with the GreenoFig team. We're here to answer your questions and help with your health journey." />
            <link rel="canonical" href="https://greenofig.com/contact" />
            <meta property="og:title" content="Contact Us - GreenoFig" />
            <meta property="og:description" content="Get in touch with the GreenoFig team. We're here to answer your questions and help with your health journey." />
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
                  <label htmlFor="contact-name" className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" aria-hidden="true" />
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-primary/50"
                      placeholder="John Doe"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none" aria-hidden="true" />
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-primary/50"
                      placeholder="you@example.com"
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-text-secondary mb-2">Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-4 w-5 h-5 text-primary pointer-events-none" aria-hidden="true" />
                    <textarea
                      id="contact-message"
                      name="message"
                      rows="5"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 hover:border-primary/50 resize-none"
                      placeholder="Your message..."
                      required
                      aria-required="true"
                    ></textarea>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg py-3" aria-label="Send contact message">
                  Send Message <Send className="w-4 h-4 ml-2" aria-hidden="true" />
                </Button>
              </form>
            </motion.div>
          </div>
        </SiteLayout>
      );
    };

    export default ContactPage;