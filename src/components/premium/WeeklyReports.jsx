import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Apple,
  Droplet,
  Dumbbell,
  Target,
  Award,
  BarChart3,
  PieChart,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const WeeklyReports = ({ compact = false }) => {
  const [reports, setReports] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, custom
  const [reportData, setReportData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const reportRef = React.useRef(null);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReports();
      generateReportData();
    }
  }, [user, selectedPeriod]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = async () => {
    try {
      const endDate = new Date();
      let startDate = new Date();

      // Set date range based on period
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Fetch all data for the period
      const [mealsRes, waterRes, workoutsRes, weightsRes, goalsRes] = await Promise.all([
        supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('water_intake')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startDate.toISOString())
          .lte('logged_at', endDate.toISOString()),
        supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startDate.toISOString())
          .lte('logged_at', endDate.toISOString()),
        supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('logged_at', startDate.toISOString())
          .lte('logged_at', endDate.toISOString())
          .order('logged_at', { ascending: true }),
        supabase
          .from('weekly_goals')
          .select('*')
          .eq('user_id', user.id)
          .gte('week_start', startDate.toISOString())
      ]);

      const meals = mealsRes.data || [];
      const water = waterRes.data || [];
      const workouts = workoutsRes.data || [];
      const weights = weightsRes.data || [];
      const goals = goalsRes.data || [];

      // Calculate statistics
      const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const avgCalories = meals.length > 0 ? Math.round(totalCalories / meals.length) : 0;
      const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
      const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
      const totalFat = meals.reduce((sum, m) => sum + (m.fat || 0), 0);

      const totalWater = water.reduce((sum, w) => sum + (w.amount || 0), 0);
      const avgWater = water.length > 0 ? Math.round(totalWater / 7) : 0;

      const totalWorkouts = workouts.length;
      const totalExerciseMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

      const weightChange = weights.length >= 2
        ? (weights[weights.length - 1].weight - weights[0].weight).toFixed(1)
        : 0;

      const completedGoals = goals.filter(g => g.status === 'completed').length;
      const totalGoals = goals.length;
      const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

      // Generate daily breakdown
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayMeals = meals.filter(m => m.created_at.startsWith(dateStr));
        const dayWater = water.filter(w => w.logged_at.startsWith(dateStr));
        const dayWorkouts = workouts.filter(w => w.logged_at.startsWith(dateStr));

        dailyData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          calories: dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0),
          water: dayWater.reduce((sum, w) => sum + (w.amount || 0), 0),
          workouts: dayWorkouts.length
        });
      }

      // Macro distribution
      const macroData = [
        { name: 'Protein', value: totalProtein, color: COLORS[0] },
        { name: 'Carbs', value: totalCarbs, color: COLORS[1] },
        { name: 'Fat', value: totalFat, color: COLORS[2] }
      ];

      setReportData({
        period: selectedPeriod,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        summary: {
          totalMeals: meals.length,
          avgCalories,
          totalProtein: Math.round(totalProtein),
          totalCarbs: Math.round(totalCarbs),
          totalFat: Math.round(totalFat),
          totalWater,
          avgWater,
          totalWorkouts,
          totalExerciseMinutes,
          weightChange,
          completedGoals,
          totalGoals,
          goalCompletionRate
        },
        dailyData,
        macroData,
        weights
      });
    } catch (error) {
      console.error('Error generating report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report data',
        variant: 'destructive'
      });
    }
  };

  const generatePDF = async () => {
    if (!reportData || !reportRef.current) return;

    setGenerating(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const fileName = `GreenoFig_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Save report record to database
      await supabase.from('weekly_reports').insert({
        user_id: user.id,
        period_type: selectedPeriod,
        start_date: reportData.startDate,
        end_date: reportData.endDate,
        report_data: reportData
      });

      toast({
        title: 'Success',
        description: 'PDF report generated successfully'
      });

      fetchReports();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Weekly Reports
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {reports.length} reports generated • Comprehensive progress tracking
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={generatePDF}
                disabled={generating || !reportData}
                className="gap-2 bg-gradient-to-r from-primary to-purple-600"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Preview */}
      <div ref={reportRef} className="bg-white dark:bg-gray-900 p-8 rounded-lg space-y-6">
        {reportData && (
          <>
            {/* Header */}
            <div className="text-center border-b pb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                GreenoFig Progress Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(reportData.startDate).toLocaleDateString()} - {new Date(reportData.endDate).toLocaleDateString()}
              </p>
              <Badge className="mt-2">{userProfile?.full_name || 'User'}</Badge>
            </div>

            {/* Summary Stats */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Apple className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Meals</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{reportData.summary.totalMeals}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Avg {reportData.summary.avgCalories} cal/meal
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-cyan-600" />
                    <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Water Intake</p>
                  </div>
                  <p className="text-2xl font-bold text-cyan-600">{reportData.summary.totalWater}ml</p>
                  <p className="text-xs text-cyan-700 dark:text-cyan-300">
                    Avg {reportData.summary.avgWater}ml/day
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Workouts</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{reportData.summary.totalWorkouts}</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">
                    {reportData.summary.totalExerciseMinutes} min total
                  </p>
                </div>

                <div className={`p-4 rounded-lg border ${
                  parseFloat(reportData.summary.weightChange) < 0
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {parseFloat(reportData.summary.weightChange) < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`text-sm font-medium ${
                      parseFloat(reportData.summary.weightChange) < 0
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-red-900 dark:text-red-100'
                    }`}>
                      Weight Change
                    </p>
                  </div>
                  <p className={`text-2xl font-bold ${
                    parseFloat(reportData.summary.weightChange) < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {reportData.summary.weightChange > 0 ? '+' : ''}{reportData.summary.weightChange}kg
                  </p>
                </div>
              </div>
            </div>

            {/* Nutrition Breakdown */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nutrition Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Macro Distribution */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Macro Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={reportData.macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Macro Totals */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Total Macros</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Protein</span>
                      <span className="text-lg font-bold text-blue-600">{reportData.summary.totalProtein}g</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">Carbs</span>
                      <span className="text-lg font-bold text-green-600">{reportData.summary.totalCarbs}g</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950">
                      <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Fat</span>
                      <span className="text-lg font-bold text-orange-600">{reportData.summary.totalFat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Activity */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Daily Activity</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={reportData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="calories" fill={COLORS[0]} name="Calories" />
                  <Bar yAxisId="right" dataKey="water" fill={COLORS[1]} name="Water (ml)" />
                  <Bar yAxisId="right" dataKey="workouts" fill={COLORS[2]} name="Workouts" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Goals Progress */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Goals Progress</h2>
              <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-800 border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {reportData.summary.goalCompletionRate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {reportData.summary.completedGoals} of {reportData.summary.totalGoals} goals
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {reportData.summary.completedGoals} completed
                      </span>
                    </div>
                  </div>
                </div>
                <Progress value={reportData.summary.goalCompletionRate} className="h-3" />
              </div>
            </div>

            {/* Weight Progress */}
            {reportData.weights.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Weight Progress</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={reportData.weights.map(w => ({
                    date: new Date(w.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    weight: w.weight
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="weight" stroke={COLORS[3]} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Footer */}
            <div className="border-t pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Generated by GreenoFig • {new Date().toLocaleDateString()}</p>
              <p className="mt-2">Keep up the great work! 💪</p>
            </div>
          </>
        )}
      </div>

      {/* Previous Reports */}
      {reports.length > 0 && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Previous Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.slice(0, 5).map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.period_type === 'week' ? 'Weekly' : 'Monthly'} Report
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {new Date(report.created_at).toLocaleDateString()}
                    </Badge>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeeklyReports;
