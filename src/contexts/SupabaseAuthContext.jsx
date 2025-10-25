
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
                console.log('fetchUserProfile called for user:', sessionUser.id);
                let { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', sessionUser.id)
                    .single();

                // If profile doesn't exist (OAuth user), create it
                if (error && error.code === 'PGRST116') {
                    console.log('Profile not found, creating for OAuth user...');

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
                        console.error('Error creating profile:', createError);
                        throw createError;
                    }

                    data = newProfile;
                    console.log('Profile created successfully:', data);
                } else if (error) {
                    throw error;
                }

                console.log('Profile fetched from database:', data);
                setUserProfile(data);
                return data;
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not fetch user profile.",
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
                console.log('onAuthStateChange event:', event, 'session user:', session?.user?.email);
                setLoading(true);
                const sessionUser = session?.user ?? null;
                setUser(sessionUser);
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
                setLoading(true);
                const { data, error } = await supabase.auth.signInWithPassword(credentials);

                if (error) {
                    setLoading(false);
                    toast({
                        variant: "destructive",
                        title: "Login Failed",
                        description: error.message,
                    });
                    return { error };
                }

                console.log('Login successful, user:', data.user);

                // Fetch and set the user profile to trigger navigation
                const profile = await fetchUserProfile(data.user);
                console.log('Fetched profile:', profile);

                setUser(data.user);
                setUserProfile(profile);

                setLoading(false);
                toast({
                    title: "Login Successful",
                    description: `Welcome back${profile?.full_name ? ', ' + profile.full_name : ''}!`,
                });

                return { error: null };
        }, [fetchUserProfile, toast]);

        const signInWithGoogle = useCallback(async () => {
                setLoading(true);
                // Construct redirect URL based on environment
                const isGitHubPages = window.location.hostname.includes('github.io');
                const redirectTo = isGitHubPages
                    ? `${window.location.origin}/greenofig/`
                    : window.location.origin;

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
                setLoading(true);
                const { email, password, full_name } = credentials;
                
                let role = 'user';
                if (email.endsWith('@greenofig.com')) {
                    if (email.startsWith('nutritionist@')) role = 'nutritionist';
                    else if (email.startsWith('admin@')) role = 'admin';
                    else if (email.startsWith('superadmin@')) role = 'super_admin';
                }

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
                    setLoading(false);
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
                    setLoading(false);
                     toast({
                        variant: "destructive",
                        title: "Sign-in after sign-up failed.",
                        description: signInError.message,
                    });
                    return { user: null, error: signInError };
                }

                // Wait for the user profile to be created by database trigger
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Update the profile with the correct role if it's a special account
                if (role !== 'user') {
                    await supabase
                        .from('user_profiles')
                        .update({ role })
                        .eq('id', signInData.user.id);
                }

                const profile = await fetchUserProfile(signInData.user);

                // Set user state to trigger navigation
                setUser(signInData.user);
                setUserProfile(profile);

                setLoading(false);
                return { user: signInData.user, error: null };
        }, [fetchUserProfile, toast]);

        const signOut = useCallback(async () => {
                setLoading(true);
                await supabase.auth.signOut();
                setUser(null);
                setUserProfile(null);
                toast({
                    title: "Signed Out",
                    description: "You have been successfully signed out.",
                });
                // Force redirect to home and reload
                const isGitHubPages = window.location.hostname.includes('github.io');
                const homeUrl = isGitHubPages ? '/greenofig/home' : '/home';
                window.location.href = homeUrl;
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
