import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ProfilePage = ({ user, profileData, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    activity_level: 'moderate',
    health_goals: [],
  });

  useEffect(() => {
    if (profileData) {
      setProfile({
        full_name: profileData.full_name || '',
        age: profileData.age || '',
        gender: profileData.gender || '',
        height_cm: profileData.height_cm || '',
        weight_kg: profileData.weight_kg || '',
        activity_level: profileData.activity_level || 'moderate',
        health_goals: profileData.health_goals || [],
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        activity_level: profile.activity_level,
        health_goals: profile.health_goals,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();
    
    setLoading(false);

    if (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      onProfileUpdate(data);
      setIsEditing(false);
      toast({
        title: 'Profile updated! 🎉',
        description: 'Your health profile has been saved successfully',
      });
    }
  };
  
  const handleGoalChange = (goal) => {
    setProfile(p => {
        const newGoals = p.health_goals.includes(goal)
            ? p.health_goals.filter(g => g !== goal)
            : [...p.health_goals, goal];
        return {...p, health_goals: newGoals};
    });
  };

  const healthGoalOptions = ['weight_loss', 'muscle_gain', 'maintenance', 'improved_energy'];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
          <p className="text-purple-300 text-lg">Manage your health information</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
        >
          <Edit className="w-4 h-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-8 shadow-xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              disabled={!isEditing || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              disabled={!isEditing || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              disabled={!isEditing || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Height (cm)</label>
            <input
              type="number"
              value={profile.height_cm}
              onChange={(e) => setProfile({ ...profile, height_cm: e.target.value })}
              disabled={!isEditing || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="175"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={profile.weight_kg}
              onChange={(e) => setProfile({ ...profile, weight_kg: e.target.value })}
              disabled={!isEditing || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Activity Level</label>
            <select
              value={profile.activity_level}
              onChange={(e) => setProfile({ ...profile, activity_level: e.target.value })}
              disabled={!isEditing || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Light</option>
              <option value="moderate">Moderate</option>
              <option value="active">Active</option>
              <option value="very_active">Very Active</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
            <label className="block text-sm font-medium text-purple-200 mb-2">Health Goals</label>
            <div className="grid grid-cols-2 gap-4">
                {healthGoalOptions.map(goal => (
                    <label key={goal} className={`flex items-center p-3 rounded-lg border transition-all ${profile.health_goals.includes(goal) ? 'bg-purple-500/30 border-purple-500' : 'bg-white/10 border-white/20'} ${isEditing ? 'cursor-pointer hover:bg-white/20' : 'opacity-50'}`}>
                        <input
                            type="checkbox"
                            checked={profile.health_goals.includes(goal)}
                            onChange={() => handleGoalChange(goal)}
                            disabled={!isEditing || loading}
                            className="h-4 w-4 rounded bg-white/20 border-white/30 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="ml-3 text-white capitalize">{goal.replace('_', ' ')}</span>
                    </label>
                ))}
            </div>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfilePage;