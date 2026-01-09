
    import React, { lazy, Suspense, useEffect } from 'react';
    import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
    import { Helmet } from 'react-helmet';
    import { Toaster } from '@/components/ui/toaster';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { AnimatePresence } from 'framer-motion';
    import logoUrl from '@/assets/Remove background project.png';

    // Eager load critical components
    import AuthPage from '@/components/AuthPage';
    import AppLayout from '@/components/AppLayout';
    import PersistentBottomBanner from '@/components/ads/PersistentBottomBanner';

    // Scroll to top component - runs on every route change
    const ScrollToTop = () => {
      const { pathname } = useLocation();

      useEffect(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant' // Use 'instant' for immediate scroll
        });
      }, [pathname]);

      return null;
    };

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
    const DownloadPage = lazy(() => import('@/pages/DownloadPage'));

    // Missing routes from Dec 10 build - NOW ADDED
    const AppointmentsPage = lazy(() => import('@/pages/AppointmentsPage'));
    const VideoCallPage = lazy(() => import('@/pages/VideoCallPage'));
    const PatientIntakePage = lazy(() => import('@/pages/PatientIntakePage'));
    const PublicFormPage = lazy(() => import('@/pages/PublicFormPage'));
    const MyFormsPage = lazy(() => import('@/components/forms/MyFormsPage'));
    const UserAppointments = lazy(() => import('@/components/user/UserAppointments'));

    // Loading component
    const PageLoader = () => (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <img src={logoUrl} alt="GreenoFig Logo" className="w-24 h-24 animate-pulse" />
        </div>
    );

    const ProtectedRoute = ({ children }) => {
        const { user, userProfile, loading } = useAuth();
        const location = useLocation();

        // Skip loading screen if we have both user and profile
        // This prevents loading screen after successful login
        if (user && userProfile) {
            return children;
        }

        // Only show loading if we don't have a user yet
        if (loading && !user) {
            return <PageLoader />;
        }

        if (!user) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        // If we have user but waiting for profile, show children anyway
        // Profile will load in background
        return children;
    };

    const AdminRoute = ({ children }) => {
        const { user, userProfile, loading } = useAuth();
        // Only show loading if we don't have a user yet
        if (loading && !user) {
            return <PageLoader />;
        }
        if (userProfile?.role !== 'admin' && userProfile?.role !== 'super_admin') {
            return <Navigate to="/app" replace />;
        }
        return children;
    };

    const BlogEditorRoute = ({ children }) => {
        const { user, userProfile, loading } = useAuth();
        console.log('BlogEditorRoute - loading:', loading, 'userProfile:', userProfile);
        // Only show loading if we don't have a user yet
        if (loading && !user) {
            console.log('BlogEditorRoute: Still loading auth...');
            return <PageLoader />;
        }
        if (!['admin', 'super_admin', 'nutritionist'].includes(userProfile?.role)) {
            console.log('BlogEditorRoute: Access denied, role:', userProfile?.role, 'redirecting to /app');
            return <Navigate to="/app" replace />;
        }
        console.log('BlogEditorRoute: Access granted for role:', userProfile.role);
        return children;
    };

    const RoleBasedRedirect = () => {
      const { user, userProfile, loading } = useAuth();

      // Show loading while auth is initializing OR while we have user but no profile yet
      if (loading || (user && !userProfile)) {
        return <PageLoader />;
      }

      // Only redirect to login if we have no user AND not loading
      if (!user) {
        return <Navigate to="/login" replace />;
      }

      // At this point we should have both user and userProfile
      if (!userProfile) {
        // Shouldn't happen, but safety check
        return <Navigate to="/login" replace />;
      }

      // FIXED: Always use role-based routing (removed broken username redirect)
      const role = userProfile.role;
      if (role === 'admin' || role === 'super_admin') {
        return <Navigate to="/app/admin" replace />;
      }
      if (role === 'nutritionist') {
        return <Navigate to="/app/nutritionist" replace />;
      }
      return <Navigate to="/app/user" replace />;
    };

    // Component to handle root path - redirect to dashboard if logged in, otherwise home
    const RootRedirect = () => {
      const { user, loading } = useAuth();

      if (loading) {
        return <PageLoader />;
      }

      // If user is logged in, redirect to their dashboard
      if (user) {
        return <Navigate to="/app" replace />;
      }

      // Otherwise, show the homepage
      return <Navigate to="/home" replace />;
    };

    function App() {
      const location = useLocation();
      return (
        <>
          <ScrollToTop />
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

                    {/* Nutritionist routes with sub-paths */}
                    <Route path="nutritionist" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/dashboard" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/clients" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/onboarding" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/goals" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/meals" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/schedule" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/messages" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/analytics" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/payments" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/resources" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/blog" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />
                    <Route path="nutritionist/settings" element={<NutritionistDashboardV2 logoUrl={logoUrl} />} />

                    {/* Admin routes with sub-paths */}
                    <Route path="admin" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/tier-preview" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/analytics" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/revenue" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/errors" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/customers" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/subscriptions" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/payments" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/coupons" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/referrals" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/issues" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/messaging" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/blog" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/website" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/ads" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/ai-coach" element={<AdminDashboard logoUrl={logoUrl} />} />
                    <Route path="admin/studio" element={<AdminDashboard logoUrl={logoUrl} />} />

                    <Route path="profile" element={<ProfilePage logoUrl={logoUrl} />} />
                    <Route path="billing" element={<BillingPage />} />
                    <Route path="support" element={<SupportPage />} />
                    <Route path="ai-coach" element={<AiCoachPage />} />
                    <Route path="nutrition" element={<NutritionPage />} />
                    <Route path="fitness" element={<FitnessPage />} />
                    <Route path="progress" element={<ProgressPage />} />
                    <Route path="messages" element={<MessagingCenter />} />

                    {/* RESTORED: Missing routes from Dec 10 build */}
                    <Route path="appointments" element={<AppointmentsPage logoUrl={logoUrl} />} />
                    <Route path="call/:roomId" element={<VideoCallPage logoUrl={logoUrl} />} />
                    <Route path="forms" element={<MyFormsPage logoUrl={logoUrl} />} />

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

                {/* RESTORED: Public form routes from Dec 10 build */}
                <Route path="/form/:linkCode" element={<PublicFormPage logoUrl={logoUrl} />} />
                <Route path="/patientinfo/:linkCode" element={<PatientIntakePage logoUrl={logoUrl} />} />

                <Route path="/home" element={<HomePage logoUrl={logoUrl} />} />
                <Route path="/features" element={<FeaturesPage logoUrl={logoUrl} />} />
                <Route path="/pricing" element={<PricingPage logoUrl={logoUrl} />} />
                <Route path="/download" element={<DownloadPage logoUrl={logoUrl} />} />
                <Route path="/blog" element={<BlogPage logoUrl={logoUrl} />} />
                <Route path="/blog/:postId" element={<BlogPage logoUrl={logoUrl} />} />
                <Route path="/reviews" element={<ReviewsPage logoUrl={logoUrl} />} />
                <Route path="/contact" element={<ContactPage logoUrl={logoUrl} />} />
                <Route path="/faq" element={<FaqPage logoUrl={logoUrl} />} />
                <Route path="/about" element={<AboutPage logoUrl={logoUrl} />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage logoUrl={logoUrl} />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage logoUrl={logoUrl} />} />

                <Route path="/" element={<RootRedirect />} />
                <Route path="/*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
          <Toaster />
          {/* Persistent Bottom Banner Ad - Shows for ALL non-paid users (anonymous visitors + Basic tier) */}
          <PersistentBottomBanner />
        </>
      );
    }

    export default App;

