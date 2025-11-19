import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Calendar,
  Download,
  Mail,
  Loader2,
  BarChart3,
  CheckCircle2,
  AlertCircle,
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ProgressReports = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);

  useEffect(() => {
    if (userProfile?.id) {
      generateReport();
    }
  }, [userProfile?.id, reportPeriod]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();

      if (reportPeriod === 'weekly') {
        startDate.setDate(startDate.getDate() - 7);
      } else {
        startDate.setDate(startDate.getDate() - 30);
      }

      // Fetch all data for the period
      const [weightData, sleepData, workoutData, macroData, waterData] = await Promise.all([
        fetchData('weight_logs', startDate, endDate),
        fetchData('sleep_logs', startDate, endDate),
        fetchData('workout_logs', startDate, endDate),
        fetchData('daily_macros', startDate, endDate),
        fetchData('water_logs', startDate, endDate),
      ]);

      const report = {
        period: reportPeriod,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        summary: generateSummary(weightData, sleepData, workoutData, macroData, waterData),
        achievements: generateAchievements(weightData, sleepData, workoutData, macroData, waterData),
        improvements: generateImprovements(weightData, sleepData, workoutData, macroData, waterData),
        charts: {
          weight: weightData,
          sleep: sleepData,
          workout: workoutData,
        },
      };

      if (reportPeriod === 'weekly') {
        setWeeklyReport(report);
      } else {
        setMonthlyReport(report);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToGenerateReport') || 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (table, startDate, endDate) => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userProfile.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const generateSummary = (weight, sleep, workout, macro, water) => {
    return {
      totalWorkouts: workout.length,
      avgSleep: sleep.length > 0 ? (sleep.reduce((sum, s) => sum + s.hours, 0) / sleep.length).toFixed(1) : 0,
      avgCalories: macro.length > 0 ? Math.round(macro.reduce((sum, m) => sum + m.calories, 0) / macro.length) : 0,
      totalWater: water.reduce((sum, w) => sum + w.glasses, 0),
      weightChange: weight.length >= 2 ? (weight[weight.length - 1].weight_kg - weight[0].weight_kg).toFixed(1) : 0,
      workoutMinutes: workout.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
    };
  };

  const generateAchievements = (weight, sleep, workout, macro, water) => {
    const achievements = [];

    // Workout consistency
    if (workout.length >= 5) {
      achievements.push({
        icon: '💪',
        title: 'Workout Warrior',
        description: `Completed ${workout.length} workouts this period`,
        type: 'success',
      });
    }

    // Sleep quality
    const avgSleep = sleep.length > 0 ? sleep.reduce((sum, s) => sum + s.hours, 0) / sleep.length : 0;
    if (avgSleep >= 7) {
      achievements.push({
        icon: '😴',
        title: 'Sleep Champion',
        description: `Averaged ${avgSleep.toFixed(1)} hours of sleep`,
        type: 'success',
      });
    }

    // Water intake
    const totalWater = water.reduce((sum, w) => sum + w.glasses, 0);
    if (totalWater >= 56) { // 8 glasses x 7 days
      achievements.push({
        icon: '💧',
        title: 'Hydration Hero',
        description: `Drank ${totalWater} glasses of water`,
        type: 'success',
      });
    }

    // Weight progress
    if (weight.length >= 2) {
      const change = weight[weight.length - 1].weight_kg - weight[0].weight_kg;
      if (Math.abs(change) >= 0.5) {
        achievements.push({
          icon: change < 0 ? '📉' : '📈',
          title: 'Weight Progress',
          description: `${Math.abs(change).toFixed(1)} kg ${change < 0 ? 'lost' : 'gained'}`,
          type: change < 0 ? 'success' : 'info',
        });
      }
    }

    return achievements;
  };

  const generateImprovements = (weight, sleep, workout, macro, water) => {
    const improvements = [];

    // Check for areas needing improvement
    const avgSleep = sleep.length > 0 ? sleep.reduce((sum, s) => sum + s.hours, 0) / sleep.length : 0;
    if (avgSleep < 7) {
      improvements.push({
        icon: '😴',
        title: 'Improve Sleep',
        description: `Average ${avgSleep.toFixed(1)} hrs/night. Aim for 7-9 hours`,
        priority: 'high',
      });
    }

    if (workout.length < 3) {
      improvements.push({
        icon: '💪',
        title: 'Increase Activity',
        description: 'Try to workout at least 3-4 times per week',
        priority: 'medium',
      });
    }

    const totalWater = water.reduce((sum, w) => sum + w.glasses, 0);
    const avgWater = water.length > 0 ? totalWater / water.length : 0;
    if (avgWater < 6) {
      improvements.push({
        icon: '💧',
        title: 'Increase Hydration',
        description: 'Aim for at least 8 glasses of water daily',
        priority: 'medium',
      });
    }

    // Calorie consistency
    if (macro.length > 0) {
      const calorieVariance = calculateVariance(macro.map(m => m.calories));
      if (calorieVariance > 500) {
        improvements.push({
          icon: '🍽️',
          title: 'Stabilize Calorie Intake',
          description: 'Try to maintain more consistent daily calories',
          priority: 'low',
        });
      }
    }

    return improvements;
  };

  const calculateVariance = (values) => {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
  };

  const handleDownloadReport = () => {
    const report = reportPeriod === 'weekly' ? weeklyReport : monthlyReport;
    const content = generateReportText(report);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${report.startDate}-to-${report.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: t('reportDownloaded') || 'Report Downloaded',
      description: t('progressReportDownloaded') || 'Your progress report has been downloaded',
    });
  };

  const generateReportText = (report) => {
    let text = `GREENOFIG PROGRESS REPORT\n`;
    text += `Period: ${report.startDate} to ${report.endDate}\n`;
    text += `Generated: ${new Date().toLocaleString()}\n\n`;
    text += `=== SUMMARY ===\n`;
    text += `Total Workouts: ${report.summary.totalWorkouts}\n`;
    text += `Average Sleep: ${report.summary.avgSleep} hours\n`;
    text += `Average Calories: ${report.summary.avgCalories} kcal\n`;
    text += `Total Water: ${report.summary.totalWater} glasses\n`;
    text += `Weight Change: ${report.summary.weightChange} kg\n`;
    text += `Total Workout Minutes: ${report.summary.workoutMinutes} min\n\n`;
    text += `=== ACHIEVEMENTS ===\n`;
    report.achievements.forEach(a => {
      text += `${a.icon} ${a.title}: ${a.description}\n`;
    });
    text += `\n=== AREAS FOR IMPROVEMENT ===\n`;
    report.improvements.forEach(i => {
      text += `${i.icon} ${i.title}: ${i.description}\n`;
    });
    return text;
  };

  const currentReport = reportPeriod === 'weekly' ? weeklyReport : monthlyReport;

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-6 h-6 text-primary" />
                {t('progressReports') || 'Progress Reports'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('progressReportsDescription') || 'Automated weekly and monthly progress summaries'}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="weekly" className="w-full" onValueChange={setReportPeriod}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">{t('weeklyReport') || 'Weekly Report'}</TabsTrigger>
            <TabsTrigger value="monthly">{t('monthlyReport') || 'Monthly Report'}</TabsTrigger>
          </TabsList>

          {currentReport && (
            <>
              <TabsContent value={reportPeriod} className="space-y-6">
                {/* Report Header */}
                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {reportPeriod === 'weekly' ? t('weeklyReport') || 'Weekly Report' : t('monthlyReport') || 'Monthly Report'}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {new Date(currentReport.startDate).toLocaleDateString()} - {new Date(currentReport.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleDownloadReport}>
                          <Download className="w-4 h-4 mr-2" />
                          {t('download') || 'Download'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Card className="glass-effect">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{currentReport.summary.totalWorkouts}</div>
                      <p className="text-xs text-text-secondary mt-1">{t('workouts') || 'Workouts'}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{currentReport.summary.avgSleep}</div>
                      <p className="text-xs text-text-secondary mt-1">{t('avgSleep') || 'Avg Sleep (hrs)'}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{currentReport.summary.avgCalories}</div>
                      <p className="text-xs text-text-secondary mt-1">{t('avgCalories') || 'Avg Calories'}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{currentReport.summary.totalWater}</div>
                      <p className="text-xs text-text-secondary mt-1">{t('waterGlasses') || 'Water Glasses'}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-4 text-center">
                      <div className={`text-3xl font-bold ${currentReport.summary.weightChange < 0 ? 'text-green-500' : 'text-orange-500'}`}>
                        {currentReport.summary.weightChange > 0 ? '+' : ''}{currentReport.summary.weightChange}
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{t('weightChange') || 'Weight Change (kg)'}</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-effect">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{currentReport.summary.workoutMinutes}</div>
                      <p className="text-xs text-text-secondary mt-1">{t('activeMinutes') || 'Active Minutes'}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Achievements */}
                {currentReport.achievements.length > 0 && (
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        {t('achievements') || 'Achievements'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentReport.achievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                            <span className="text-3xl">{achievement.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{achievement.title}</h3>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              </div>
                              <p className="text-sm text-text-secondary">{achievement.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Areas for Improvement */}
                {currentReport.improvements.length > 0 && (
                  <Card className="glass-effect">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        {t('areasForImprovement') || 'Areas for Improvement'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentReport.improvements.map((improvement, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                            <span className="text-2xl">{improvement.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{improvement.title}</h3>
                                <Badge
                                  className={
                                    improvement.priority === 'high'
                                      ? 'bg-red-500/20 text-red-300'
                                      : improvement.priority === 'medium'
                                      ? 'bg-yellow-500/20 text-yellow-300'
                                      : 'bg-blue-500/20 text-blue-300'
                                  }
                                >
                                  {improvement.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-text-secondary">{improvement.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weight Chart */}
                  {currentReport.charts.weight.length > 0 && (
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="text-lg">{t('weightTrend') || 'Weight Trend'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={currentReport.charts.weight}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="weight_kg" stroke="#22c55e" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Sleep Chart */}
                  {currentReport.charts.sleep.length > 0 && (
                    <Card className="glass-effect">
                      <CardHeader>
                        <CardTitle className="text-lg">{t('sleepPattern') || 'Sleep Pattern'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={currentReport.charts.sleep}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="hours" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  );
};

export default ProgressReports;
