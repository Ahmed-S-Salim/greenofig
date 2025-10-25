import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const RevenueAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [analytics, setAnalytics] = useState({
    mrr: 0,
    arr: 0,
    totalRevenue: 0,
    activeCustomers: 0,
    churnRate: 0,
    avgRevenuePerUser: 0,
    lifetimeValue: 0,
    revenueGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [planBreakdown, setPlanBreakdown] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = timeRange === 'week'
        ? new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        : timeRange === 'month'
        ? subMonths(endDate, 1)
        : subMonths(endDate, 12);

      // Fetch successful transactions
      const { data: transactions, error: transError } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          subscription_plans (name, price_monthly, price_yearly)
        `)
        .eq('status', 'succeeded')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (transError) throw transError;

      // Fetch active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (name, price_monthly, price_yearly)
        `)
        .eq('status', 'active');

      if (subError) throw subError;

      // Calculate metrics
      const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Calculate MRR (Monthly Recurring Revenue)
      const mrr = subscriptions.reduce((sum, sub) => {
        if (sub.billing_cycle === 'monthly') {
          return sum + parseFloat(sub.subscription_plans?.price_monthly || 0);
        } else if (sub.billing_cycle === 'yearly') {
          return sum + (parseFloat(sub.subscription_plans?.price_yearly || 0) / 12);
        }
        return sum;
      }, 0);

      const arr = mrr * 12;
      const activeCustomers = subscriptions.length;
      const avgRevenuePerUser = activeCustomers > 0 ? totalRevenue / activeCustomers : 0;
      const lifetimeValue = avgRevenuePerUser * 12; // Simplified LTV calculation

      // Calculate churn rate (simplified)
      const { data: cancelledSubs } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('status', 'canceled')
        .gte('canceled_at', subMonths(endDate, 1).toISOString());

      const churnRate = activeCustomers > 0
        ? ((cancelledSubs?.length || 0) / (activeCustomers + (cancelledSubs?.length || 0))) * 100
        : 0;

      // Calculate revenue growth
      const lastMonthStart = subMonths(startDate, 1);
      const { data: lastMonthTrans } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'succeeded')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', startDate.toISOString());

      const lastMonthRevenue = lastMonthTrans?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
      const revenueGrowth = lastMonthRevenue > 0
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      setAnalytics({
        mrr,
        arr,
        totalRevenue,
        activeCustomers,
        churnRate,
        avgRevenuePerUser,
        lifetimeValue,
        revenueGrowth,
      });

      // Prepare revenue chart data
      const revenueByDay = {};
      transactions.forEach(t => {
        const date = format(new Date(t.created_at), 'MMM dd');
        revenueByDay[date] = (revenueByDay[date] || 0) + parseFloat(t.amount);
      });

      const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({
        date,
        revenue: revenue.toFixed(2),
      }));

      setRevenueData(chartData);

      // Plan breakdown
      const planRevenue = {};
      subscriptions.forEach(sub => {
        const planName = sub.subscription_plans?.name || 'Unknown';
        const amount = sub.billing_cycle === 'monthly'
          ? parseFloat(sub.subscription_plans?.price_monthly || 0)
          : parseFloat(sub.subscription_plans?.price_yearly || 0) / 12;

        planRevenue[planName] = (planRevenue[planName] || 0) + amount;
      });

      const planData = Object.entries(planRevenue).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      }));

      setPlanBreakdown(planData);
      setRecentTransactions(transactions.slice(0, 10));
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Using HSL values that match our theme
  const COLORS = [
    'hsl(142, 76%, 36%)',  // green-500
    'hsl(217, 91%, 60%)',  // blue-500
    'hsl(38, 92%, 50%)',   // amber-500
    'hsl(0, 84%, 60%)',    // red-500
    'hsl(258, 90%, 66%)'   // violet-500
  ];

  const exportToCSV = () => {
    // Prepare CSV data
    const csvData = [
      ['Revenue Analytics Export'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Key Metrics'],
      ['Metric', 'Value'],
      ['Monthly Recurring Revenue', `$${analytics.mrr.toFixed(2)}`],
      ['Annual Recurring Revenue', `$${analytics.arr.toFixed(2)}`],
      ['Total Revenue', `$${analytics.totalRevenue.toFixed(2)}`],
      ['Active Customers', analytics.activeCustomers],
      ['Churn Rate', `${analytics.churnRate.toFixed(2)}%`],
      ['Avg Revenue Per User', `$${analytics.avgRevenuePerUser.toFixed(2)}`],
      ['Customer Lifetime Value', `$${analytics.lifetimeValue.toFixed(2)}`],
      ['Revenue Growth', `${analytics.revenueGrowth.toFixed(2)}%`],
      [''],
      ['Revenue by Plan'],
      ['Plan', 'MRR'],
      ...planBreakdown.map(plan => [plan.name, `$${plan.value.toFixed(2)}`]),
      [''],
      ['Recent Transactions'],
      ['Date', 'Plan', 'Amount', 'Status', 'Transaction ID'],
      ...recentTransactions.map(t => [
        format(new Date(t.created_at), 'MMM dd, yyyy'),
        t.subscription_plans?.name || 'N/A',
        `$${t.amount}`,
        t.status,
        t.payment_intent_id
      ])
    ];

    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `revenue-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const MetricCard = ({ title, value, icon: Icon, trend, trendValue, prefix = '', suffix = '' }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary mb-1">{title}</p>
          <h3 className="text-3xl font-bold">
            {prefix}{typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}{suffix}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-primary' : 'text-destructive'}`}>
              {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span>{trendValue}% vs last period</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-text-secondary mt-1">Track your revenue, subscriptions, and growth metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTimeRange('week')} className={timeRange === 'week' ? 'bg-primary text-primary-foreground' : ''}>
            Week
          </Button>
          <Button variant="outline" onClick={() => setTimeRange('month')} className={timeRange === 'month' ? 'bg-primary text-primary-foreground' : ''}>
            Month
          </Button>
          <Button variant="outline" onClick={() => setTimeRange('year')} className={timeRange === 'year' ? 'bg-primary text-primary-foreground' : ''}>
            Year
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Recurring Revenue"
          value={analytics.mrr}
          icon={DollarSign}
          prefix="$"
          trend={analytics.revenueGrowth > 0 ? 'up' : 'down'}
          trendValue={Math.abs(analytics.revenueGrowth).toFixed(1)}
        />
        <MetricCard
          title="Annual Recurring Revenue"
          value={analytics.arr}
          icon={TrendingUp}
          prefix="$"
        />
        <MetricCard
          title="Active Customers"
          value={analytics.activeCustomers}
          icon={Users}
        />
        <MetricCard
          title="Churn Rate"
          value={analytics.churnRate}
          icon={AlertCircle}
          suffix="%"
          trend={analytics.churnRate < 5 ? 'up' : 'down'}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
          <TabsTrigger value="plans">Plan Breakdown</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Plan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="hsl(217, 91%, 60%)"
                    dataKey="value"
                  >
                    {planBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Plan Statistics</h3>
              <div className="space-y-4">
                {planBreakdown.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <span className="text-lg font-bold">${plan.value.toFixed(2)}/mo</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Plan</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-3 px-4">{transaction.subscription_plans?.name || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold">${transaction.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary">
                        {transaction.payment_intent_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Avg Revenue Per User</h3>
          </div>
          <p className="text-3xl font-bold">${analytics.avgRevenuePerUser.toFixed(2)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Customer Lifetime Value</h3>
          </div>
          <p className="text-3xl font-bold">${analytics.lifetimeValue.toFixed(2)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Total Revenue</h3>
          </div>
          <p className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
        </Card>
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;
