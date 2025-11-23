import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  Bell,
  BellRing,
  CheckCircle2,
  X,
  Trash2,
  MessageSquare,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Users,
  AlertCircle,
  Info,
  Heart,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTIFICATION_TYPES = {
  achievement: { icon: Award, color: 'bg-yellow-100 text-yellow-700', label: 'Achievement' },
  goal: { icon: Target, color: 'bg-blue-100 text-blue-700', label: 'Goal' },
  message: { icon: MessageSquare, color: 'bg-purple-100 text-purple-700', label: 'Message' },
  reminder: { icon: Bell, color: 'bg-orange-100 text-orange-700', label: 'Reminder' },
  milestone: { icon: TrendingUp, color: 'bg-green-100 text-green-700', label: 'Milestone' },
  social: { icon: Users, color: 'bg-pink-100 text-pink-700', label: 'Social' },
  system: { icon: Info, color: 'bg-gray-100 text-gray-700', label: 'System' },
  celebration: { icon: Heart, color: 'bg-red-100 text-red-700', label: 'Celebration' }
};

const NotificationCenter = ({ userId, compact = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/logo.png',
              badge: '/logo.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Handle action URL if present
    if (notification.action_url) {
      window.location.href = notification.action_url;
    } else {
      setSelectedNotification(notification);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (compact) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => setShowPanel(!showPanel)}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {showPanel && (
          <div className="absolute right-0 top-12 w-80 max-h-96 bg-white rounded-lg shadow-xl border z-50 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
            <div className="overflow-y-auto max-h-80">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                filteredNotifications.slice(0, 10).map(notification => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;

                  return (
                    <div
                      key={notification.id}
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-8 h-8 rounded-full ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                          <typeConfig.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-gray-600 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notification.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <BellRing className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Notification Center</CardTitle>
                <p className="text-sm text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="outline" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              size="sm"
              variant={filter === 'read' ? 'default' : 'outline'}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? "No read notifications yet."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${typeConfig.color} flex items-center justify-center flex-shrink-0`}>
                          <typeConfig.icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            {!notification.is_read && (
                              <Badge className="bg-blue-500 text-white flex-shrink-0">New</Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {getTimeAgo(notification.created_at)}
                            </span>
                            <Badge variant="outline" className={typeConfig.color}>
                              {typeConfig.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Notification Detail Dialog */}
      {selectedNotification && (
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedNotification.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">{selectedNotification.message}</p>
              {selectedNotification.metadata && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Details</h4>
                  <pre className="text-xs text-gray-600 overflow-auto">
                    {JSON.stringify(selectedNotification.metadata, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>{getTimeAgo(selectedNotification.created_at)}</span>
                <Badge variant="outline">
                  {NOTIFICATION_TYPES[selectedNotification.type]?.label || 'System'}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default NotificationCenter;
