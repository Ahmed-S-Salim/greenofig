import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import logoUrl from '@/assets/Remove background project.png';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a valid session from the recovery link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: 'destructive',
          title: 'Invalid or expired link',
          description: 'Please request a new password reset link.',
        });
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: 'Password updated successfully',
        description: 'You can now login with your new password.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Helmet>
          <title>Password Reset - GreenoFig</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass-effect rounded-2xl p-8 shadow-2xl text-center">
            <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Password Updated!</h1>
            <p className="text-text-secondary mb-6">
              Your password has been successfully updated. Redirecting to login...
            </p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Helmet>
        <title>Set Your Password - GreenoFig</title>
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-4"
            >
              <img src={logoUrl} alt="GreenoFig Logo" className="w-20 h-20" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Set Your Password</h1>
            <p className="text-text-secondary">Create a secure password for your account</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Enter new password"
                  disabled={loading}
                  required
                  minLength={8}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                At least 8 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Confirm new password"
                  disabled={loading}
                  required
                  minLength={8}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg shadow-lg"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating Password..." : "Set Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-text-secondary hover:text-primary transition-colors text-sm"
              disabled={loading}
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
