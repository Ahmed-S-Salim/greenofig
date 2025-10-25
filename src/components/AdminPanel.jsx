import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Database, TrendingUp, Users, CreditCard, ShieldQuestion, FileText, Globe, Ticket, Gift, DollarSign, LayoutDashboard, BarChart3, ArrowLeft, Wallet, Bot, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getAccessibleTabs, isAdmin } from '@/lib/rbac';
import DashboardOverview from '@/components/admin/DashboardOverview';
import DatabaseStudio from '@/components/admin/DatabaseStudio';
import Analytics from '@/components/admin/Analytics';
import SubscriptionsManager from '@/components/admin/SubscriptionsManager';
import CustomersManager from '@/components/admin/CustomersManager';
import PaymentsManager from '@/components/admin/PaymentsManager';
import EnhancedIssuesManager from '@/components/admin/EnhancedIssuesManager';
import EnhancedBlogManager from '@/components/admin/EnhancedBlogManager';
import WebsiteManager from '@/components/admin/WebsiteManager';
import CouponCodesManager from '@/components/admin/CouponCodesManager';
import ReferralManager from '@/components/admin/ReferralManager';
import RevenueAnalyticsPage from '@/pages/RevenueAnalyticsPage';
import AiCoachSettings from '@/components/admin/AiCoachSettings';
import UserManagement from '@/components/admin/UserManagement';

const AdminPanel = ({ user }) => {
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

  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'users', label: 'Users', icon: UserCog },
    { id: 'customers', label: 'User Management', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'referrals', label: 'Referrals', icon: Gift },
    { id: 'issues', label: 'Support', icon: ShieldQuestion },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'ai-coach', label: 'AI Coach', icon: Bot },
    { id: 'studio', label: 'Database', icon: Database },
  ];

  // Filter tabs based on user permissions
  const tabs = useMemo(() => {
    // If no user or no role, show all tabs (fallback to old behavior)
    if (!user || !user.role) {
      return allTabs;
    }

    // If user is super_admin or admin, show all tabs
    if (user.role === 'super_admin' || user.role === 'admin') {
      return allTabs;
    }

    // Otherwise filter by permissions
    const accessibleTabs = getAccessibleTabs(user, allTabs);

    // If no tabs are accessible (shouldn't happen), show all as fallback
    if (accessibleTabs.length === 0) {
      console.warn('No accessible tabs found, showing all tabs as fallback');
      return allTabs;
    }

    return accessibleTabs;
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview user={user} onNavigate={setActiveTab} />;
      case 'analytics':
        return <Analytics user={user} />;
      case 'revenue':
        return <RevenueAnalyticsPage />;
      case 'users':
        return <UserManagement user={user} />;
      case 'studio':
        return <DatabaseStudio user={user} />;
      case 'customers':
        return <CustomersManager user={user} />;
      case 'subscriptions':
        return <SubscriptionsManager user={user} />;
      case 'payments':
        return <PaymentsManager user={user} />;
      case 'coupons':
        return <CouponCodesManager user={user} />;
      case 'referrals':
        return <ReferralManager user={user} />;
      case 'issues':
        return <EnhancedIssuesManager user={user} />;
      case 'blog':
        return <EnhancedBlogManager user={user} />;
      case 'website':
        return <WebsiteManager user={user} />;
      case 'ai-coach':
        return <AiCoachSettings user={user} />;
      default:
        return <DashboardOverview user={user} />;
    }
  };

  // Tabs with their own internal navigation that handle their own back button
  const tabsWithInternalNav = ['website', 'blog'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-6">
        {activeTab !== 'dashboard' && !tabsWithInternalNav.includes(activeTab) && (
          <Button
            variant="ghost"
            onClick={() => setActiveTab('dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        )}

        <div className="overflow-x-auto">
          <div className="flex gap-2 p-2 glass-effect rounded-lg min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'hover:bg-muted/50 text-text-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
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
    </div>
  );
};

export default AdminPanel;