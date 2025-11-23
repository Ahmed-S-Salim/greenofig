import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const TIER_PRICING = {
  base: 0,
  premium: 9.99,
  pro: 19.99,
  elite: 29.99
};

const TIER_COLORS = {
  base: '#94a3b8',
  premium: '#3b82f6',
  pro: '#8b5cf6',
  elite: '#f59e0b'
};

const TIME_PERIODS = [
  { value: '30', label: 'Last 30 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '180', label: 'Last 6 Months' },
  { value: '365', label: 'Last Year' }
];

const RevenuePerClient = ({ nutritionistId, compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('90');
  const [revenueData, setRevenueData] = useState({
    overall: {
      totalRevenue: 0,
      averageRPC: 0,
      totalClients: 0,
      payingClients: 0,
      monthlyRecurring: 0,
      projectedAnnual: 0
    },
    byTier: {},
    clientSegments: [],
    revenueTrend: [],
    topClients: []
  });

  useEffect(() => {
    if (nutritionistId) {
      fetchRevenueData();
    }
  }, [nutritionistId, selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);

      const days = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch all clients with tier information
      const { data: clients, error: clientsError } = await supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          created_at,
          user_profiles (
            id,
            full_name,
            email,
            tier,
            created_at
          )
        `)
        .eq('nutritionist_id', nutritionistId);

      if (clientsError) throw clientsError;

      // Calculate revenue metrics
      let totalRevenue = 0;
      const byTier = {};

      clients.forEach(client => {
        const tier = client.user_profiles.tier;
        const tierPrice = TIER_PRICING[tier] || 0;
        const joinDate = new Date(client.created_at);

        // Calculate months subscribed within period
        const monthsSubscribed = joinDate >= startDate
          ? Math.max(1, Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24 * 30)))
          : Math.floor(days / 30);

        const clientRevenue = tierPrice * monthsSubscribed;
        totalRevenue += clientRevenue;

        if (!byTier[tier]) {
          byTier[tier] = {
            count: 0,
            revenue: 0,
            avgRPC: 0
          };
        }

        byTier[tier].count++;
        byTier[tier].revenue += clientRevenue;
      });

      // Calculate averages
      Object.keys(byTier).forEach(tier => {
        byTier[tier].avgRPC = byTier[tier].count > 0
          ? byTier[tier].revenue / byTier[tier].count
          : 0;
      });

      const totalClients = clients.length;
      const payingClients = clients.filter(c => c.user_profiles.tier !== 'base').length;
      const averageRPC = totalClients > 0 ? totalRevenue / totalClients : 0;

      // Calculate monthly recurring revenue (MRR)
      const monthlyRecurring = clients.reduce((sum, client) => {
        return sum + (TIER_PRICING[client.user_profiles.tier] || 0);
      }, 0);

      const projectedAnnual = monthlyRecurring * 12;

      // Revenue trend (monthly over period)
      const revenueTrend = [];
      const monthsInPeriod = Math.ceil(days / 30);

      for (let i = monthsInPeriod - 1; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthClients = clients.filter(c =>
          new Date(c.created_at) <= monthEnd
        );

        const monthRevenue = monthClients.reduce((sum, client) => {
          return sum + (TIER_PRICING[client.user_profiles.tier] || 0);
        }, 0);

        const monthRPC = monthClients.length > 0
          ? monthRevenue / monthClients.length
          : 0;

        revenueTrend.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthRevenue,
          clients: monthClients.length,
          rpc: monthRPC
        });
      }

      // Client segments by value
      const clientSegments = [
        {
          segment: 'High Value (Elite)',
          min: 25,
          color: '#f59e0b',
          clients: clients.filter(c => c.user_profiles.tier === 'elite'),
          avgRevenue: TIER_PRICING.elite
        },
        {
          segment: 'Medium-High (Pro)',
          min: 15,
          color: '#8b5cf6',
          clients: clients.filter(c => c.user_profiles.tier === 'pro'),
          avgRevenue: TIER_PRICING.pro
        },
        {
          segment: 'Medium (Premium)',
          min: 5,
          color: '#3b82f6',
          clients: clients.filter(c => c.user_profiles.tier === 'premium'),
          avgRevenue: TIER_PRICING.premium
        },
        {
          segment: 'Low Value (Base)',
          min: 0,
          color: '#94a3b8',
          clients: clients.filter(c => c.user_profiles.tier === 'base'),
          avgRevenue: 0
        }
      ].map(seg => ({
        ...seg,
        count: seg.clients.length,
        totalRevenue: seg.clients.length * seg.avgRevenue,
        percentage: (seg.clients.length / totalClients * 100) || 0
      }));

      // Top clients by revenue
      const topClients = clients
        .map(client => ({
          id: client.client_id,
          name: client.user_profiles.full_name,
          tier: client.user_profiles.tier,
          monthlyValue: TIER_PRICING[client.user_profiles.tier] || 0,
          totalValue: (TIER_PRICING[client.user_profiles.tier] || 0) *
            Math.max(1, Math.floor((new Date() - new Date(client.created_at)) / (1000 * 60 * 60 * 24 * 30)))
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);

      setRevenueData({
        overall: {
          totalRevenue,
          averageRPC,
          totalClients,
          payingClients,
          monthlyRecurring,
          projectedAnnual
        },
        byTier,
        clientSegments,
        revenueTrend,
        topClients
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Per Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${revenueData.overall.averageRPC.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Average per client</p>
            <div className="mt-4 pt-4 border-t">
              <div className="text-2xl font-bold text-gray-900">
                ${revenueData.overall.monthlyRecurring.toFixed(2)}
              </div>
              <p className="text-xs text-gray-600">Monthly Recurring</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Revenue Per Client Analytics
              </CardTitle>
              <CardDescription>
                Track revenue metrics and client value across tiers
              </CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Total Revenue</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${revenueData.overall.totalRevenue.toFixed(0)}
              </div>
              <p className="text-xs text-green-600 mt-1">Last {selectedPeriod} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Avg RPC</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                ${revenueData.overall.averageRPC.toFixed(2)}
              </div>
              <p className="text-xs text-blue-600 mt-1">Per client average</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Total Clients</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {revenueData.overall.totalClients}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Paying Clients</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {revenueData.overall.payingClients}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {((revenueData.overall.payingClients / revenueData.overall.totalClients) * 100 || 0).toFixed(1)}% conversion
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Monthly Recurring</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                ${revenueData.overall.monthlyRecurring.toFixed(0)}
              </div>
              <p className="text-xs text-orange-600 mt-1">MRR</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Projected Annual</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${revenueData.overall.projectedAnnual.toFixed(0)}
              </div>
              <p className="text-xs text-gray-600 mt-1">ARR</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly revenue and RPC over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData.revenueTrend}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                yAxisId="left"
                label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'RPC ($)', angle: 90, position: 'insideRight' }}
              />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="url(#revenueGradient)"
                name="Revenue"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="rpc"
                stroke="#3b82f6"
                strokeWidth={2}
                name="RPC"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Tier & Client Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Tier</CardTitle>
            <CardDescription>Revenue breakdown across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(revenueData.byTier).map(([tier, data]) => (
                <div key={tier}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: TIER_COLORS[tier] }}
                      />
                      <span className="font-medium capitalize">{tier}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold">${data.revenue.toFixed(0)}</span>
                      <span className="text-gray-600 ml-2">({data.count} clients)</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(data.revenue / revenueData.overall.totalRevenue) * 100}%`,
                        backgroundColor: TIER_COLORS[tier]
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Avg RPC: ${data.avgRPC.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Value Segments</CardTitle>
            <CardDescription>Distribution of clients by value tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.clientSegments.map((segment, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{segment.segment}</div>
                      <div className="text-xs text-gray-600">
                        {segment.count} clients • ${segment.avgRevenue}/mo
                      </div>
                    </div>
                    <Badge
                      style={{
                        backgroundColor: segment.color + '20',
                        color: segment.color,
                        border: `1px solid ${segment.color}`
                      }}
                    >
                      {segment.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${segment.percentage}%`,
                        backgroundColor: segment.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Clients</CardTitle>
          <CardDescription>Your most valuable clients by lifetime value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueData.topClients.map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-xs text-gray-600 capitalize">
                      {client.tier} tier
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    ${client.totalValue.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">
                    ${client.monthlyValue}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenuePerClient;
