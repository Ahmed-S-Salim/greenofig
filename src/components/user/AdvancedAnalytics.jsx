import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Target,
  Zap,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdvancedAnalytics = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [healthData, setHealthData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [trends, setTrends] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('weight');

  useEffect(() => {
    if (userProfile?.id) {
      fetchAnalyticsData();
    }
  }, [userProfile?.id, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch all health metrics
      const { data: weightData, error: weightError } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const { data: sleepData, error: sleepError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const { data: workoutData, error: workoutError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      const { data: macroData, error: macroError } = await supabase
        .from('daily_macros')
        .select('*')
        .eq('user_id', userProfile.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Combine all data by date
      const combinedData = combineHealthData(weightData, sleepData, workoutData, macroData);
      setHealthData(combinedData);

      // Calculate correlations
      const correlations = calculateCorrelations(combinedData);
      setCorrelationData(correlations);

      // Calculate trends
      const trendAnalysis = calculateTrends(combinedData);
      setTrends(trendAnalysis);

      // Generate predictions
      const predictedData = generatePredictions(combinedData);
      setPredictions(predictedData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToLoadAnalytics') || 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const combineHealthData = (weight, sleep, workout, macros) => {
    const dataMap = new Map();

    weight?.forEach(w => {
      const date = w.date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      dataMap.get(date).weight = w.weight_kg;
    });

    sleep?.forEach(s => {
      const date = s.date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      dataMap.get(date).sleep = s.hours;
      dataMap.get(date).sleepQuality = s.quality_rating;
    });

    workout?.forEach(w => {
      const date = w.date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      dataMap.get(date).workout = w.duration_minutes;
      dataMap.get(date).calories_burned = w.calories_burned;
    });

    macros?.forEach(m => {
      const date = m.date;
      if (!dataMap.has(date)) {
        dataMap.set(date, { date });
      }
      dataMap.get(date).calories = m.calories;
      dataMap.get(date).protein = m.protein;
      dataMap.get(date).carbs = m.carbs;
      dataMap.get(date).fat = m.fat;
    });

    return Array.from(dataMap.values()).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );
  };

  const calculateCorrelations = (data) => {
    if (data.length < 2) return [];

    const correlations = [];

    // Sleep vs Weight correlation
    const sleepWeightCorr = calculatePearsonCorrelation(
      data.map(d => d.sleep).filter(v => v !== undefined),
      data.map(d => d.weight).filter(v => v !== undefined)
    );
    correlations.push({
      metric1: 'Sleep',
      metric2: 'Weight',
      correlation: sleepWeightCorr,
      strength: getCorrelationStrength(sleepWeightCorr)
    });

    // Workout vs Weight correlation
    const workoutWeightCorr = calculatePearsonCorrelation(
      data.map(d => d.workout).filter(v => v !== undefined),
      data.map(d => d.weight).filter(v => v !== undefined)
    );
    correlations.push({
      metric1: 'Workout Duration',
      metric2: 'Weight',
      correlation: workoutWeightCorr,
      strength: getCorrelationStrength(workoutWeightCorr)
    });

    // Sleep vs Workout correlation
    const sleepWorkoutCorr = calculatePearsonCorrelation(
      data.map(d => d.sleep).filter(v => v !== undefined),
      data.map(d => d.workout).filter(v => v !== undefined)
    );
    correlations.push({
      metric1: 'Sleep',
      metric2: 'Workout Performance',
      correlation: sleepWorkoutCorr,
      strength: getCorrelationStrength(sleepWorkoutCorr)
    });

    // Calories vs Weight correlation
    const caloriesWeightCorr = calculatePearsonCorrelation(
      data.map(d => d.calories).filter(v => v !== undefined),
      data.map(d => d.weight).filter(v => v !== undefined)
    );
    correlations.push({
      metric1: 'Calorie Intake',
      metric2: 'Weight',
      correlation: caloriesWeightCorr,
      strength: getCorrelationStrength(caloriesWeightCorr)
    });

    return correlations;
  };

  const calculatePearsonCorrelation = (x, y) => {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sum_x = x.reduce((a, b) => a + b, 0);
    const sum_y = y.reduce((a, b) => a + b, 0);
    const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sum_y2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sum_xy - sum_x * sum_y;
    const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

    if (denominator === 0) return 0;
    return numerator / denominator;
  };

  const getCorrelationStrength = (corr) => {
    const abs = Math.abs(corr);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const calculateTrends = (data) => {
    if (data.length < 2) return null;

    const calculateTrend = (values) => {
      const validValues = values.filter(v => v !== undefined && v !== null);
      if (validValues.length < 2) return { trend: 'stable', change: 0, percentage: 0 };

      const first = validValues[0];
      const last = validValues[validValues.length - 1];
      const change = last - first;
      const percentage = (change / first) * 100;

      return {
        trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        change: Math.abs(change).toFixed(2),
        percentage: Math.abs(percentage).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    };

    return {
      weight: calculateTrend(data.map(d => d.weight)),
      sleep: calculateTrend(data.map(d => d.sleep)),
      workout: calculateTrend(data.map(d => d.workout)),
      calories: calculateTrend(data.map(d => d.calories)),
    };
  };

  const generatePredictions = (data) => {
    if (data.length < 3) return null;

    const predictNextValue = (values, label) => {
      const validValues = values.filter(v => v !== undefined && v !== null);
      if (validValues.length < 3) return null;

      // Simple linear regression
      const n = validValues.length;
      const x = Array.from({ length: n }, (_, i) => i);
      const y = validValues;

      const sum_x = x.reduce((a, b) => a + b, 0);
      const sum_y = y.reduce((a, b) => a + b, 0);
      const sum_xy = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
      const sum_x2 = x.reduce((sum, xi) => sum + xi * xi, 0);

      const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
      const intercept = (sum_y - slope * sum_x) / n;

      const predicted = slope * n + intercept;
      const confidence = calculateConfidence(validValues, predicted);

      return {
        label,
        current: validValues[validValues.length - 1].toFixed(2),
        predicted: predicted.toFixed(2),
        confidence: confidence.toFixed(0),
      };
    };

    const calculateConfidence = (values, predicted) => {
      const variance = values.reduce((sum, v) => sum + Math.pow(v - predicted, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coefficient = (stdDev / predicted) * 100;
      return Math.max(0, 100 - coefficient);
    };

    return {
      weight: predictNextValue(data.map(d => d.weight), 'Weight'),
      sleep: predictNextValue(data.map(d => d.sleep), 'Sleep'),
      workout: predictNextValue(data.map(d => d.workout), 'Workout Duration'),
    };
  };

  const TrendCard = ({ title, trend, icon: Icon }) => {
    if (!trend) return null;

    const TrendIcon = trend.direction === 'up' ? TrendingUp : trend.direction === 'down' ? TrendingDown : Activity;
    const trendColor = trend.direction === 'up' ? 'text-green-500' : trend.direction === 'down' ? 'text-red-500' : 'text-yellow-500';

    return (
      <Card className="glass-effect">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{title}</span>
            </div>
            <TrendIcon className={`w-5 h-5 ${trendColor}`} />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold">{trend.change}</p>
            <p className={`text-xs ${trendColor}`}>{trend.percentage}% change</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CorrelationBadge = ({ correlation }) => {
    const strength = Math.abs(correlation);
    let color = 'bg-gray-500/20 text-gray-300';
    if (strength >= 0.7) color = 'bg-green-500/20 text-green-300';
    else if (strength >= 0.4) color = 'bg-yellow-500/20 text-yellow-300';
    else if (strength >= 0.2) color = 'bg-orange-500/20 text-orange-300';

    return (
      <Badge className={color}>
        {correlation > 0 ? '+' : ''}{(correlation * 100).toFixed(0)}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" />
                {t('advancedAnalytics') || 'Advanced Analytics'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('advancedAnalyticsDescription') || 'Deep insights, trends, and predictive analysis of your health data'}
              </p>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('last7Days') || 'Last 7 Days'}</SelectItem>
                <SelectItem value="30">{t('last30Days') || 'Last 30 Days'}</SelectItem>
                <SelectItem value="90">{t('last90Days') || 'Last 90 Days'}</SelectItem>
                <SelectItem value="180">{t('last6Months') || 'Last 6 Months'}</SelectItem>
                <SelectItem value="365">{t('lastYear') || 'Last Year'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trends">{t('trends') || 'Trends'}</TabsTrigger>
            <TabsTrigger value="correlations">{t('correlations') || 'Correlations'}</TabsTrigger>
            <TabsTrigger value="predictions">{t('predictions') || 'Predictions'}</TabsTrigger>
            <TabsTrigger value="detailed">{t('detailed') || 'Detailed'}</TabsTrigger>
          </TabsList>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {trends && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <TrendCard title="Weight" trend={trends.weight} icon={Target} />
                <TrendCard title="Sleep" trend={trends.sleep} icon={Activity} />
                <TrendCard title="Workout" trend={trends.workout} icon={Zap} />
                <TrendCard title="Calories" trend={trends.calories} icon={TrendingUp} />
              </div>
            )}

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">{t('multiMetricTrends') || 'Multi-Metric Trends'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="sleep" fill="#3b82f6" stroke="#3b82f6" name="Sleep (hrs)" />
                    <Bar yAxisId="right" dataKey="workout" fill="#22c55e" name="Workout (min)" />
                    <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#ef4444" name="Weight (kg)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Correlations Tab */}
          <TabsContent value="correlations" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">{t('metricCorrelations') || 'Metric Correlations'}</CardTitle>
                <p className="text-sm text-text-secondary">
                  {t('correlationDescription') || 'Discover how different health metrics influence each other'}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {correlationData.map((corr, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{corr.metric1} vs {corr.metric2}</p>
                        <p className="text-sm text-text-secondary">{corr.strength} correlation</p>
                      </div>
                      <CorrelationBadge correlation={corr.correlation} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">{t('correlationVisualization') || 'Correlation Visualization'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sleep" name="Sleep (hrs)" />
                    <YAxis dataKey="weight" name="Weight (kg)" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Sleep vs Weight" data={healthData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  {t('predictiveInsights') || 'Predictive Insights'}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  {t('predictionsDescription') || 'AI-powered predictions based on your historical data'}
                </p>
              </CardHeader>
              <CardContent>
                {predictions && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(predictions).filter(p => p).map((pred, idx) => (
                      <Card key={idx} className="glass-effect border-primary/30">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{pred.label}</h3>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-text-secondary">{t('current') || 'Current'}</p>
                              <p className="text-2xl font-bold">{pred.current}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-secondary">{t('predicted') || 'Predicted'}</p>
                              <p className="text-xl font-semibold text-primary">{pred.predicted}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${pred.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs">{pred.confidence}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">{t('trendProjection') || 'Trend Projection'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke="#ef4444" name="Actual Weight" strokeWidth={2} />
                    <Line type="monotone" dataKey="sleep" stroke="#3b82f6" name="Actual Sleep" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="text-lg">{t('detailedMetrics') || 'Detailed Metrics Analysis'}</CardTitle>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">{t('weight') || 'Weight'}</SelectItem>
                    <SelectItem value="sleep">{t('sleep') || 'Sleep'}</SelectItem>
                    <SelectItem value="workout">{t('workout') || 'Workout'}</SelectItem>
                    <SelectItem value="calories">{t('calories') || 'Calories'}</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
