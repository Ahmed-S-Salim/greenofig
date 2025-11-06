import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tag, Zap, Crown, PlusCircle, TrendingUp, TrendingDown, Users, AlertCircle } from 'lucide-react';
import AddPlanDialog from './AddPlanDialog';
import { subMonths, format } from 'date-fns';

const SubscriptionsManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [subscriptionStats, setSubscriptionStats] = useState({
    totalActive: 0,
    newThisMonth: 0,
    canceledThisMonth: 0,
    upgrades: 0,
    downgrades: 0,
    trialConversions: 0,
    paymentFailures: 0
  });

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) {
        toast({ title: 'Error fetching plans', description: error.message, variant: 'destructive' });
      } else {
        setPlans(data);
      }
      setLoading(false);
    };

    const fetchSubscriptionStats = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch all active subscriptions
      const { data: activeSubs } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');

      // Fetch new subscriptions this month
      const { data: newSubs } = await supabase
        .from('user_subscriptions')
        .select('*')
        .gte('created_at', startOfMonth.toISOString());

      // Fetch canceled subscriptions this month
      const { data: canceledSubs } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'canceled')
        .gte('canceled_at', startOfMonth.toISOString());

      // Fetch failed payments this month
      const { data: failedPayments } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('status', 'failed')
        .gte('created_at', startOfMonth.toISOString());

      setSubscriptionStats({
        totalActive: activeSubs?.length || 0,
        newThisMonth: newSubs?.length || 0,
        canceledThisMonth: canceledSubs?.length || 0,
        upgrades: 0, // Would need upgrade tracking table
        downgrades: 0, // Would need downgrade tracking table
        trialConversions: 0, // Would need trial tracking
        paymentFailures: failedPayments?.length || 0
      });
    };

    fetchPlans();
    fetchSubscriptionStats();
  }, []);

  const handleAddPlan = () => {
    setEditingPlan(null);
    setIsAddDialogOpen(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setIsAddDialogOpen(true);
  };

  const handlePlanAdded = async () => {
    // Refresh plans list
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) {
      toast({ title: 'Error fetching plans', description: error.message, variant: 'destructive' });
    } else {
      setPlans(data);
    }
  };
  
  const getPlanIcon = (planName) => {
    if (planName.toLowerCase().includes('pro')) return <Zap className="w-6 h-6 text-yellow-400" />;
    if (planName.toLowerCase().includes('enterprise')) return <Crown className="w-6 h-6 text-purple-400" />;
    return <Tag className="w-6 h-6 text-green-400" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Subscription Plans</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Manage subscription tiers and pricing</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button onClick={handleAddPlan} size="sm" className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Plan
          </Button>
        </div>
      </motion.div>

      {/* Subscription Analytics */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">Active Subscriptions</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{subscriptionStats.totalActive}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">New This Month</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{subscriptionStats.newThisMonth}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">Canceled This Month</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400">{subscriptionStats.canceledThisMonth}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-text-secondary">Payment Failures</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">{subscriptionStats.paymentFailures}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-effect animate-pulse">
                    <CardHeader><div className="h-8 bg-white/10 rounded w-3/4"></div></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-6 bg-white/10 rounded w-1/2"></div>
                        <div className="h-4 bg-white/10 rounded w-full"></div>
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-10 bg-white/10 rounded w-1/3 mt-4"></div>
                    </CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map(plan => (
            <motion.div variants={itemVariants} key={plan.id}>
              <Card className={`glass-effect h-full flex flex-col ${plan.is_popular ? 'border-purple-500 border-2' : ''}`}>
                {plan.is_popular && <div className="text-center py-1 bg-purple-500 text-white font-bold text-sm">Most Popular</div>}
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {getPlanIcon(plan.name)}
                    <span className="text-2xl">{plan.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <p className="text-4xl font-bold mb-2">${plan.price_monthly}<span className="text-lg font-normal text-text-secondary">/month</span></p>
                  <p className="text-text-secondary mb-4">{plan.description}</p>
                  <ul className="space-y-2 mb-6 flex-grow">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => handleEditPlan(plan)} variant="secondary">Edit Plan</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AddPlanDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPlanAdded={handlePlanAdded}
        editPlan={editingPlan}
      />
    </motion.div>
  );
};

export default SubscriptionsManager;