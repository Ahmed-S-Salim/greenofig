import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Users, TrendingUp, DollarSign, Award, Search, Settings,
  CheckCircle, Clock, Gift
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ReferralManager = () => {
  const [referrals, setReferrals] = useState([]);
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [programSettings, setProgramSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [settingsForm, setSettingsForm] = useState({
    referrerRewardType: 'credit',
    referrerRewardValue: '10.00',
    refereeRewardType: 'discount_percentage',
    refereeRewardValue: '20.00',
    minRefereeSubscriptionMonths: '1',
  });

  const [stats, setStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalRewardsGiven: 0,
  });

  const fetchReferrals = async () => {
    setLoading(true);

    // Fetch referrals
    const { data: referralsData, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all user profiles for referrers and referees
    let enrichedReferrals = [];
    if (referralsData && referralsData.length > 0) {
      const userIds = [...new Set([
        ...referralsData.map(r => r.referrer_id),
        ...referralsData.map(r => r.referee_id)
      ])];

      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url')
        .in('id', userIds);

      // Map users to referrals
      enrichedReferrals = referralsData.map(referral => ({
        ...referral,
        referrer: usersData?.find(u => u.id === referral.referrer_id),
        referee: usersData?.find(u => u.id === referral.referee_id)
      }));
    }

    // Fetch program settings
    const { data: programData, error: programError } = await supabase
      .from('referral_program')
      .select('*')
      .eq('is_active', true)
      .single();

    if (referralsError) {
      toast({ title: 'Error fetching referrals', description: referralsError.message, variant: 'destructive' });
    } else {
      setReferrals(enrichedReferrals || []);

      // Calculate stats
      const completed = enrichedReferrals?.filter(r => r.status === 'completed' || r.status === 'rewarded').length || 0;
      const pending = enrichedReferrals?.filter(r => r.status === 'pending').length || 0;

      setStats({
        totalReferrals: enrichedReferrals?.length || 0,
        completedReferrals: completed,
        pendingReferrals: pending,
        totalRewardsGiven: completed * 2, // Both referrer and referee get rewards
      });
    }

    if (programData) {
      setProgramSettings(programData);
      setSettingsForm({
        referrerRewardType: programData.referrer_reward_type,
        referrerRewardValue: programData.referrer_reward_value.toString(),
        refereeRewardType: programData.referee_reward_type,
        refereeRewardValue: programData.referee_reward_value.toString(),
        minRefereeSubscriptionMonths: programData.min_referee_subscription_months.toString(),
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  useEffect(() => {
    let filtered = referrals;

    if (searchTerm) {
      filtered = filtered.filter(ref =>
        ref.referrer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.referrer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.referee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.referee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.referral_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ref => ref.status === statusFilter);
    }

    setFilteredReferrals(filtered);
  }, [searchTerm, statusFilter, referrals]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('referral_program')
      .update({
        referrer_reward_type: settingsForm.referrerRewardType,
        referrer_reward_value: parseFloat(settingsForm.referrerRewardValue),
        referee_reward_type: settingsForm.refereeRewardType,
        referee_reward_value: parseFloat(settingsForm.refereeRewardValue),
        min_referee_subscription_months: parseInt(settingsForm.minRefereeSubscriptionMonths),
      })
      .eq('id', programSettings.id);

    if (error) {
      toast({ title: 'Error updating settings', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Referral program settings updated!' });
      setIsSettingsOpen(false);
      fetchReferrals();
    }
  };

  const markAsRewarded = async (referralId) => {
    const { error } = await supabase
      .from('referrals')
      .update({
        status: 'rewarded',
        referrer_rewarded: true,
        referee_rewarded: true,
        referrer_rewarded_at: new Date().toISOString(),
        referee_rewarded_at: new Date().toISOString(),
      })
      .eq('id', referralId);

    if (error) {
      toast({ title: 'Error updating referral', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Referral marked as rewarded!' });
      fetchReferrals();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      completed: { variant: 'default', label: 'Completed', icon: CheckCircle },
      rewarded: { variant: 'default', label: 'Rewarded', icon: Gift },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Referral Program</h2>
          <p className="text-text-secondary">Track and manage customer referrals</p>
        </div>
        <Button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Program Settings
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Referrals</p>
                <p className="text-3xl font-bold">{stats.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Completed</p>
                <p className="text-3xl font-bold text-green-400">{stats.completedReferrals}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pendingReferrals}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Rewards Given</p>
                <p className="text-3xl font-bold text-purple-400">{stats.totalRewardsGiven}</p>
              </div>
              <Award className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search referrals..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 glass-effect"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] glass-effect">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rewarded">Rewarded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="text-center py-8">Loading referrals...</div>
      ) : (
        <div className="space-y-4">
          {filteredReferrals.map(referral => (
            <motion.div
              key={referral.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Referrer */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={referral.referrer?.profile_picture_url} />
                          <AvatarFallback>{getInitials(referral.referrer?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{referral.referrer?.full_name}</p>
                          <p className="text-xs text-text-secondary">{referral.referrer?.email}</p>
                        </div>
                      </div>

                      <TrendingUp className="w-5 h-5 text-primary" />

                      {/* Referee */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={referral.referee?.profile_picture_url} />
                          <AvatarFallback>{getInitials(referral.referee?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{referral.referee?.full_name}</p>
                          <p className="text-xs text-text-secondary">{referral.referee?.email}</p>
                        </div>
                      </div>

                      <div className="ml-auto flex items-center gap-4">
                        <div className="text-right">
                          <code className="text-sm font-mono bg-white/10 px-2 py-1 rounded">
                            {referral.referral_code}
                          </code>
                          <p className="text-xs text-text-secondary mt-1">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(referral.status)}
                      </div>
                    </div>

                    {referral.status === 'completed' && !referral.referrer_rewarded && (
                      <Button
                        size="sm"
                        onClick={() => markAsRewarded(referral.id)}
                        className="ml-4"
                      >
                        Mark as Rewarded
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredReferrals.length === 0 && (
            <p className="text-text-secondary text-center py-8">No referrals found</p>
          )}
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="glass-effect max-w-2xl">
          <DialogHeader>
            <DialogTitle>Referral Program Settings</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateSettings} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Referrer Rewards</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reward Type</Label>
                  <Select
                    value={settingsForm.referrerRewardType}
                    onValueChange={(val) => setSettingsForm({...settingsForm, referrerRewardType: val})}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="credit">Account Credit ($)</SelectItem>
                      <SelectItem value="discount_percentage">Discount (%)</SelectItem>
                      <SelectItem value="free_months">Free Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reward Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settingsForm.referrerRewardValue}
                    onChange={(e) => setSettingsForm({...settingsForm, referrerRewardValue: e.target.value})}
                    className="glass-effect"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Referee Rewards</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reward Type</Label>
                  <Select
                    value={settingsForm.refereeRewardType}
                    onValueChange={(val) => setSettingsForm({...settingsForm, refereeRewardType: val})}
                  >
                    <SelectTrigger className="glass-effect">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="credit">Account Credit ($)</SelectItem>
                      <SelectItem value="discount_percentage">Discount (%)</SelectItem>
                      <SelectItem value="free_months">Free Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reward Value</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settingsForm.refereeRewardValue}
                    onChange={(e) => setSettingsForm({...settingsForm, refereeRewardValue: e.target.value})}
                    className="glass-effect"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Minimum Subscription Months for Referee</Label>
              <Input
                type="number"
                value={settingsForm.minRefereeSubscriptionMonths}
                onChange={(e) => setSettingsForm({...settingsForm, minRefereeSubscriptionMonths: e.target.value})}
                className="glass-effect"
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                Referee must maintain subscription for this many months before rewards are given
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferralManager;
