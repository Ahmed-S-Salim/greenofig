import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import dashboard sections
import DashboardOverview from '@/components/nutritionist/DashboardOverview';
import ClientManagement from '@/components/nutritionist/ClientManagement';
import ClientOnboarding from '@/components/nutritionist/ClientOnboarding';
import GoalManagement from '@/components/nutritionist/GoalManagement';
import MealPlanning from '@/components/nutritionist/MealPlanning';
import AppointmentSchedule from '@/components/nutritionist/AppointmentSchedule';
import MessagingCenter from '@/components/nutritionist/MessagingCenter';
import AnalyticsDashboard from '@/components/nutritionist/AnalyticsDashboard';
import ResourceLibrary from '@/components/nutritionist/ResourceLibrary';
import NutritionistSettings from '@/components/nutritionist/NutritionistSettings';
import EnhancedBlogManager from '@/components/admin/EnhancedBlogManager';
import SubscriptionManagement from '@/components/payments/SubscriptionManagement';

const NutritionistPanel = ({ user }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Extract the tab from the URL path (e.g., /app/nutritionist/schedule -> schedule)
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    // If the last part is 'nutritionist' or empty, default to 'dashboard'
    if (lastPart === 'nutritionist' || lastPart === '') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(lastPart);
    }
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview user={user} />;
      case 'clients':
        return <ClientManagement />;
      case 'onboarding':
        return <ClientOnboarding />;
      case 'goals':
        return <GoalManagement />;
      case 'meals':
        return <MealPlanning />;
      case 'schedule':
        return <AppointmentSchedule />;
      case 'messages':
        return <MessagingCenter />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'payments':
        return <SubscriptionManagement />;
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
