import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import dashboard sections
import DashboardOverview from '@/components/nutritionist/DashboardOverview';
import ClientManagement from '@/components/nutritionist/ClientManagement';
import MealPlanning from '@/components/nutritionist/MealPlanning';
import AppointmentSchedule from '@/components/nutritionist/AppointmentSchedule';
import MessagingCenter from '@/components/nutritionist/MessagingCenter';
import AnalyticsDashboard from '@/components/nutritionist/AnalyticsDashboard';
import ResourceLibrary from '@/components/nutritionist/ResourceLibrary';
import NutritionistSettings from '@/components/nutritionist/NutritionistSettings';
import EnhancedBlogManager from '@/components/admin/EnhancedBlogManager';

const NutritionistPanel = ({ user }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [searchParams]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview user={user} />;
      case 'clients':
        return <ClientManagement />;
      case 'meals':
        return <MealPlanning />;
      case 'schedule':
        return <AppointmentSchedule />;
      case 'messages':
        return <MessagingCenter />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'resources':
        return <ResourceLibrary />;
      case 'blog':
        return <EnhancedBlogManager user={user} />;
      case 'settings':
        return <NutritionistSettings />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  return (
    <ErrorBoundary>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </ErrorBoundary>
  );
};

export default NutritionistPanel;
