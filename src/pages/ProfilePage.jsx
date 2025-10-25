import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, User, Save, Edit, Upload, Lock, Eye, EyeOff, Target } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Password change state
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfileData({ ...userProfile });
      setLoading(false);
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalToggle = (goal) => {
    const currentGoals = profileData.health_goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    setProfileData(prev => ({ ...prev, health_goals: newGoals }));
  };

  const availableGoals = [
    { id: 'lose_weight', label: 'Lose Weight' },
    { id: 'build_muscle', label: 'Build Muscle' },
    { id: 'improve_endurance', label: 'Improve Endurance' },
    { id: 'eat_healthier', label: 'Eat Healthier' },
    { id: 'increase_energy', label: 'Increase Energy' },
    { id: 'reduce_stress', label: 'Reduce Stress' },
    { id: 'better_sleep', label: 'Better Sleep' },
  ];
  
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-assets')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ variant: "destructive", title: "Upload failed", description: uploadError.message });
      setUploading(false);
      return;
    }

    // This is the public URL, but we'll add a timestamp to break cache
    const { data: { publicUrl } } = supabase.storage.from('user-assets').getPublicUrl(filePath);
    
    // Add a cache-busting query parameter
    const urlWithCacheBust = `${publicUrl}?t=${new Date().getTime()}`;

    const { error: dbError } = await supabase
      .from('user_profiles')
      .update({ profile_picture_url: urlWithCacheBust })
      .eq('id', user.id);
    
    if (dbError) {
      toast({ variant: "destructive", title: "Failed to save avatar", description: dbError.message });
    } else {
      await refreshUserProfile();
      toast({ title: "Avatar updated!", description: "Your new profile picture is now live." });
    }
    setUploading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { id, created_at, updated_at, role, email, profile_picture_url, ...updateData } = profileData;

    const { error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } else {
      await refreshUserProfile();
      toast({
        title: "Profile Updated!",
        description: "Your information has been successfully saved.",
      });
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
      });
      return;
    }

    setChangingPassword(true);

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          variant: 'destructive',
          title: 'Incorrect current password',
          description: 'Please enter your correct current password.',
        });
        setChangingPassword(false);
        return;
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Password updated successfully',
        description: 'Your password has been changed.',
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: 'destructive',
        title: 'Error updating password',
        description: error.message,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading || !profileData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - GreenoFig</title>
        <meta name="description" content="Manage your profile and settings." />
      </Helmet>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold">
              My <span className="gradient-text">Profile</span>
            </h1>
            <p className="text-text-secondary mt-2">View and manage your personal details.</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} disabled={saving || uploading}>
            {isEditing ? (
              <>
                <User className="mr-2 h-4 w-4" /> View Profile
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </>
            )}
          </Button>
        </div>

        {/* Profile Information Card */}
        <Card className="glass-effect">
          <CardContent className="p-6">
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                 <div className="flex items-center space-x-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={profileData?.profile_picture_url} alt={profileData?.full_name} />
                      <AvatarFallback className="text-4xl">{profileData?.full_name?.split(' ').map(n=>n[0]).join('') || '?'}</AvatarFallback>
                    </Avatar>
                     {uploading ? (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                          <Upload className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/png, image/jpeg" className="hidden" />
                  </div>
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-text-primary">Full Name</label>
                    <input type="text" name="full_name" id="full_name" value={profileData.full_name || ''} onChange={handleInputChange} className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
                        <input type="email" name="email" id="email" value={profileData.email || ''} disabled className="mt-1 block w-full bg-muted border-border rounded-md shadow-sm py-2 px-3 sm:text-sm cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-text-primary">Age</label>
                        <input type="number" name="age" id="age" value={profileData.age || ''} onChange={handleInputChange} className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="height_cm" className="block text-sm font-medium text-text-primary">Height (cm)</label>
                        <input type="number" name="height_cm" id="height_cm" value={profileData.height_cm || ''} onChange={handleInputChange} className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="weight_kg" className="block text-sm font-medium text-text-primary">Weight (kg)</label>
                        <input type="number" step="0.1" name="weight_kg" id="weight_kg" value={profileData.weight_kg || ''} onChange={handleInputChange} className="mt-1 block w-full bg-background border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Health Goals
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <Checkbox
                          id={goal.id}
                          checked={(profileData.health_goals || []).includes(goal.id)}
                          onCheckedChange={() => handleGoalToggle(goal.id)}
                        />
                        <Label
                          htmlFor={goal.id}
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {goal.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Select all that apply to personalize your experience
                  </p>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving || uploading}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
              </form>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center space-x-6">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                            <AvatarImage src={profileData?.profile_picture_url} alt={profileData?.full_name} />
                            <AvatarFallback className="text-4xl">{profileData?.full_name?.split(' ').map(n => n[0]).join('') || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-3xl font-bold text-text-primary">{profileData.full_name}</h2>
                            <p className="text-text-secondary">{profileData.email}</p>
                            <p className="text-sm text-muted-foreground capitalize mt-1">{profileData.role || 'user'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Age</p>
                            <p className="text-lg font-semibold">{profileData.age || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Gender</p>
                            <p className="text-lg font-semibold capitalize">{profileData.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Height</p>
                            <p className="text-lg font-semibold">{profileData.height_cm ? `${profileData.height_cm} cm` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Weight</p>
                            <p className="text-lg font-semibold">{profileData.weight_kg ? `${profileData.weight_kg} kg` : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Activity Level</p>
                            <p className="text-lg font-semibold capitalize">{profileData.activity_level?.replace('_', ' ') || 'N/A'}</p>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Health Goals</p>
                        <div className="flex flex-wrap gap-2">
                        {profileData.health_goals?.length > 0 ? profileData.health_goals.map(goal => (
                            <span key={goal} className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary font-medium">{goal}</span>
                        )) : <p>No goals set.</p>}
                        </div>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={changingPassword}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={changingPassword}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  At least 8 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={changingPassword}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default ProfilePage;