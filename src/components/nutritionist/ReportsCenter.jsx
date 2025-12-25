import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Printer,
  RefreshCw,
  Loader2,
  ChevronRight,
  BarChart3,
  PieChart,
  Target,
  Activity
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';

const ReportsCenter = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [reportData, setReportData] = useState({
    clientProgress: [],
    revenue: [],
    appointments: [],
    retention: []
  });

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchClientProgressReport(),
        fetchRevenueReport(),
        fetchAppointmentReport(),
        fetchRetentionReport()
      ]);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientProgressReport = async () => {
    try {
      const { data } = await supabase
        .from('client_progress')
        .select(`
          *,
          user:user_profiles!client_progress_user_id_fkey(full_name, email, tier)
        `)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)
        .order('created_at');

      // Process data for chart
      const dailyData = {};
      (data || []).forEach(entry => {
        const date = format(new Date(entry.created_at), 'MMM d');
        if (!dailyData[date]) {
          dailyData[date] = { date, entries: 0, avgWeight: 0, weights: [] };
        }
        dailyData[date].entries++;
        dailyData[date].weights.push(parseFloat(entry.weight_kg || 0));
      });

      const chartData = Object.values(dailyData).map(d => ({
        ...d,
        avgWeight: d.weights.length > 0 ? Math.round((d.weights.reduce((a, b) => a + b, 0) / d.weights.length) * 10) / 10 : 0
      }));

      setReportData(prev => ({ ...prev, clientProgress: chartData }));
    } catch (error) {
      console.error('Error fetching client progress:', error);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      const { data: clients } = await supabase
        .from('user_profiles')
        .select('id, tier, created_at')
        .eq('role', 'user')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      // Calculate monthly revenue based on tiers
      const tierPricing = { Base: 0, Premium: 29, Elite: 59 };
      const monthlyRevenue = {};

      (clients || []).forEach(client => {
        const month = format(new Date(client.created_at), 'MMM yyyy');
        if (!monthlyRevenue[month]) {
          monthlyRevenue[month] = { month, revenue: 0, newClients: 0 };
        }
        monthlyRevenue[month].revenue += tierPricing[client.tier] || 0;
        monthlyRevenue[month].newClients++;
      });

      // Also add estimated recurring revenue
      const { data: allClients } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('role', 'user');

      const totalMonthlyRecurring = (allClients || []).reduce((sum, c) => sum + (tierPricing[c.tier] || 0), 0);

      setReportData(prev => ({
        ...prev,
        revenue: {
          monthly: Object.values(monthlyRevenue),
          recurring: totalMonthlyRecurring,
          tierBreakdown: [
            { name: 'Base', value: (allClients || []).filter(c => c.tier === 'Base' || !c.tier).length },
            { name: 'Premium', value: (allClients || []).filter(c => c.tier === 'Premium').length },
            { name: 'Elite', value: (allClients || []).filter(c => c.tier === 'Elite').length }
          ]
        }
      }));
    } catch (error) {
      console.error('Error fetching revenue:', error);
    }
  };

  const fetchAppointmentReport = async () => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', dateRange.start)
        .lte('date', dateRange.end);

      const statusCounts = {
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0
      };

      const typeBreakdown = {};

      (data || []).forEach(apt => {
        statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1;
        const type = apt.consultation_type || 'Other';
        typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
      });

      setReportData(prev => ({
        ...prev,
        appointments: {
          total: data?.length || 0,
          statusBreakdown: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
          typeBreakdown: Object.entries(typeBreakdown).map(([name, value]) => ({ name, value })),
          completionRate: data?.length > 0
            ? Math.round((statusCounts.completed / data.length) * 100)
            : 0
        }
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchRetentionReport = async () => {
    try {
      const { data: allClients } = await supabase
        .from('user_profiles')
        .select('id, created_at')
        .eq('role', 'user');

      const { data: activeProgress } = await supabase
        .from('client_progress')
        .select('user_id, created_at')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      const activeUserIds = new Set((activeProgress || []).map(p => p.user_id));
      const totalClients = allClients?.length || 0;
      const activeClients = activeUserIds.size;
      const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

      // Monthly retention trend
      const monthlyRetention = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subDays(new Date(), i * 30));
        const monthEnd = endOfMonth(monthStart);
        const monthLabel = format(monthStart, 'MMM');

        const clientsAtStart = (allClients || []).filter(c =>
          new Date(c.created_at) <= monthEnd
        ).length;

        monthlyRetention.push({
          month: monthLabel,
          clients: clientsAtStart,
          retention: clientsAtStart > 0 ? Math.round((activeClients / clientsAtStart) * 100) : 0
        });
      }

      setReportData(prev => ({
        ...prev,
        retention: {
          current: retentionRate,
          totalClients,
          activeClients,
          trend: monthlyRetention
        }
      }));
    } catch (error) {
      console.error('Error fetching retention:', error);
    }
  };

  const generatePDFReport = async (type) => {
    setGenerating(true);
    try {
      // Create a printable report
      let reportContent = '';

      switch (type) {
        case 'client-progress':
          reportContent = generateClientProgressHTML();
          break;
        case 'revenue':
          reportContent = generateRevenueHTML();
          break;
        case 'appointments':
          reportContent = generateAppointmentsHTML();
          break;
        case 'retention':
          reportContent = generateRetentionHTML();
          break;
        default:
          reportContent = generateSummaryHTML();
      }

      // Open print dialog
      const printWindow = window.open('', '_blank');
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.print();

      toast({
        title: 'Report Generated',
        description: 'Your report is ready for printing or saving as PDF'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate report'
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateClientProgressHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Client Progress Report - GreenoFig</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #10b981; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; }
        .footer { margin-top: 40px; text-align: center; color: #888; }
      </style>
    </head>
    <body>
      <h1>Client Progress Report</h1>
      <p>Period: ${dateRange.start} to ${dateRange.end}</p>
      <p>Generated: ${format(new Date(), 'PPP')}</p>

      <h2>Summary</h2>
      <p>Total Progress Entries: ${reportData.clientProgress.reduce((sum, d) => sum + d.entries, 0)}</p>

      <h2>Daily Activity</h2>
      <table>
        <tr><th>Date</th><th>Entries</th><th>Avg Weight (kg)</th></tr>
        ${reportData.clientProgress.map(d => `
          <tr><td>${d.date}</td><td>${d.entries}</td><td>${d.avgWeight}</td></tr>
        `).join('')}
      </table>

      <div class="footer">
        <p>GreenoFig Nutrition Platform - Confidential Report</p>
      </div>
    </body>
    </html>
  `;

  const generateRevenueHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Revenue Report - GreenoFig</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #10b981; }
        .stat { background: #f4f4f4; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .stat h3 { margin: 0; color: #666; font-size: 14px; }
        .stat p { margin: 5px 0 0; font-size: 24px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #888; }
      </style>
    </head>
    <body>
      <h1>Revenue Report</h1>
      <p>Period: ${dateRange.start} to ${dateRange.end}</p>
      <p>Generated: ${format(new Date(), 'PPP')}</p>

      <div class="stat">
        <h3>Monthly Recurring Revenue</h3>
        <p>$${reportData.revenue?.recurring || 0}</p>
      </div>

      <h2>Tier Distribution</h2>
      ${(reportData.revenue?.tierBreakdown || []).map(t => `
        <div class="stat">
          <h3>${t.name} Tier</h3>
          <p>${t.value} clients</p>
        </div>
      `).join('')}

      <div class="footer">
        <p>GreenoFig Nutrition Platform - Confidential Report</p>
      </div>
    </body>
    </html>
  `;

  const generateAppointmentsHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Appointments Report - GreenoFig</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #10b981; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f4f4f4; }
        .footer { margin-top: 40px; text-align: center; color: #888; }
      </style>
    </head>
    <body>
      <h1>Appointments Report</h1>
      <p>Period: ${dateRange.start} to ${dateRange.end}</p>
      <p>Generated: ${format(new Date(), 'PPP')}</p>

      <h2>Summary</h2>
      <p>Total Appointments: ${reportData.appointments?.total || 0}</p>
      <p>Completion Rate: ${reportData.appointments?.completionRate || 0}%</p>

      <h2>Status Breakdown</h2>
      <table>
        <tr><th>Status</th><th>Count</th></tr>
        ${(reportData.appointments?.statusBreakdown || []).map(s => `
          <tr><td>${s.name}</td><td>${s.value}</td></tr>
        `).join('')}
      </table>

      <div class="footer">
        <p>GreenoFig Nutrition Platform - Confidential Report</p>
      </div>
    </body>
    </html>
  `;

  const generateRetentionHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Client Retention Report - GreenoFig</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #10b981; }
        .stat { background: #f4f4f4; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .stat h3 { margin: 0; color: #666; font-size: 14px; }
        .stat p { margin: 5px 0 0; font-size: 24px; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #888; }
      </style>
    </head>
    <body>
      <h1>Client Retention Report</h1>
      <p>Generated: ${format(new Date(), 'PPP')}</p>

      <div class="stat">
        <h3>Current Retention Rate</h3>
        <p>${reportData.retention?.current || 0}%</p>
      </div>

      <div class="stat">
        <h3>Total Clients</h3>
        <p>${reportData.retention?.totalClients || 0}</p>
      </div>

      <div class="stat">
        <h3>Active Clients (30 days)</h3>
        <p>${reportData.retention?.activeClients || 0}</p>
      </div>

      <div class="footer">
        <p>GreenoFig Nutrition Platform - Confidential Report</p>
      </div>
    </body>
    </html>
  `;

  const generateSummaryHTML = () => `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Summary Report - GreenoFig</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #10b981; }
        .section { margin: 30px 0; }
        .stat { display: inline-block; background: #f4f4f4; padding: 20px; margin: 10px; border-radius: 8px; min-width: 150px; }
        .footer { margin-top: 40px; text-align: center; color: #888; }
      </style>
    </head>
    <body>
      <h1>Summary Report</h1>
      <p>Period: ${dateRange.start} to ${dateRange.end}</p>
      <p>Generated: ${format(new Date(), 'PPP')}</p>

      <div class="section">
        <h2>Overview</h2>
        <div class="stat">
          <strong>Revenue</strong><br/>$${reportData.revenue?.recurring || 0}/mo
        </div>
        <div class="stat">
          <strong>Retention</strong><br/>${reportData.retention?.current || 0}%
        </div>
        <div class="stat">
          <strong>Appointments</strong><br/>${reportData.appointments?.total || 0}
        </div>
      </div>

      <div class="footer">
        <p>GreenoFig Nutrition Platform - Confidential Report</p>
      </div>
    </body>
    </html>
  `;

  const reportTypes = [
    { id: 'summary', title: 'Summary Report', icon: FileText, description: 'Overview of all metrics' },
    { id: 'client-progress', title: 'Client Progress', icon: TrendingUp, description: 'Weight tracking and progress data' },
    { id: 'revenue', title: 'Revenue Report', icon: DollarSign, description: 'Monthly revenue and tier breakdown' },
    { id: 'appointments', title: 'Appointments', icon: Calendar, description: 'Appointment statistics and completion rates' },
    { id: 'retention', title: 'Client Retention', icon: Users, description: 'Retention rates and client activity' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Reports Center
          </h2>
          <p className="text-muted-foreground mt-1">Generate and export detailed reports</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-40"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-40"
          />
          <Button variant="outline" onClick={fetchReportData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {reportTypes.map(report => (
          <Card
            key={report.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => generatePDFReport(report.id)}
          >
            <CardContent className="p-4 text-center">
              <report.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold text-sm">{report.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
              <Button size="sm" variant="outline" className="mt-3" disabled={generating}>
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Data Preview */}
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Client Progress</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Client Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.clientProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="entries" fill="#10b981" name="Progress Entries" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Recurring Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500 mb-4">
                  ${reportData.revenue?.recurring || 0}/mo
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={reportData.revenue?.tierBreakdown || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {(reportData.revenue?.tierBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(reportData.revenue?.tierBreakdown || []).map((tier, index) => (
                    <div key={tier.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }} />
                        <span>{tier.name}</span>
                      </div>
                      <Badge variant="outline">{tier.value} clients</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <div className="text-3xl font-bold">{reportData.appointments?.completionRate || 0}%</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <RePieChart>
                    <Pie
                      data={reportData.appointments?.statusBreakdown || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                      {(reportData.appointments?.statusBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={reportData.appointments?.typeBreakdown || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 text-primary" />
                <div className="text-4xl font-bold">{reportData.retention?.current || 0}%</div>
                <p className="text-muted-foreground">Current Retention Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                <div className="text-4xl font-bold">{reportData.retention?.totalClients || 0}</div>
                <p className="text-muted-foreground">Total Clients</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <div className="text-4xl font-bold">{reportData.retention?.activeClients || 0}</div>
                <p className="text-muted-foreground">Active (30 days)</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Retention Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.retention?.trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="clients" stroke="#3b82f6" name="Total Clients" />
                  <Line type="monotone" dataKey="retention" stroke="#10b981" name="Retention %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsCenter;
