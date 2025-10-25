import React from 'react';
import { Helmet } from 'react-helmet';
import SiteLayout from '@/components/SiteLayout';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = ({ logoUrl }) => {
  return (
    <SiteLayout
      logoUrl={logoUrl}
      pageTitle={<>Privacy <span className="gradient-text">Policy</span></>}
      pageDescription="Learn how GreenoFig collects, uses, and protects your personal information."
    >
      <Helmet>
        <title>Privacy Policy - GreenoFig</title>
        <meta name="description" content="GreenoFig's privacy policy explains how we collect, use, and protect your personal information." />
        <link rel="canonical" href="https://greenofig.com/privacy-policy" />
        <meta property="og:title" content="Privacy Policy - GreenoFig" />
        <meta property="og:description" content="GreenoFig's privacy policy explains how we collect, use, and protect your personal information." />
        <meta property="og:url" content="https://greenofig.com/privacy-policy" />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="glass-effect p-8 rounded-2xl">
          <p className="text-text-secondary mb-4">
            <strong>Last Updated:</strong> October 24, 2025
          </p>
          <p className="text-text-secondary mb-4">
            At GreenoFig, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our website and services.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
          <p className="text-text-secondary mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Personal information (name, email address, phone number)</li>
            <li>Health and wellness data (dietary preferences, fitness goals, health metrics)</li>
            <li>Payment information (processed securely through third-party payment processors)</li>
            <li>Usage data (how you interact with our platform)</li>
            <li>Device information (IP address, browser type, operating system)</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
          <p className="text-text-secondary mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Provide and personalize our health and wellness services</li>
            <li>Generate AI-powered meal plans and fitness recommendations</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send important updates, notifications, and promotional materials</li>
            <li>Improve our services and develop new features</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">3. Information Sharing and Disclosure</h2>
          <p className="text-text-secondary mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Service providers who assist in operating our platform</li>
            <li>Payment processors for transaction processing</li>
            <li>AI service providers for generating personalized recommendations</li>
            <li>Legal authorities when required by law</li>
            <li>Healthcare professionals (only with your explicit consent)</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
          <p className="text-text-secondary">
            We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">5. Your Rights and Choices</h2>
          <p className="text-text-secondary mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Access, update, or delete your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Lodge a complaint with a data protection authority</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking Technologies</h2>
          <p className="text-text-secondary mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and deliver personalized content.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">What Are Cookies?</h3>
          <p className="text-text-secondary mb-4">
            Cookies are small text files stored on your device that help us remember your preferences and improve your experience on our platform.
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">Types of Cookies We Use:</h3>
          <div className="space-y-4 ml-4">
            <div>
              <p className="font-medium text-text-primary">Essential Cookies (Required)</p>
              <p className="text-text-secondary text-sm">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, authentication, and accessibility features. These cannot be disabled.
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">Functional Cookies</p>
              <p className="text-text-secondary text-sm">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and customized content.
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">Analytics Cookies</p>
              <p className="text-text-secondary text-sm">
                We use analytics tools to understand how visitors interact with our website, helping us improve our services. These cookies collect anonymous data about page visits, session duration, and user behavior.
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">Marketing Cookies</p>
              <p className="text-text-secondary text-sm">
                These cookies track your browsing habits to provide you with relevant advertisements and measure the effectiveness of our marketing campaigns.
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">Managing Your Cookie Preferences</h3>
          <p className="text-text-secondary mb-2">
            You can control and manage cookies in several ways:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Browser Settings: Most browsers allow you to refuse cookies or delete cookies already stored</li>
            <li>Third-party Tools: You can use browser extensions or privacy tools to manage cookies</li>
            <li>Opt-out Links: For marketing cookies, you can opt out through industry opt-out pages</li>
          </ul>
          <p className="text-text-secondary mt-4 text-sm italic">
            Please note that disabling certain cookies may affect the functionality of our website and limit your access to certain features.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
          <p className="text-text-secondary">
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
          <p className="text-text-secondary">
            We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">9. International Data Transfers</h2>
          <p className="text-text-secondary">
            Your information may be transferred to and processed in countries other than your country of residence. We ensure that all such transfers comply with applicable data protection laws and that your data receives adequate protection.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">10. GDPR Compliance (For EU Users)</h2>
          <p className="text-text-secondary mb-4">
            If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
            <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of your data ("right to be forgotten")</li>
            <li><strong>Right to Restrict Processing:</strong> You can limit how we use your data</li>
            <li><strong>Right to Data Portability:</strong> You can receive your data in a structured format</li>
            <li><strong>Right to Object:</strong> You can object to certain data processing activities</li>
          </ul>
          <p className="text-text-secondary mt-4">
            To exercise any of these rights, please contact us at privacy@greenofig.com
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">11. CCPA Rights (For California Users)</h2>
          <p className="text-text-secondary mb-4">
            If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li><strong>Right to Know:</strong> You can request what personal information we collect, use, and share</li>
            <li><strong>Right to Delete:</strong> You can request deletion of your personal information</li>
            <li><strong>Right to Opt-Out:</strong> You can opt-out of the sale of your personal information (Note: We do not sell personal information)</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
          </ul>
          <p className="text-text-secondary mt-4">
            To submit a request, email privacy@greenofig.com with "CCPA Request" in the subject line.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">12. Data Retention</h2>
          <p className="text-text-secondary">
            We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your data within 90 days, except where we are required to retain it by law.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">13. Contact Us</h2>
          <p className="text-text-secondary mb-4">
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
          </p>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-text-secondary">
              <strong>Email:</strong> <a href="mailto:privacy@greenofig.com" className="text-primary hover:underline">privacy@greenofig.com</a><br />
              <strong>Support:</strong> <a href="mailto:support@greenofig.com" className="text-primary hover:underline">support@greenofig.com</a><br />
              <strong>Address:</strong> GreenoFig Inc., Health & Wellness Division<br />
              <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 30 days
            </p>
          </div>
        </div>
      </motion.div>
    </SiteLayout>
  );
};

export default PrivacyPolicyPage;
