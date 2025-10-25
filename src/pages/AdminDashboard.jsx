import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminPanel from '@/components/AdminPanel';

const AdminDashboard = () => {
  const { userProfile } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - GreenoFig</title>
        <meta name="description" content="Platform management and analytics." />
      </Helmet>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold">
            Admin <span className="gradient-text">Command Center</span>
          </h1>
          <p className="text-text-secondary mt-2">Welcome, {userProfile?.full_name?.split(' ')[0] || 'Admin'}. Manage your platform from here.</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <AdminPanel user={userProfile} />
        </motion.div>
      </motion.div>
    </>
  );
};

export default AdminDashboard;