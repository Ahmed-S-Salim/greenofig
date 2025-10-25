import { supabase } from './customSupabaseClient';

/**
 * Activity types for logging
 */
export const ACTIVITY_TYPES = {
  // User actions
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',

  // Subscription actions
  SUBSCRIPTION_CREATED: 'subscription_created',
  SUBSCRIPTION_UPDATED: 'subscription_updated',
  SUBSCRIPTION_CANCELED: 'subscription_canceled',
  SUBSCRIPTION_REACTIVATED: 'subscription_reactivated',

  // Payment actions
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_REFUNDED: 'payment_refunded',
  PAYMENT_FAILED: 'payment_failed',

  // Content actions
  BLOG_CREATED: 'blog_created',
  BLOG_UPDATED: 'blog_updated',
  BLOG_DELETED: 'blog_deleted',
  BLOG_PUBLISHED: 'blog_published',

  WEBSITE_UPDATED: 'website_updated',

  // Coupon actions
  COUPON_CREATED: 'coupon_created',
  COUPON_UPDATED: 'coupon_updated',
  COUPON_DELETED: 'coupon_deleted',

  // Support actions
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_RESOLVED: 'ticket_resolved',
  TICKET_CLOSED: 'ticket_closed',

  // System actions
  SETTINGS_UPDATED: 'settings_updated',
  DATA_EXPORTED: 'data_exported',
  LOGIN: 'login',
  LOGOUT: 'logout'
};

/**
 * Log an admin activity
 * @param {string} activityType - Type of activity from ACTIVITY_TYPES
 * @param {Object} details - Additional details about the activity
 * @param {Object} user - User who performed the action
 * @param {string} targetId - ID of the affected resource (optional)
 * @param {string} targetType - Type of the affected resource (optional)
 */
export const logActivity = async (activityType, details = {}, user = null, targetId = null, targetType = null) => {
  try {
    // Get current user if not provided
    let userId = user?.id;
    if (!userId) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      userId = currentUser?.id;
    }

    if (!userId) {
      console.warn('Cannot log activity: No user found');
      return null;
    }

    const activityLog = {
      user_id: userId,
      activity_type: activityType,
      details: details,
      target_id: targetId,
      target_type: targetType,
      ip_address: await getClientIP(),
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([activityLog])
      .select()
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in logActivity:', error);
    return null;
  }
};

/**
 * Get client IP address (simplified)
 */
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Get activity logs for a specific user
 * @param {string} userId - User ID
 * @param {number} limit - Number of logs to fetch
 */
export const getUserActivityLogs = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user_profiles (full_name, email)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user activity logs:', error);
    return [];
  }

  return data || [];
};

/**
 * Get all activity logs with filters
 * @param {Object} filters - Filter options
 */
export const getActivityLogs = async (filters = {}) => {
  let query = supabase
    .from('activity_logs')
    .select(`
      *,
      user_profiles (full_name, email, role)
    `);

  // Apply filters
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }

  if (filters.activityType) {
    query = query.eq('activity_type', filters.activityType);
  }

  if (filters.targetType) {
    query = query.eq('target_type', filters.targetType);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  query = query
    .order('created_at', { ascending: false })
    .limit(filters.limit || 100);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }

  return data || [];
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('activity_logs')
    .select('activity_type, created_at')
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching activity stats:', error);
    return {
      totalActivities: 0,
      byType: {},
      byDay: {}
    };
  }

  // Aggregate by type
  const byType = {};
  const byDay = {};

  data?.forEach(log => {
    // By type
    byType[log.activity_type] = (byType[log.activity_type] || 0) + 1;

    // By day
    const day = new Date(log.created_at).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });

  return {
    totalActivities: data?.length || 0,
    byType,
    byDay
  };
};

/**
 * Create activity log table SQL (for reference)
 * Run this in Supabase SQL editor:
 *
 * CREATE TABLE IF NOT EXISTS activity_logs (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
 *   activity_type TEXT NOT NULL,
 *   details JSONB DEFAULT '{}'::jsonb,
 *   target_id UUID,
 *   target_type TEXT,
 *   ip_address TEXT,
 *   user_agent TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
 * CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
 * CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
 * CREATE INDEX idx_activity_logs_target ON activity_logs(target_id, target_type);
 *
 * -- Enable RLS
 * ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
 *
 * -- Policy: Only admins can view activity logs
 * CREATE POLICY "Admins can view all activity logs" ON activity_logs
 *   FOR SELECT USING (
 *     EXISTS (
 *       SELECT 1 FROM user_profiles
 *       WHERE user_profiles.id = auth.uid()
 *       AND user_profiles.role IN ('admin', 'super_admin')
 *     )
 *   );
 *
 * -- Policy: System can insert activity logs
 * CREATE POLICY "System can insert activity logs" ON activity_logs
 *   FOR INSERT WITH CHECK (true);
 */

export default {
  ACTIVITY_TYPES,
  logActivity,
  getUserActivityLogs,
  getActivityLogs,
  getActivityStats
};
