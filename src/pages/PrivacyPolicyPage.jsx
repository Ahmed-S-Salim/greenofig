import React from 'react';
import { Helmet } from 'react-helmet';
import SiteLayout from '@/components/SiteLayout';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PrivacyPolicyPage = ({ logoUrl }) => {
  const { t } = useTranslation();

  return (
    <SiteLayout
      logoUrl={logoUrl}
      pageTitle={<>{t('privacy.title').split(' ')[0]} <span className="gradient-text">{t('privacy.title').split(' ')[1]}</span></>}
      pageDescription={t('privacy.pageDescription')}
    >
      <Helmet>
        <title>{t('privacy.title')} - GreenoFig</title>
        <meta name="description" content={t('privacy.metaDescription')} />
        <link rel="canonical" href="https://greenofig.com/privacy-policy" />
        <meta property="og:title" content={`${t('privacy.title')} - GreenoFig`} />
        <meta property="og:description" content={t('privacy.metaDescription')} />
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
        {/* Introduction */}
        <div className="glass-effect p-8 rounded-2xl">
          <p className="text-text-secondary mb-4">
            <strong>{t('privacy.lastUpdated')}</strong> {t('privacy.lastUpdatedDate')}
          </p>
          <p className="text-text-secondary mb-4">
            {t('privacy.intro')}
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section1.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section1.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            {t('privacy.section1.items', { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section2.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section2.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            {t('privacy.section2.items', { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 3: Information Sharing and Disclosure */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section3.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section3.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            {t('privacy.section3.items', { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 4: Data Security */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section4.title')}</h2>
          <p className="text-text-secondary">
            {t('privacy.section4.content')}
          </p>
        </div>

        {/* Section 5: Your Rights and Choices */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section5.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section5.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            {t('privacy.section5.items', { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* Section 6: Cookies and Tracking Technologies */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section6.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section6.intro')}
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.section6.whatAreCookies.title')}</h3>
          <p className="text-text-secondary mb-4">
            {t('privacy.section6.whatAreCookies.content')}
          </p>

          <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.section6.typesTitle')}</h3>
          <div className="space-y-4 ml-4">
            <div>
              <p className="font-medium text-text-primary">{t('privacy.section6.types.essential.title')}</p>
              <p className="text-text-secondary text-sm">
                {t('privacy.section6.types.essential.content')}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">{t('privacy.section6.types.functional.title')}</p>
              <p className="text-text-secondary text-sm">
                {t('privacy.section6.types.functional.content')}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">{t('privacy.section6.types.analytics.title')}</p>
              <p className="text-text-secondary text-sm">
                {t('privacy.section6.types.analytics.content')}
              </p>
            </div>

            <div>
              <p className="font-medium text-text-primary">{t('privacy.section6.types.marketing.title')}</p>
              <p className="text-text-secondary text-sm">
                {t('privacy.section6.types.marketing.content')}
              </p>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-3 mt-6">{t('privacy.section6.managing.title')}</h3>
          <p className="text-text-secondary mb-2">
            {t('privacy.section6.managing.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            {t('privacy.section6.managing.items', { returnObjects: true }).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className="text-text-secondary mt-4 text-sm italic">
            {t('privacy.section6.managing.note')}
          </p>
        </div>

        {/* Section 7: Children's Privacy */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section7.title')}</h2>
          <p className="text-text-secondary">
            {t('privacy.section7.content')}
          </p>
        </div>

        {/* Section 8: Changes to This Policy */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section8.title')}</h2>
          <p className="text-text-secondary">
            {t('privacy.section8.content')}
          </p>
        </div>

        {/* Section 9: International Data Transfers */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section9.title')}</h2>
          <p className="text-text-secondary">
            {t('privacy.section9.content')}
          </p>
        </div>

        {/* Section 10: GDPR Compliance */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section10.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section10.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li><strong>{t('privacy.section10.rights.access').split(':')[0]}:</strong> {t('privacy.section10.rights.access').split(': ')[1]}</li>
            <li><strong>{t('privacy.section10.rights.rectification').split(':')[0]}:</strong> {t('privacy.section10.rights.rectification').split(': ')[1]}</li>
            <li><strong>{t('privacy.section10.rights.erasure').split(':')[0]}:</strong> {t('privacy.section10.rights.erasure').split(': ')[1]}</li>
            <li><strong>{t('privacy.section10.rights.restrict').split(':')[0]}:</strong> {t('privacy.section10.rights.restrict').split(': ')[1]}</li>
            <li><strong>{t('privacy.section10.rights.portability').split(':')[0]}:</strong> {t('privacy.section10.rights.portability').split(': ')[1]}</li>
            <li><strong>{t('privacy.section10.rights.object').split(':')[0]}:</strong> {t('privacy.section10.rights.object').split(': ')[1]}</li>
          </ul>
          <p className="text-text-secondary mt-4">
            {t('privacy.section10.contact')}
          </p>
        </div>

        {/* Section 11: CCPA Rights */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section11.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section11.intro')}
          </p>
          <ul className="list-disc list-inside text-text-secondary space-y-2 ml-4">
            <li><strong>{t('privacy.section11.rights.know').split(':')[0]}:</strong> {t('privacy.section11.rights.know').split(': ')[1]}</li>
            <li><strong>{t('privacy.section11.rights.delete').split(':')[0]}:</strong> {t('privacy.section11.rights.delete').split(': ')[1]}</li>
            <li><strong>{t('privacy.section11.rights.optOut').split(':')[0]}:</strong> {t('privacy.section11.rights.optOut').split(': ')[1]}</li>
            <li><strong>{t('privacy.section11.rights.nonDiscrimination').split(':')[0]}:</strong> {t('privacy.section11.rights.nonDiscrimination').split(': ')[1]}</li>
          </ul>
          <p className="text-text-secondary mt-4">
            {t('privacy.section11.contact')}
          </p>
        </div>

        {/* Section 12: Data Retention */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section12.title')}</h2>
          <p className="text-text-secondary">
            {t('privacy.section12.content')}
          </p>
        </div>

        {/* Section 13: Contact Us */}
        <div className="glass-effect p-8 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">{t('privacy.section13.title')}</h2>
          <p className="text-text-secondary mb-4">
            {t('privacy.section13.intro')}
          </p>
          <div className="bg-background/50 p-4 rounded-lg">
            <p className="text-text-secondary">
              <strong>{t('privacy.section13.email')}</strong> <a href="mailto:privacy@greenofig.com" className="text-primary hover:underline">privacy@greenofig.com</a><br />
              <strong>{t('privacy.section13.support')}</strong> <a href="mailto:support@greenofig.com" className="text-primary hover:underline">support@greenofig.com</a><br />
              <strong>{t('privacy.section13.address')}</strong> {t('privacy.section13.addressValue')}<br />
              <strong>{t('privacy.section13.responseTime')}</strong> {t('privacy.section13.responseTimeValue')}
            </p>
          </div>
        </div>
      </motion.div>
    </SiteLayout>
  );
};

export default PrivacyPolicyPage;
