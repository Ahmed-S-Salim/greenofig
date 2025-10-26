
    import React, { lazy, Suspense } from 'react';
    import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Toaster } from '@/components/ui/toaster';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { AnimatePresence } from 'framer-motion';
    import logoUrl from '@/assets/Remove background project.png';

    // Eager load critical components
    import AuthPage from '@/components/AuthPage';
    import AppLayout from '@/components/AppLayout';

    // Lazy load pages for code splitting
    const HomePage = lazy(() => import('@/pages/HomePage'));
    const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'));
    const PricingPage = lazy(() => import('@/pages/PricingPage'));
    const BlogPage = lazy(() => import('@/pages/BlogPage'));
    const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'));
    const ContactPage = lazy(() => import('@/pages/ContactPage'));
    const FaqPage = lazy(() => import('@/pages/FaqPage'));
    const AboutPage = lazy(() => import('@/pages/AboutPage'));
    const UserDashboard = lazy(() => import('@/pages/UserDashboard'));
    const NutritionistDashboardV2 = lazy(() => import('@/pages/NutritionistDashboardV2'));
    const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
    const OnboardingSurvey = lazy(() => import('@/components/OnboardingSurvey'));
    const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
    const EnhancedBlogPostEditor = lazy(() => import('@/components/admin/EnhancedBlogPostEditor'));
    const BlogTagsManager = lazy(() => import('@/components/admin/BlogTagsManager'));
    const AiCoachPage = lazy(() => import('@/pages/AiCoachPage'));
    const SurveyPage = lazy(() => import('@/pages/SurveyPage'));
    const RevenueAnalyticsPage = lazy(() => import('@/pages/RevenueAnalyticsPage'));
    const BillingPage = lazy(() => import('@/pages/BillingPage'));
    const SupportPage = lazy(() => import('@/pages/SupportPage'));
    const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
    const NutritionPage = lazy(() => import('@/components/NutritionPageFunctional'));
    const FitnessPage = lazy(() => import('@/components/FitnessPage'));
    const ProgressPage = lazy(() => import('@/components/ProgressPage'));
    const MessagingCenter = lazy(() => import('@/components/user/MessagingCenter'));
    const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
    const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage'));
    const AdminFAQPage = lazy(() => import('@/pages/AdminFAQPage'));

    // Loading component
    const PageLoader = () => (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <img src={logoUrl} alt="GreenoFig Logo" className="w-24 h-24 animate-pulse" />
        </div>
    );

    const ProtectedRoute = ({ children }) => {
        const { user, loading } = useAuth();
        const location = useLocation();

        if (loading) {
            return <PageLoader />;
        }

        if (!user) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        return children;
    };

    const AdminRoute = ({ children }) => {
        const { userProfile, loading } = useAuth();
        if (loading) {
            return <PageLoader />;
        }
        if (userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
            return <Navigate to="/app" replace />;
        }
        return children;
    };

    const BlogEditorRoute = ({ children }) => {
        const { userProfile, loading } = useAuth();
        if (loading) {
            return <PageLoader />;
        }
        if (!['admin', 'super_admin', 'nutritionist'].includes(userProfile?.role)) {
            return <Navigate to="/app" replace />;
        }
        return children;
    };

    const RoleBasedRedirect = () => {
      const { userProfile, loading } = useAuth();

      if (loading) {
        return <PageLoader />;
      }

      if (!userProfile) {
        return <Navigate to="/login" replace />;
      }

      const role = userProfile.role;
      let path = '/app/user';
      if (role === 'admin' || role === 'super_admin') {
        path = '/app/admin';
      } else if (role === 'nutritionist') {
        path = '/app/nutritionist';
      }

      return <Navigate to={path} replace />;
    };

    function App() {
      const location = useLocation();
      return (
        <>
          <Helmet>
            <title>GreenoFig - AI-Powered Health & Wellness</title>
            <meta name="description" content="Your AI-Powered Health Companion. Achieve your wellness goals with personalized nutrition, fitness, and lifestyle coaching." />
          </Helmet>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<AuthPage logoUrl={logoUrl} />} />
                <Route path="/signup" element={<AuthPage logoUrl={logoUrl} initialIsLogin={false} />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/app" element={<ProtectedRoute><AppLayout logoUrl={logoUrl} /></ProtectedRoute>}>
                    <Route index element={<RoleBasedRedirect />} />
                    <Route path="user" element={<UserDashboard logoUrl={logoUrl} />} />
                    <Route path="nutritionist" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="admin" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="profile" element={<ProfilePage logoUrl={logoUrl} />} />
                    <Route path="billing" element={<BillingPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="ai-coach" element={<AiCoachPage />} />
                    <Route path="nutrition" element={<NutritionPage />} />
                    <Route path="fitness" element={<FitnessPage />} />
                    <Route path="progress" element={<ProgressPage />} />
                    <Route path="messages" element={<MessagingCenter />} />
                    <Route path="admin/blog/new" element={<BlogEditorRoute><EnhancedBlogPostEditor logoUrl={logoUrl} /></BlogEditorRoute>} />
                    <Route path="admin/blog/edit/:postId" element={<BlogEditorRoute><EnhancedBlogPostEditor logoUrl={logoUrl} /></BlogEditorRoute>} />
                    <Route path="admin/blog/tags" element={<AdminRoute><BlogTagsManager logoUrl={logoUrl} /></AdminRoute>} />
                    <Route path="nutritionist/blog/new" element={<BlogEditorRoute><EnhancedBlogPostEditor logoUrl={logoUrl} /></BlogEditorRoute>} />
                    <Route path="nutritionist/blog/edit/:postId" element={<BlogEditorRoute><EnhancedBlogPostEditor logoUrl={logoUrl} /></BlogEditorRoute>} />
                    <Route path="admin/faq" element={<AdminRoute><AdminFAQPage /></AdminRoute>} />
                    <Route path="admin/revenue" element={<AdminRoute><RevenueAnalyticsPage /></AdminRoute>} />
                </Route>

                <Route path="/onboarding" element={<ProtectedRoute><OnboardingSurvey logoUrl={logoUrl} /></ProtectedRoute>} />
                <Route path="/survey" element={<SurveyPage logoUrl={logoUrl} />} />

                <Route path="/home" element={<HomePage logoUrl={logoUrl} />} />
                <Route path="/features" element={<FeaturesPage logoUrl={logoUrl} />} />
                <Route path="/pricing" element={<PricingPage logoUrl={logoUrl} />} />
                <Route path="/blog" element={<BlogPage logoUrl={logoUrl} />} />
                <Route path="/blog/:postId" element={<BlogPage logoUrl={logoUrl} />} />
                <Route path="/reviews" element={<ReviewsPage logoUrl={logoUrl} />} />
                <Route path="/contact" element={<ContactPage logoUrl={logoUrl} />} />
                <Route path="/faq" element={<FaqPage logoUrl={logoUrl} />} />
                <Route path="/about" element={<AboutPage logoUrl={logoUrl} />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage logoUrl={logoUrl} />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage logoUrl={logoUrl} />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
          <Toaster />
        </>
      );
    }

    export default App;

