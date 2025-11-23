import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const TIER_COLORS = {
  base: '#94a3b8',
  premium: '#3b82f6',
  pro: '#8b5cf6',
  elite: '#f59e0b'
};

const RETENTION_PERIODS = [
  { value: '30', label: '30 Days' },
  { value: '60', label: '60 Days' },
  { value: '90', label: '90 Days' },
  { value: '180', label: '6 Months' },
  { value: '365', label: '1 Year' }
];

const RetentionAnalytics = ({ nutritionistId, compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('90');
  const [retentionData, setRetentionData] = useState({
    overall: {
      totalClients: 0,
      activeClients: 0,
      retentionRate: 0,
      churnRate: 0,
      newClients: 0,
      lostClients: 0
    },
    byTier: {},
    cohortAnalysis: [],
    retentionTrend: [],
    churnReasons: []
  });

  useEffect(() => {
    if (nutritionistId) {
      fetchRetentionData();
    }
  }, [nutritionistId, selectedPeriod]);

  const fetchRetentionData = async () => {
    try {
      setLoading(true);

      const days = parseInt(selectedPeriod);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch all clients
      const { data: allClients, error: clientsError } = await supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          created_at,
          user_profiles (
            id,
            tier,
            created_at
          ),
          meals (id, created_at),
          workout_logs (id, created_at),
          water_intake (id, created_at)
        `)
        .eq('nutritionist_id', nutritionistId);

      if (clientsError) throw clientsError;

      // Calculate retention metrics
      const now = new Date();
      const cutoffDate = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000)); // 14 days ago

      const activeClients = allClients.filter(client => {
        const recentActivity = [
          ...(client.meals || []),
          ...(client.workout_logs || []),
          ...(client.water_intake || [])
        ].some(activity => new Date(activity.created_at) >= cutoffDate);

        return recentActivity;
      });

      const totalClients = allClients.length;
      const activeCount = activeClients.length;
      const retentionRate = totalClients > 0 ? ((activeCount / totalClients) * 100) : 0;
      const churnRate = 100 - retentionRate;

      // New clients in period
      const newClients = allClients.filter(c =>
        new Date(c.created_at) >= startDate
      ).length;

      // Lost clients (no activity in 30+ days)
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const lostClients = allClients.filter(client => {
        const lastActivity = [
          ...(client.meals || []),
          ...(client.workout_logs || []),
          ...(client.water_intake || [])
        ].reduce((latest, activity) => {
          const activityDate = new Date(activity.created_at);
          return activityDate > latest ? activityDate : latest;
        }, new Date(0));

        return lastActivity < thirtyDaysAgo;
      }).length;

      // Retention by tier
      const byTier = {};
      ['base', 'premium', 'pro', 'elite'].forEach(tier => {
        const tierClients = allClients.filter(c => c.user_profiles.tier === tier);
        const tierActive = activeClients.filter(c => c.user_profiles.tier === tier);

        byTier[tier] = {
          total: tierClients.length,
          active: tierActive.length,
          retentionRate: tierClients.length > 0
            ? ((tierActive.length / tierClients.length) * 100)
            : 0
        };
      });

      // Cohort analysis (monthly)
      const cohortAnalysis = [];
      for (let i = 0; i < 6; i++) {
        const cohortStart = new Date();
        cohortStart.setMonth(cohortStart.getMonth() - i - 1);
        const cohortEnd = new Date(cohortStart);
        cohortEnd.setMonth(cohortEnd.getMonth() + 1);

        const cohortClients = allClients.filter(c => {
          const joinDate = new Date(c.created_at);
          return joinDate >= cohortStart && joinDate < cohortEnd;
        });

        const cohortActive = cohortClients.filter(client => {
          const recentActivity = [
            ...(client.meals || []),
            ...(client.workout_logs || []),
            ...(client.water_intake || [])
          ].some(activity => new Date(activity.created_at) >= cutoffDate);

          return recentActivity;
        });

        cohortAnalysis.unshift({
          month: cohortStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          total: cohortClients.length,
          active: cohortActive.length,
          retentionRate: cohortClients.length > 0
            ? ((cohortActive.length / cohortClients.length) * 100)
            : 0
        });
      }

      // Retention trend (weekly over period)
      const retentionTrend = [];
      const weeksInPeriod = Math.ceil(days / 7);

      for (let i = weeksInPeriod - 1; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekActive = allClients.filter(client => {
          const weekActivity = [
            ...(client.meals || []),
            ...(client.workout_logs || []),
            ...(client.water_intake || [])
          ].some(activity => {
            const activityDate = new Date(activity.created_at);
            return activityDate >= weekStart && activityDate < weekEnd;
          });

          return weekActivity;
        }).length;

        retentionTrend.push({
          week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          activeClients: weekActive,
          retentionRate: totalClients > 0 ? ((weekActive / totalClients) * 100) : 0
        });
      }

      setRetentionData({
        overall: {
          totalClients,
          activeClients: activeCount,
          retentionRate,
          churnRate,
          newClients,
          lostClients
        },
        byTier,
        cohortAnalysis,
        retentionTrend,
        churnReasons: [] // This would come from a survey or feedback system
      });
    } catch (error) {
      console.error('Error fetching retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tierChartData = Object.entries(retentionData.byTier).map(([tier, data]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    retentionRate: data.retentionRate,
    total: data.total,
    active: data.active,
    color: TIER_COLORS[tier]
  }));

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Retention Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {retentionData.overall.retentionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              {retentionData.overall.activeClients} of {retentionData.overall.totalClients} clients active
            </p>
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
                <TrendingUp className="w-6 h-6" />
                Client Retention Analytics
              </CardTitle>
              <CardDescription>
                Track client retention rates and identify trends by tier
              </CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETENTION_PERIODS.map(period => (
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Total Clients</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {retentionData.overall.totalClients}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Active Clients</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {retentionData.overall.activeClients}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Retention Rate</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {retentionData.overall.retentionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Churn Rate</span>
              </div>
              <div className="text-3xl font-bold text-red-700">
                {retentionData.overall.churnRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-medium">New Clients</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                +{retentionData.overall.newClients}
              </div>
              <p className="text-xs text-gray-600 mt-1">Last {selectedPeriod} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-xs font-medium">Lost Clients</span>
              </div>
              <div className="text-3xl font-bold text-red-600">
                -{retentionData.overall.lostClients}
              </div>
              <p className="text-xs text-gray-600 mt-1">Last 30+ days</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Retention Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Trend</CardTitle>
          <CardDescription>Weekly client retention over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retentionData.retentionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis
                yAxisId="left"
                label={{ value: 'Active Clients', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Retention %', angle: 90, position: 'insideRight' }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="activeClients"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Active Clients"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="retentionRate"
                stroke="#10b981"
                strokeWidth={2}
                name="Retention %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Retention by Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Retention by Tier</CardTitle>
            <CardDescription>Compare retention rates across subscription tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tierChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="retentionRate" name="Retention Rate">
                  {tierChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>Client distribution across tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tierChartData.map(tier => (
                <div key={tier.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="font-medium">{tier.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {tier.active}/{tier.total} ({tier.retentionRate.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${tier.retentionRate}%`,
                        backgroundColor: tier.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>Retention rates by client join month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Cohort Month</th>
                  <th className="text-right p-3 font-medium">Total Clients</th>
                  <th className="text-right p-3 font-medium">Active Now</th>
                  <th className="text-right p-3 font-medium">Retention Rate</th>
                </tr>
              </thead>
              <tbody>
                {retentionData.cohortAnalysis.map((cohort, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{cohort.month}</td>
                    <td className="text-right p-3">{cohort.total}</td>
                    <td className="text-right p-3">{cohort.active}</td>
                    <td className="text-right p-3">
                      <Badge
                        className={
                          cohort.retentionRate >= 75
                            ? 'bg-green-100 text-green-700'
                            : cohort.retentionRate >= 50
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {cohort.retentionRate.toFixed(1)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertTriangle className="w-5 h-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-900">
            {retentionData.overall.retentionRate < 70 && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Your retention rate ({retentionData.overall.retentionRate.toFixed(1)}%) is below the industry average of 75%.
                  Consider implementing more engagement strategies.
                </p>
              </div>
            )}
            {retentionData.overall.churnRate > 30 && (
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  High churn rate detected ({retentionData.overall.churnRate.toFixed(1)}%).
                  Focus on at-risk clients with proactive follow-ups.
                </p>
              </div>
            )}
            {Object.entries(retentionData.byTier).some(([tier, data]) =>
              data.retentionRate < retentionData.overall.retentionRate - 10
            ) && (
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Some tiers have significantly lower retention. Review engagement strategies per tier level.
                </p>
              </div>
            )}
            {retentionData.overall.newClients > retentionData.overall.lostClients * 2 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Great news! You're acquiring new clients faster than losing them.
                  Your client base is growing {((retentionData.overall.newClients / (retentionData.overall.totalClients || 1)) * 100).toFixed(1)}% this period.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetentionAnalytics;
