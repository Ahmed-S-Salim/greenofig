import React from 'react';
import { Helmet } from 'react-helmet';
import SiteLayout from '@/components/SiteLayout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TermsOfServicePage = ({ logoUrl }) => {
  const { t } = useTranslation();

  return (
    <SiteLayout
      logoUrl={logoUrl}
      pageTitle={<>{t('terms.title').split(' ').slice(0, 2).join(' ')} <span className="gradient-text">{t('terms.title').split(' ')[2]}</span></>}
      pageDescription={t('terms.pageDescription')}
    >
      <Helmet>
        <title>{t('terms.title')} - GreenoFig</title>
        <meta name="description" content={t('terms.metaDescription')} />
        <link rel="canonical" href="https://greenofig.com/terms-of-service" />
        <meta property="og:title" content={`${t('terms.title')} - GreenoFig`} />
        <meta property="og:description" content={t('terms.metaDescription')} />
        <meta property="og:url" content="https://greenofig.com/terms-of-service" />
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
            <strong>{t('terms.lastUpdated')}</strong> {t('terms.lastUpdatedDate')}
          </p>
          <p className="text-text-secondary mb-4">
            Welcome to GreenoFig! These Terms of Service govern your use of our website, mobile applications, and services. By accessing or using GreenoFig, you agree to be bound by these terms.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="text-text-secondary">
            By creating an account and using GreenoFig services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
          <p className="text-text-secondary mb-4">
            You must be at least 18 years old to use GreenoFig services. By using our platform, you represent and warrant that:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>You are at least 18 years of age</li>
            <li>You have the legal capacity to enter into a binding agreement</li>
            <li>All information you provide is accurate and truthful</li>
            <li>You will comply with all applicable laws and regulations</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">3. Account Registration and Security</h2>
          <p className="text-text-secondary mb-4">
            To access certain features, you must create an account. You are responsible for:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized access</li>
            <li>Providing accurate and complete information</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">4. Subscription Plans and Payment</h2>
          <p className="text-text-secondary mb-4">
            GreenoFig offers various subscription plans:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Subscriptions renew automatically unless canceled</li>
            <li>Prices are subject to change with 30 days notice</li>
            <li>Refunds are provided according to our refund policy</li>
            <li>You are responsible for all applicable taxes</li>
            <li>Payment information is processed securely through third-party providers</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">5. Medical Disclaimer</h2>
          <p className="text-text-secondary mb-4">
            <strong>IMPORTANT:</strong> GreenoFig provides general health and wellness information for educational purposes only.
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Our services are NOT a substitute for professional medical advice, diagnosis, or treatment</li>
            <li>Always consult with qualified healthcare professionals before making health decisions</li>
            <li>AI-generated recommendations are based on general information and may not be suitable for everyone</li>
            <li>We are not responsible for any health outcomes resulting from using our services</li>
            <li>If you have a medical emergency, contact emergency services immediately</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">6. User Conduct and Prohibited Activities</h2>
          <p className="text-text-secondary mb-4">
            You agree NOT to:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload malicious code or viruses</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Use our services for commercial purposes without permission</li>
            <li>Share your account with others</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">7. Intellectual Property Rights</h2>
          <p className="text-text-secondary">
            All content, features, and functionality on GreenoFig, including text, graphics, logos, software, and AI-generated content, are owned by GreenoFig and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">8. Data Ownership and License</h2>
          <p className="text-text-secondary">
            You retain ownership of the personal information you provide. By using our services, you grant GreenoFig a license to use, process, and analyze your data to provide personalized recommendations and improve our services.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">9. Service Availability and Modifications</h2>
          <p className="text-text-secondary mb-4">
            We reserve the right to:
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li>Modify, suspend, or discontinue any aspect of our services</li>
            <li>Update features and functionality</li>
            <li>Change subscription pricing with notice</li>
            <li>Terminate accounts that violate these terms</li>
          </ul>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">10. Limitation of Liability</h2>
          <p className="text-text-secondary">
            To the maximum extent permitted by law, GreenoFig shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or health outcomes, arising from your use of our services.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">11. Indemnification</h2>
          <p className="text-text-secondary">
            You agree to indemnify and hold harmless GreenoFig, its affiliates, and employees from any claims, damages, losses, or expenses arising from your use of our services or violation of these terms.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">12. Termination</h2>
          <p className="text-text-secondary">
            We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use our services will cease immediately.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">13. Governing Law and Dispute Resolution</h2>
          <p className="text-text-secondary">
            These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms or your use of GreenoFig shall be resolved through binding arbitration.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">14. Changes to Terms</h2>
          <p className="text-text-secondary">
            We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through our platform. Your continued use of GreenoFig after changes take effect constitutes acceptance of the modified terms.
          </p>
        </div>

        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">15. Contact Information</h2>
          <p className="text-text-secondary">
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-text-secondary mt-4">
            <strong>Email:</strong> legal@greenofig.com<br />
            <strong>Address:</strong> GreenoFig Inc., Legal Department
          </p>
        </div>
      </motion.div>
    </SiteLayout>
  );
};

export default TermsOfServicePage;
