import React, { useState, useEffect } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Clock,
  Activity,
  MessageSquare,
  Target,
  Send,
  CheckCircle2,
  X as XIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RISK_LEVELS = {
  high: {
    label: 'High Risk',
    color: 'bg-red-100 text-red-700 border-red-300',
    threshold: 75,
    icon: AlertTriangle
  },
  medium: {
    label: 'Medium Risk',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    threshold: 50,
    icon: TrendingDown
  },
  low: {
    label: 'Low Risk',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    threshold: 25,
    icon: Activity
  }
};

const ChurnPrediction = ({ nutritionistId, compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [atRiskClients, setAtRiskClients] = useState([]);
  const [churnStats, setChurnStats] = useState({
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    totalAtRisk: 0,
    churnRate: 0
  });
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    if (nutritionistId) {
      predictChurn();
    }
  }, [nutritionistId]);

  const calculateRiskScore = (client) => {
    let riskScore = 0;
    const now = new Date();

    // Factor 1: Days since last activity (40 points max)
    const activities = [
      ...(client.meals || []),
      ...(client.workout_logs || []),
      ...(client.water_intake || [])
    ];

    if (activities.length === 0) {
      riskScore += 40;
    } else {
      const lastActivity = activities.reduce((latest, activity) => {
        const activityDate = new Date(activity.created_at);
        return activityDate > latest ? activityDate : latest;
      }, new Date(0));

      const daysSinceActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysSinceActivity > 14) riskScore += 40;
      else if (daysSinceActivity > 7) riskScore += 30;
      else if (daysSinceActivity > 3) riskScore += 15;
    }

    // Factor 2: Activity frequency (30 points max)
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const recentActivities = activities.filter(a => new Date(a.created_at) >= last30Days);
    const activeDays = new Set(recentActivities.map(a =>
      new Date(a.created_at).toDateString()
    )).size;

    if (activeDays < 5) riskScore += 30;
    else if (activeDays < 10) riskScore += 20;
    else if (activeDays < 15) riskScore += 10;

    // Factor 3: Engagement trend (20 points max)
    const last14Days = activities.filter(a =>
      new Date(a.created_at) >= new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))
    ).length;

    const prev14Days = activities.filter(a => {
      const activityDate = new Date(a.created_at);
      return activityDate >= new Date(now.getTime() - (28 * 24 * 60 * 60 * 1000)) &&
             activityDate < new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    }).length;

    if (prev14Days > 0 && last14Days < prev14Days * 0.5) {
      riskScore += 20; // Activity dropped by 50%+
    } else if (prev14Days > 0 && last14Days < prev14Days * 0.75) {
      riskScore += 10; // Activity dropped by 25%+
    }

    // Factor 4: Goal progress (10 points max)
    const activeGoal = client.client_goals?.find(g => g.status === 'active');
    if (activeGoal) {
      const progress = (activeGoal.current_value / activeGoal.target_value) * 100;
      if (progress < 25) riskScore += 10;
      else if (progress < 50) riskScore += 5;
    } else {
      riskScore += 10; // No active goal
    }

    return Math.min(riskScore, 100);
  };

  const getRiskLevel = (score) => {
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 25) return 'low';
    return 'none';
  };

  const predictChurn = async () => {
    try {
      setLoading(true);

      // Fetch all clients with activity data
      const { data: clients, error } = await supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          created_at,
          user_profiles (
            id,
            full_name,
            email,
            tier
          ),
          meals (id, created_at),
          workout_logs (id, created_at),
          water_intake (id, created_at),
          client_goals (
            goal_type,
            target_value,
            current_value,
            status
          )
        `)
        .eq('nutritionist_id', nutritionistId);

      if (error) throw error;

      // Calculate risk scores
      const clientsWithRisk = clients.map(client => {
        const riskScore = calculateRiskScore(client);
        const riskLevel = getRiskLevel(riskScore);

        return {
          id: client.user_profiles.id,
          name: client.user_profiles.full_name,
          email: client.user_profiles.email,
          tier: client.user_profiles.tier,
          riskScore,
          riskLevel,
          lastActivity: getLastActivity(client),
          activeDays: getActiveDays(client),
          goals: client.client_goals || [],
          activities: [
            ...(client.meals || []),
            ...(client.workout_logs || []),
            ...(client.water_intake || [])
          ]
        };
      });

      // Filter at-risk clients (score >= 25)
      const atRisk = clientsWithRisk
        .filter(c => c.riskScore >= 25)
        .sort((a, b) => b.riskScore - a.riskScore);

      // Calculate stats
      const stats = {
        highRisk: atRisk.filter(c => c.riskLevel === 'high').length,
        mediumRisk: atRisk.filter(c => c.riskLevel === 'medium').length,
        lowRisk: atRisk.filter(c => c.riskLevel === 'low').length,
        totalAtRisk: atRisk.length,
        churnRate: clients.length > 0 ? (atRisk.length / clients.length) * 100 : 0
      };

      setAtRiskClients(atRisk);
      setChurnStats(stats);
    } catch (error) {
      console.error('Error predicting churn:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastActivity = (client) => {
    const activities = [
      ...(client.meals || []),
      ...(client.workout_logs || []),
      ...(client.water_intake || [])
    ];

    if (activities.length === 0) return null;

    const lastActivity = activities.reduce((latest, activity) => {
      const activityDate = new Date(activity.created_at);
      return activityDate > latest ? activityDate : latest;
    }, new Date(0));

    return lastActivity;
  };

  const getActiveDays = (client) => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    const activities = [
      ...(client.meals || []),
      ...(client.workout_logs || []),
      ...(client.water_intake || [])
    ].filter(a => new Date(a.created_at) >= last30Days);

    return new Set(activities.map(a => new Date(a.created_at).toDateString())).size;
  };

  const sendReengagementMessage = async (clientId) => {
    // This would integrate with MessageTemplates component
    alert(`Sending re-engagement message to client ${clientId}`);
  };

  if (compact) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-5 h-5" />
            Churn Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-700 mb-2">
              {churnStats.totalAtRisk}
            </div>
            <p className="text-sm text-orange-800">
              Clients at risk of churning
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Badge className="bg-red-100 text-red-700">
                {churnStats.highRisk} High
              </Badge>
              <Badge className="bg-orange-100 text-orange-700">
                {churnStats.mediumRisk} Medium
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="w-6 h-6" />
            Churn Prediction & Prevention
          </CardTitle>
          <CardDescription className="text-orange-800">
            Identify at-risk clients and take action before they churn
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Risk Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">High Risk</span>
              </div>
              <div className="text-3xl font-bold text-red-700">
                {churnStats.highRisk}
              </div>
              <p className="text-xs text-red-600 mt-1">Immediate action needed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium">Medium Risk</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                {churnStats.mediumRisk}
              </div>
              <p className="text-xs text-orange-600 mt-1">Monitor closely</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Low Risk</span>
              </div>
              <div className="text-3xl font-bold text-yellow-700">
                {churnStats.lowRisk}
              </div>
              <p className="text-xs text-yellow-600 mt-1">Early warning</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Churn Rate</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {churnStats.churnRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600 mt-1">At-risk percentage</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* At-Risk Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Clients ({atRiskClients.length})</CardTitle>
          <CardDescription>
            Sorted by risk score - highest risk first
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Analyzing churn risk...</div>
          ) : atRiskClients.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients At Risk!</h3>
              <p className="text-gray-600">All your clients are actively engaged.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {atRiskClients.map((client, index) => {
                  const riskConfig = RISK_LEVELS[client.riskLevel];
                  const daysSinceActivity = client.lastActivity
                    ? Math.floor((new Date() - client.lastActivity) / (1000 * 60 * 60 * 24))
                    : 999;

                  return (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-2 rounded-lg p-4 ${riskConfig.color.replace('text', 'border')}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full ${riskConfig.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                            <riskConfig.icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{client.name}</h4>
                              <Badge className={riskConfig.color}>
                                Risk: {client.riskScore}%
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {client.tier}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-3">{client.email}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-600 text-xs">Last Activity</div>
                                <div className="font-medium">
                                  {daysSinceActivity === 999
                                    ? 'Never'
                                    : `${daysSinceActivity} days ago`}
                                </div>
                              </div>
                              <div>
                                <div className="text-gray-600 text-xs">Active Days (30d)</div>
                                <div className="font-medium">{client.activeDays}/30</div>
                              </div>
                              <div>
                                <div className="text-gray-600 text-xs">Total Activities</div>
                                <div className="font-medium">{client.activities.length}</div>
                              </div>
                              <div>
                                <div className="text-gray-600 text-xs">Active Goals</div>
                                <div className="font-medium">
                                  {client.goals.filter(g => g.status === 'active').length}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 pt-3 border-t">
                        <Button
                          size="sm"
                          onClick={() => sendReengagementMessage(client.id)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Target className="w-3 h-3 mr-1" />
                          Set Goal
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule Call
                        </Button>
                      </div>

                      {/* Risk Factors */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs font-medium text-gray-700 mb-2">Risk Factors:</div>
                        <div className="flex flex-wrap gap-2">
                          {daysSinceActivity > 14 && (
                            <Badge variant="outline" className="text-xs bg-red-50">
                              Inactive {daysSinceActivity}+ days
                            </Badge>
                          )}
                          {client.activeDays < 5 && (
                            <Badge variant="outline" className="text-xs bg-orange-50">
                              Low engagement ({client.activeDays} active days)
                            </Badge>
                          )}
                          {client.goals.filter(g => g.status === 'active').length === 0 && (
                            <Badge variant="outline" className="text-xs bg-yellow-50">
                              No active goals
                            </Badge>
                          )}
                          {client.activities.length < 10 && (
                            <Badge variant="outline" className="text-xs bg-gray-50">
                              Limited activity history
                            </Badge>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <MessageSquare className="w-5 h-5" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-blue-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>High-risk clients ({churnStats.highRisk}):</strong> Send personalized re-engagement message within 24 hours. Schedule a check-in call.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Medium-risk clients ({churnStats.mediumRisk}):</strong> Review their goals, send motivational messages, and offer additional support.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Low-risk clients ({churnStats.lowRisk}):</strong> Send gentle reminders about meal logging and offer tips to maintain momentum.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                <strong>Prevention:</strong> Set up automated weekly check-ins and celebrate small wins to keep clients engaged.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChurnPrediction;
