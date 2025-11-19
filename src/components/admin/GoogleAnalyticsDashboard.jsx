import React, { useState, useEffect } from 'react';
import { Activity, Users, Eye, TrendingUp, Globe, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Google Analytics Dashboard Component
 *
 * This component integrates Google Analytics 4 data into the admin dashboard.
 * It displays real-time metrics, traffic sources, popular pages, and user behavior.
 *
 * Features:
 * - Real-time visitor tracking
 * - Page view analytics
 * - Traffic source breakdown
 * - Popular pages ranking
 * - User demographics
 * - Conversion tracking
 */

const GoogleAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    realtime: {
      activeUsers: 0,
      screenPageViews: 0,
    },
    overview: {
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
    },
    topPages: [],
    trafficSources: [],
    conversions: {
      signups: 0,
      purchases: 0,
      revenue: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  // Fetch analytics data from Google Analytics 4
  // Note: In production, this would call your backend API which uses Google Analytics Data API
  // For now, we'll show the structure and use mock data for demonstration
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);

    try {
      // In production, replace this with actual API call to your backend
      // Example: const response = await fetch('/api/analytics/ga4', { ... });

      // For demonstration, using mock data
      // You would integrate with Google Analytics Data API v1
      // https://developers.google.com/analytics/devguides/reporting/data/v1

      setTimeout(() => {
        setAnalyticsData({
          realtime: {
            activeUsers: Math.floor(Math.random() * 50) + 10,
            screenPageViews: Math.floor(Math.random() * 100) + 20,
          },
          overview: {
            totalUsers: 12847,
            newUsers: 8234,
            sessions: 18653,
            pageViews: 45821,
            bounceRate: 42.3,
            avgSessionDuration: 245, // seconds
          },
          topPages: [
            { path: '/', views: 15420, avgTime: 180, bounceRate: 38.2 },
            { path: '/pricing', views: 8234, avgTime: 210, bounceRate: 25.4 },
            { path: '/features', views: 6521, avgTime: 165, bounceRate: 41.2 },
            { path: '/blog', views: 4832, avgTime: 320, bounceRate: 18.7 },
            { path: '/about', views: 3214, avgTime: 145, bounceRate: 52.1 },
          ],
          trafficSources: [
            { source: 'Organic Search', users: 5234, percentage: 40.8 },
            { source: 'Direct', users: 3421, percentage: 26.6 },
            { source: 'Social Media', users: 2156, percentage: 16.8 },
            { source: 'Referral', users: 1523, percentage: 11.9 },
            { source: 'Email', users: 513, percentage: 4.0 },
          ],
          conversions: {
            signups: 342,
            purchases: 127,
            revenue: 3175.50,
          },
        });
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            <span>{trendValue}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your website performance with Google Analytics 4
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {/* Real-time Stats */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Activity
          </CardTitle>
          <CardDescription className="text-green-50">
            Live visitor data from the last 30 minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-4xl font-bold">{analyticsData.realtime.activeUsers}</div>
              <p className="text-sm text-green-50">Active Users Right Now</p>
            </div>
            <div>
              <div className="text-4xl font-bold">{analyticsData.realtime.screenPageViews}</div>
              <p className="text-sm text-green-50">Page Views (30 min)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={analyticsData.overview.totalUsers.toLocaleString()}
          subtitle={`${analyticsData.overview.newUsers.toLocaleString()} new users`}
          icon={Users}
          trend="up"
          trendValue={12.5}
        />
        <StatCard
          title="Page Views"
          value={analyticsData.overview.pageViews.toLocaleString()}
          subtitle={`${analyticsData.overview.sessions.toLocaleString()} sessions`}
          icon={Eye}
          trend="up"
          trendValue={8.3}
        />
        <StatCard
          title="Avg. Session Duration"
          value={formatDuration(analyticsData.overview.avgSessionDuration)}
          subtitle="Time spent on site"
          icon={Clock}
          trend="down"
          trendValue={3.2}
        />
        <StatCard
          title="Bounce Rate"
          value={`${analyticsData.overview.bounceRate}%`}
          subtitle="Single page visits"
          icon={TrendingUp}
          trend="down"
          trendValue={5.1}
        />
      </div>

      {/* Tabs for detailed analytics */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        {/* Top Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Visited Pages</CardTitle>
              <CardDescription>
                Pages with the highest traffic in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium">{page.path}</p>
                      <p className="text-sm text-muted-foreground">
                        Avg. Time: {formatDuration(page.avgTime)} | Bounce: {page.bounceRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{page.views.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">views</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.trafficSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{source.users.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground ml-2">({source.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.conversions.signups}</div>
                <p className="text-xs text-muted-foreground mt-1">New user registrations</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analyticsData.conversions.purchases}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${analyticsData.conversions.revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Setup Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p><strong>Current Status:</strong> Google Analytics 4 is configured with ID: G-PELCKN5T5Q</p>
          <p><strong>To see real data:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Ensure Google Analytics 4 property is set up in your Google Analytics account</li>
            <li>Set up the Google Analytics Data API in Google Cloud Console</li>
            <li>Create a backend API endpoint to fetch GA4 data using the Data API</li>
            <li>Replace the mock data in this component with real API calls</li>
            <li>Add proper authentication and API key management</li>
          </ol>
          <p className="mt-3">
            <strong>Documentation:</strong>{' '}
            <a
              href="https://developers.google.com/analytics/devguides/reporting/data/v1"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              Google Analytics Data API v1
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleAnalyticsDashboard;
