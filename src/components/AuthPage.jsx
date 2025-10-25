
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Mail, Lock, User, Info, Loader2 } from 'lucide-react';
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

      useEffect(() => {
        console.log('AuthPage useEffect - user:', user, 'userProfile:', userProfile);
        if(user && userProfile) {
            console.log('Navigating based on role:', userProfile.role);
            // Force full page navigation to ensure clean state
            const isGitHubPages = window.location.hostname.includes('github.io');
            const basePath = isGitHubPages ? '/greenofig' : '';

            let destination = `${basePath}/app/user`;
            switch (userProfile.role) {
                case 'admin':
                case 'super_admin':
                    destination = `${basePath}/app/admin`;
                    break;
                case 'nutritionist':
                    destination = `${basePath}/app/nutritionist`;
                    break;
                default:
                    destination = `${basePath}/app/user`;
                    break;
            }
            window.location.href = destination;
        }
      }, [user, userProfile])

      const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (loading || googleLoading) return;

        if (!email || !password || (!isLogin && !name)) {
          toast({
            title: "Missing fields",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return;
        }

        setLoading(true);

        if (isLogin) {
          const { error } = await signIn({email, password});
          if (error) {
            // Error toast is handled in useAuth
          } else {
            // Success navigation is handled by useEffect
          }
        } else {
          const { user, error } = await signUp({ email, password, full_name: name });

          if (error) {
            // Error toast is handled in useAuth
          } else if (user) {
             toast({
              title: "Account created! 🚀",
              description: "Welcome! Let's get you set up.",
            });
            // Success navigation is handled by useEffect
          }
        }
        setLoading(false);
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background touch-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="glass-effect rounded-2xl p-4 sm:p-8 shadow-2xl">
              <div className="text-center mb-8">
                <Link to="/home" className="inline-block mb-4">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <img src={logoUrl} alt="GreenoFig Logo" className="w-20 h-20" />
                  </motion.div>
                </Link>
                <h1 className="text-4xl font-bold gradient-text mb-2">GreenoFig</h1>
                <p className="text-text-secondary">Your Personal Wellness Companion</p>
                {selectedPlan && !isLogin && (
                  <div className="mt-4 bg-primary/10 text-primary font-semibold p-2 rounded-lg">
                    Signing up for the <span className="font-bold">{selectedPlan}</span> plan
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full py-3 min-h-[44px] rounded-lg shadow-lg flex items-center justify-center gap-2 touch-manipulation active:scale-95 transition-transform"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                type="button"
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                <span>Sign {isLogin ? 'in' : 'up'} with Google</span>
              </Button>

              <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-xs text-text-secondary uppercase">Or continue with</span>
                <div className="flex-grow border-t border-border"></div>
              </div>


              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation"
                        placeholder="John Doe"
                        disabled={loading || googleLoading}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation"
                      placeholder="you@example.com"
                      disabled={loading || googleLoading}
                      required
                      autoComplete="email"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring touch-manipulation"
                      placeholder="••••••••"
                      disabled={loading || googleLoading}
                      required
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 min-h-[44px] rounded-lg shadow-lg touch-manipulation active:scale-95 transition-transform"
                  disabled={loading || googleLoading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Processing..." : (isLogin ? 'Login' : 'Sign Up')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={toggleAuthMode}
                  type="button"
                  className="text-text-secondary hover:text-primary transition-colors disabled:opacity-50 min-h-[44px] py-2 px-4 touch-manipulation"
                  disabled={loading || googleLoading}
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-primary">Special Account Sign Up:</p>
                  <ul className="text-xs text-primary/80 list-disc pl-4 mt-1 space-y-1">
                    <li>To create a regular user account, use any valid email.</li>
                    <li>For a <span className="font-bold">Nutritionist</span> account, sign up with: <br/><span className="font-bold">`nutritionist@greenofig.com`</span></li>
                    <li>For an <span className="font-bold">Admin</span> account, sign up with: <br/><span className="font-bold">`admin@greenofig.com`</span></li>
                    <li>For a <span className="font-bold">Super Admin</span> account, sign up with: <br/><span className="font-bold">`superadmin@greenofig.com`</span></li>
                     <li>Your account is auto-verified. No need to check your email!</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      );
    };

    export default AuthPage;
  