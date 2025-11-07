
import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from "@/components/ui/use-toast";

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
        const [userProfile, setUserProfile] = useState(null);
        const [loading, setLoading] = useState(true);
        const { toast } = useToast();

        const fetchUserProfile = useCallback(async (sessionUser) => {
            if (!sessionUser) {
                setUserProfile(null);
                return null;
            }

            try {
                let { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', sessionUser.id)
                    .single();

                // If profile doesn't exist (OAuth user), create it
                if (error && error.code === 'PGRST116') {
                    const fullName = sessionUser.user_metadata?.full_name ||
                                   sessionUser.user_metadata?.name ||
                                   sessionUser.email?.split('@')[0] || 'User';

                    const profilePicture = sessionUser.user_metadata?.avatar_url ||
                                         sessionUser.user_metadata?.picture;

                    const { data: newProfile, error: createError } = await supabase
                        .from('user_profiles')
                        .insert({
                            id: sessionUser.id,
                            full_name: fullName,
                            email: sessionUser.email,
                            role: 'user',
                            profile_picture_url: profilePicture
                        })
                        .select()
                        .single();

                    if (createError) {
                        throw createError;
                    }

                    data = newProfile;
                } else if (error) {
                    throw error;
                }

                setUserProfile(data);
                return data;
            } catch (error) {
                console.error('Error fetching profile:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load profile. Please refresh the page.",
                });
                return null;
            }
        }, [toast]);

        const refreshUserProfile = useCallback(() => {
            if (user) {
                return fetchUserProfile(user);
            }
            return Promise.resolve(null);
        }, [user, fetchUserProfile]);


        useEffect(() => {
            const getSession = async () => {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchUserProfile(session.user);
                }
                setLoading(false);
            };

            getSession();

            const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
                const sessionUser = session?.user ?? null;
                setUser(sessionUser);

                // Clean up OAuth code from URL and reload when sign in happens
                if (event === 'SIGNED_IN' && window.location.search.includes('code=')) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('code');

                    // Reload the page to ensure fresh session
                    window.location.href = url.toString();
                    return; // Stop execution, page will reload
                }

                if (sessionUser) {
                    await fetchUserProfile(sessionUser);
                } else {
                    setUserProfile(null);
                }

                setLoading(false);
            });

            return () => {
                authListener?.subscription?.unsubscribe();
            };
        }, [fetchUserProfile]);

        const signIn = useCallback(async (credentials) => {
                const { data, error } = await supabase.auth.signInWithPassword(credentials);

                if (error) {
                    toast({
                        variant: "destructive",
                        title: "Login Failed",
                        description: error.message,
                    });
                    return { error };
                }

                console.log('Login successful, user:', data.user);

                // Fetch profile immediately for navigation
                const profile = await fetchUserProfile(data.user);
                console.log('Fetched profile:', profile);

                // Set both user and profile immediately for instant navigation
                // onAuthStateChange will fire but we already have the data
                setUser(data.user);
                setUserProfile(profile);

                toast({
                    title: "Login Successful",
                    description: `Welcome back${profile?.full_name ? ', ' + profile.full_name : ''}!`,
                });

                return { error: null, profile };
        }, [fetchUserProfile, toast]);

        const signInWithGoogle = useCallback(async () => {
                setLoading(true);
                // Redirect directly to /app after OAuth
                const redirectTo = `${window.location.origin}/app`;

                const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: redirectTo,
                    },
                });
                if (error) {
                    setLoading(false);
                    toast({
                        variant: "destructive",
                        title: "Google Sign-In Failed",
                        description: error.message,
                    });
                }
                // On success, Supabase handles redirection, so no need to setLoading(false) here.
        }, [toast]);

        const signUp = useCallback(async (credentials) => {
                const { email, password, full_name } = credentials;

                // SECURITY FIX: All new users default to 'user' role
                // Admin/Nutritionist roles must be assigned server-side via database triggers
                // or manually by super_admin users to prevent privilege escalation attacks
                const role = 'user';

                /* DISABLED - SECURITY VULNERABILITY: Client-side role assignment
                 * This allowed anyone to register as admin by using admin@greenofig.com
                 *
                 * SECURE ALTERNATIVE: Implement database trigger or Edge Function:
                 *
                 * CREATE OR REPLACE FUNCTION assign_role_on_signup()
                 * RETURNS TRIGGER AS $$
                 * BEGIN
                 *   -- Only allow greenofig.com emails for elevated roles
                 *   -- AND require manual verification/approval
                 *   IF NEW.email LIKE '%@greenofig.com' THEN
                 *     -- Insert into pending_role_requests table for admin approval
                 *     INSERT INTO pending_role_requests (user_id, email, requested_role)
                 *     VALUES (NEW.id, NEW.email, 'pending_review');
                 *   END IF;
                 *   RETURN NEW;
                 * END;
                 * $$ LANGUAGE plpgsql SECURITY DEFINER;
                 */

                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name,
                            role,
                        },
                    },
                });

                if (signUpError) {
                    toast({
                        variant: "destructive",
                        title: "Sign Up Failed",
                        description: signUpError.message,
                    });
                    return { user: null, error: signUpError };
                }

                // Manually sign in the user after successful sign-up to create a session
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

                if (signInError) {
                     toast({
                        variant: "destructive",
                        title: "Sign-in after sign-up failed.",
                        description: signInError.message,
                    });
                    return { user: null, error: signInError };
                }

                // Wait for the user profile to be created by database trigger
                await new Promise(resolve => setTimeout(resolve, 1500));

                // SECURITY FIX: Removed client-side role update
                // All users start as 'user' role - elevated roles must be granted by admins

                const profile = await fetchUserProfile(signInData.user);

                // Set both user and profile immediately for instant navigation
                setUser(signInData.user);
                setUserProfile(profile);

                return { user: signInData.user, error: null, profile };
        }, [fetchUserProfile, toast]);

        const signOut = useCallback(async () => {
                setLoading(true);
                try {
                    // Clear Supabase session
                    await supabase.auth.signOut();

                    // Clear all local state
                    setUser(null);
                    setUserProfile(null);

                    // Clear any cached data in localStorage
                    localStorage.clear();
                    sessionStorage.clear();

                    toast({
                        title: "Signed Out",
                        description: "You have been successfully signed out.",
                    });
                } catch (error) {
                    console.error('SignOut error:', error);
                }

                // Force redirect to home with full reload to clear all state
                // Always use root path on production
                const homeUrl = '/home';

                // Use replace to prevent back button issues
                window.location.replace(homeUrl);
        }, [toast]);

        const value = useMemo(
            () => ({
                user,
                userProfile,
                loading,
                signIn,
                signInWithGoogle,
                signUp,
                signOut,
                refreshUserProfile,
            }),
            [user, userProfile, loading, signIn, signInWithGoogle, signUp, signOut, refreshUserProfile]
        );

        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    };

    export const useAuth = () => {
        const context = useContext(AuthContext);
        if (context === undefined) {
            throw new Error('useAuth must be used within an AuthProvider');
        }
        return context;
    };
