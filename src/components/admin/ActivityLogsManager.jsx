import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Activity, User, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { getActivityLogs, getActivityStats, ACTIVITY_TYPES } from '@/lib/activityLogger';
import { format } from 'date-fns';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';

const ActivityLogsManager = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('7'); // days

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [activityTypeFilter, dateFilter]);

  const fetchLogs = async () => {
    setLoading(true);

    const filters = {
      limit: 100
    };

    if (activityTypeFilter !== 'all') {
      filters.activityType = activityTypeFilter;
    }

    if (dateFilter !== 'all') {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateFilter));
      filters.startDate = startDate.toISOString();
    }

    const data = await getActivityLogs(filters);
    setLogs(data);
    setLoading(false);
  };

  const fetchStats = async () => {
    const days = dateFilter === 'all' ? 365 : parseInt(dateFilter);
    const statsData = await getActivityStats(days);
    setStats(statsData);
  };

  const exportLogs = () => {
    const csvData = filteredLogs.map(log => ({
      Date: format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      User: log.user_profiles?.full_name || 'Unknown',
      Email: log.user_profiles?.email || 'N/A',
      Activity: log.activity_type,
      Details: JSON.stringify(log.details),
      IP: log.ip_address
    }));

    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      (log.user_profiles?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (log.user_profiles?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      log.activity_type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getActivityIcon = (type) => {
    if (type.includes('user')) return User;
    if (type.includes('blog') || type.includes('website')) return FileText;
    if (type.includes('subscription') || type.includes('payment')) return CreditCard;
    return Activity;
  };

  const getActivityColor = (type) => {
    if (type.includes('created')) return 'text-green-400';
    if (type.includes('deleted') || type.includes('failed')) return 'text-red-400';
    if (type.includes('updated')) return 'text-blue-400';
    return 'text-text-secondary';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Activity Logs</h2>
        <Button onClick={exportLogs} disabled={filteredLogs.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Activities</p>
                <p className="text-3xl font-bold">{stats.totalActivities || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">User Actions</p>
                <p className="text-3xl font-bold">
                  {Object.keys(stats.byType || {})
                    .filter(k => k.includes('user'))
                    .reduce((sum, k) => sum + stats.byType[k], 0)}
                </p>
              </div>
              <User className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Content Changes</p>
                <p className="text-3xl font-bold">
                  {Object.keys(stats.byType || {})
                    .filter(k => k.includes('blog') || k.includes('website'))
                    .reduce((sum, k) => sum + stats.byType[k], 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <Input
            placeholder="Search by user or activity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 glass-effect"
          />
        </div>

        <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
          <SelectTrigger className="w-[200px] glass-effect">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="user_created">User Created</SelectItem>
            <SelectItem value="user_updated">User Updated</SelectItem>
            <SelectItem value="user_deleted">User Deleted</SelectItem>
            <SelectItem value="blog_published">Blog Published</SelectItem>
            <SelectItem value="website_updated">Website Updated</SelectItem>
            <SelectItem value="payment_processed">Payment Processed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] glass-effect">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent className="glass-effect">
            <SelectItem value="1">Last 24 hours</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-text-secondary">
        Showing {filteredLogs.length} of {logs.length} activity logs
      </div>

      {/* Activity Logs */}
      {loading ? (
        <LoadingState message="Loading activity logs..." />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Activity Logs Found"
          description="No activities match your current filters."
        />
      ) : (
        <Card className="glass-effect">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-semibold">Timestamp</th>
                    <th className="text-left p-4 text-sm font-semibold">User</th>
                    <th className="text-left p-4 text-sm font-semibold">Activity</th>
                    <th className="text-left p-4 text-sm font-semibold">Details</th>
                    <th className="text-left p-4 text-sm font-semibold">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const Icon = getActivityIcon(log.activity_type);
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4 text-sm text-text-secondary">
                          {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium">
                              {log.user_profiles?.full_name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {log.user_profiles?.email}
                            </p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${getActivityColor(log.activity_type)}`} />
                            <span className="text-sm capitalize">
                              {log.activity_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-text-secondary max-w-md truncate">
                            {log.details && Object.keys(log.details).length > 0
                              ? JSON.stringify(log.details)
                              : 'No additional details'}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-secondary">
                          {log.ip_address || 'N/A'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityLogsManager;
