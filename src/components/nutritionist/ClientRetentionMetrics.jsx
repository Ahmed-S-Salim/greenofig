import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { TrendingUp, Users, DollarSign, Target, Crown, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const ClientRetentionMetrics = () => {
  const { userProfile } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchRetentionMetrics();
    }
  }, [userProfile?.id]);

  const fetchRetentionMetrics = async () => {
    try {
      // Get last 6 months of data
      const { data, error } = await supabase
        .from('client_retention_metrics')
        .select('*')
        .eq('nutritionist_id', userProfile.id)
        .order('month_year', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching retention metrics:', error);
        return;
      }

      setMetrics((data || []).reverse()); // Reverse to show oldest first
      setCurrentMonth(data?.[0] || null);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchRetentionMetrics:', error);
      setLoading(false);
    }
  };

  const chartData = metrics.map(m => ({
    month: m.month_year,
    clients: m.total_clients,
    active: m.active_clients,
    retention: m.retention_rate,
    revenue: m.total_revenue,
  }));

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Client Retention Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-muted rounded" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Client Retention Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Track your client retention, tier distribution, and revenue over time
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Month Stats */}
        {currentMonth && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Total Clients</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {currentMonth.total_clients}
              </div>
              <div className="text-xs text-green-400 mt-1">
                +{currentMonth.new_clients} new this month
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Retention Rate</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {currentMonth.retention_rate || 0}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {currentMonth.active_clients} active clients
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-muted-foreground">Monthly Revenue</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                ${currentMonth.total_revenue || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ${currentMonth.revenue_per_client || 0}/client
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Elite Clients</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {currentMonth.elite_clients}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Premium: {currentMonth.premium_clients} | Pro: {currentMonth.pro_clients}
              </div>
            </motion.div>
          </div>
        )}

        {/* Tier Distribution */}
        {currentMonth && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-3 text-sm">Client Tier Distribution</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">Base</div>
                <div className="text-lg font-bold">{currentMonth.base_clients}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((currentMonth.base_clients / currentMonth.total_clients) * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium
                </div>
                <div className="text-lg font-bold text-blue-400">{currentMonth.premium_clients}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((currentMonth.premium_clients / currentMonth.total_clients) * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <Star className="w-3 h-3" />
                  Pro
                </div>
                <div className="text-lg font-bold text-purple-400">{currentMonth.pro_clients}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((currentMonth.pro_clients / currentMonth.total_clients) * 100)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
                  <Crown className="w-3 h-3" />
                  Elite
                </div>
                <div className="text-lg font-bold text-yellow-400">{currentMonth.elite_clients}</div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((currentMonth.elite_clients / currentMonth.total_clients) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retention Trend Chart */}
        {metrics.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-sm">6-Month Retention Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" style={{ fontSize: '12px' }} />
                <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clients"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Total Clients"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Active Clients"
                />
                <Line
                  type="monotone"
                  dataKey="retention"
                  stroke="#a855f7"
                  strokeWidth={2}
                  name="Retention %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {metrics.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No retention metrics yet</p>
            <p className="text-xs mt-1">
              Metrics will automatically calculate at the end of each month
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientRetentionMetrics;
