
    import React, { useState, useEffect } from 'react';
    import { useTranslation } from 'react-i18next';
    import { motion } from 'framer-motion';
    import { Mail, Lock, User, Loader2, ArrowLeft } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { toast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useNavigate, useLocation, Link } from 'react-router-dom';

    const GoogleIcon = (props) => (
      <svg viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.356-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.572,34.046,48,27.461,48,20C48,17.222,47.113,14.69,45.54,12.591L39.9,18.335C42.128,20.45,43.611,20.083,43.611,20.083z" />
      </svg>
    );

    const AuthPage = ({ logoUrl, initialIsLogin = true }) => {
      const { t } = useTranslation();
      const { signIn, signUp, signInWithGoogle, user, userProfile } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();

      const [isLogin, setIsLogin] = useState(initialIsLogin);
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [name, setName] = useState('');
      const [loading, setLoading] = useState(false);
      const [googleLoading, setGoogleLoading] = useState(false);
      const [selectedPlan, setSelectedPlan] = useState(null);

      useEffect(() => {
        if (location.state?.selectedPlan) {
          setSelectedPlan(location.state.selectedPlan);
        }
      }, [location.state]);

      useEffect(() => {
        setIsLogin(location.pathname === '/login');
      }, [location.pathname]);

      // Note: Navigation is handled directly in handleEmailSubmit and handleGoogleSignIn
      // No useEffect navigation needed - causes race condition on mobile

      const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (loading || googleLoading) return;

        if (!email || !password || (!isLogin && !name)) {
          toast({
            title: t('auth.missingFields'),
            description: t('auth.fillAllFields'),
            variant: "destructive",
          });
          return;
        }

        setLoading(true);

        if (isLogin) {
          try {
            const result = await signIn({email, password});
            console.log('SignIn result:', result);

            if (result?.error) {
              console.log('SignIn error:', result.error);
              setLoading(false);
              return;
            }

            // Navigate even if profile is null - use role from profile or default to user
            const role = result?.profile?.role;
            console.log('User role:', role);

            let destination = '/app/user';
            if (role === 'admin' || role === 'super_admin') {
              destination = '/app/admin';
            } else if (role === 'nutritionist') {
              destination = '/app/nutritionist';
            }

            console.log('Navigating to:', destination);
            // Use navigate with state to avoid reload
            navigate(destination, { replace: true, state: { skipLoading: true } });
          } catch (err) {
            console.error('Login exception:', err);
            setLoading(false);
            toast({
              title: 'Login Error',
              description: 'An unexpected error occurred. Please try again.',
              variant: 'destructive',
            });
          }
          return;
        } else {
          const { user, error, profile } = await signUp({ email, password, full_name: name });

          if (!error && user && profile) {
             toast({
              title: t('auth.accountCreated'),
              description: t('auth.welcomeSetup'),
            });

            // Determine destination based on role
            const role = profile.role;
            let destination = '/app/user';
            if (role === 'admin' || role === 'super_admin') {
              destination = '/app/admin';
            } else if (role === 'nutritionist') {
              destination = '/app/nutritionist';
            }

            // Use navigate with state to avoid reload
            navigate(destination, { replace: true, state: { skipLoading: true } });
            return;
          }
          setLoading(false);
        }
      };

      const handleGoogleSignIn = async () => {
        if (loading || googleLoading) return;
        setGoogleLoading(true);
        await signInWithGoogle();
        // The user will be redirected by Supabase, so we don't need to set loading to false here
        // in the happy path. If there's an error, it will be caught in the auth context.
        // We'll add a timeout to reset the button just in case.
        setTimeout(() => setGoogleLoading(false), 5000);
      };

      const toggleAuthMode = () => {
        if (loading || googleLoading) return;
        if (isLogin) {
          navigate('/signup');
        } else {
          navigate('/login');
        }
      };

      return (
        <div className="h-screen flex items-center justify-center p-2 bg-background touch-auto overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md h-full max-h-[98vh] flex items-center"
          >
            <div className="glass-effect rounded-lg p-3 shadow-2xl w-full">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors mb-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-medium">{t('auth.back')}</span>
              </button>

              <div className="text-center mb-3">
                <Link to="/home" className="inline-block mb-2">
                  <img src={logoUrl} alt="GreenoFig Logo" className="w-12 h-12" />
                </Link>
                <h1 className="text-2xl font-bold gradient-text mb-1">GreenoFig</h1>
                <p className="text-text-secondary text-xs">{t('auth.tagline')}</p>
                {selectedPlan && !isLogin && (
                  <div className="mt-4 bg-primary/10 text-primary font-semibold p-2 rounded-lg">
                    {t('auth.signUpForPlan')} <span className="font-bold">{selectedPlan}</span> {t('auth.plan')}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full py-2 min-h-[36px] rounded-lg shadow-lg flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform text-xs"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                type="button"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4" />
                )}
                <span>{isLogin ? t('auth.signInWithGoogle') : t('auth.signUpWithGoogle')}</span>
              </Button>

              <div className="my-2 flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-2 text-[10px] text-text-secondary uppercase">{t('auth.orContinueWith')}</span>
                <div className="flex-grow border-t border-border"></div>
              </div>


              <form onSubmit={handleEmailSubmit} className="space-y-2">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">
                      {t('auth.fullName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 min-h-[36px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation text-xs"
                        placeholder="John Doe"
                        disabled={loading || googleLoading}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 min-h-[36px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation text-xs"
                      placeholder="you@example.com"
                      disabled={loading || googleLoading}
                      required
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 min-h-[36px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation text-xs"
                      placeholder="••••••••"
                      disabled={loading || googleLoading}
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 min-h-[36px] rounded-lg shadow-lg touch-manipulation active:scale-95 transition-transform text-xs"
                  disabled={loading || googleLoading}
                >
                  {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {loading ? t('auth.processing') : (isLogin ? t('auth.login') : t('auth.signup'))}
                </Button>
              </form>

              <div className="mt-3 text-center">
                <button
                  onClick={toggleAuthMode}
                  type="button"
                  className="text-text-secondary hover:text-primary transition-colors disabled:opacity-50 min-h-[32px] py-1 px-3 touch-manipulation text-xs"
                  disabled={loading || googleLoading}
                >
                  {isLogin ? `${t('auth.dontHaveAccount')} ${t('auth.signup')}` : `${t('auth.alreadyHaveAccount')} ${t('auth.login')}`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    };

    export default AuthPage;
  