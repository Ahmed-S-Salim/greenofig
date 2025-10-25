import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Analytics = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    totalMeals: 0,
  });
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: users, count, error: usersError } = await supabase.from('user_profiles').select('*', { count: 'exact' });

      if (users) {
        setStats(prev => ({ 
            ...prev, 
            totalUsers: count,
            activeUsers: users.filter(u => u.is_active).length
        }));
      }
    };

    const fetchLogs = async () => {
        // Activity logs are still in local storage for this example
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        setActivityLogs(logs);
    };

    fetchStats();
    fetchLogs();
  }, []);

  const chartData = [
    { month: 'Jan', users: 12 },
    { month: 'Feb', users: 19 },
    { month: 'Mar', users: 25 },
    { month: 'Apr', users: 32 },
    { month: 'May', users: 41 },
    { month: 'Jun', users: 48 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Active Users</h3>
          <p className="text-3xl font-bold">{stats.activeUsers}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Total Workouts</h3>
          <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-text-secondary mb-1">Total Meals Logged</h3>
          <p className="text-3xl font-bold">{stats.totalMeals}</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6 shadow-xl"
      >
        <h3 className="text-2xl font-bold mb-6">User Growth</h3>
        <div className="h-64 flex items-end justify-between gap-4">
          {chartData.map((data, index) => (
            <motion.div
              key={data.month}
              initial={{ height: 0 }}
              animate={{ height: `${(data.users / 50) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="flex-1 bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-lg relative group"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-1 rounded text-xs whitespace-nowrap">
                {data.users} users
              </div>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-text-secondary">
                {data.month}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-effect rounded-xl p-6 shadow-xl"
      >
        <h3 className="text-2xl font-bold mb-4">Recent Activity Logs</h3>
        <div className="space-y-2">
          {activityLogs
            .slice(-5)
            .reverse()
            .map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <p className="text-sm text-white font-mono">{log.action}</p>
                <p className="text-xs text-purple-400 mt-1">
                  {new Date(log.timestamp).toLocaleString()} - User ID: {log.userId}
                </p>
              </div>
            ))}
          {activityLogs.length === 0 && (
            <p className="text-text-secondary text-center py-4">No activity logs yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;