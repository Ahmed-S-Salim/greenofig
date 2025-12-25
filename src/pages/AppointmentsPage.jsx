import React from 'react';
import UserAppointments from '@/components/user/UserAppointments';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const AppointmentsPage = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-4xl mx-auto ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <UserAppointments />
    </motion.div>
  );
};

export default AppointmentsPage;
