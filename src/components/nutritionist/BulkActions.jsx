import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  Users,
  Send,
  Tag,
  Trash2,
  Download,
  Upload,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  Mail,
  MessageSquare,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BULK_ACTIONS = [
  {
    id: 'send-message',
    name: 'Send Message',
    icon: MessageSquare,
    color: 'bg-blue-100 text-blue-700',
    description: 'Send a message to multiple clients'
  },
  {
    id: 'add-tag',
    name: 'Add Tag',
    icon: Tag,
    color: 'bg-green-100 text-green-700',
    description: 'Apply tag to selected clients'
  },
  {
    id: 'remove-tag',
    name: 'Remove Tag',
    icon: X,
    color: 'bg-red-100 text-red-700',
    description: 'Remove tag from selected clients'
  },
  {
    id: 'assign-goal',
    name: 'Assign Goal',
    icon: Target,
    color: 'bg-purple-100 text-purple-700',
    description: 'Set a goal for selected clients'
  },
  {
    id: 'schedule-checkin',
    name: 'Schedule Check-in',
    icon: Calendar,
    color: 'bg-orange-100 text-orange-700',
    description: 'Schedule check-ins for selected clients'
  },
  {
    id: 'export-data',
    name: 'Export Data',
    icon: Download,
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Export client data to CSV'
  }
];

const TAG_OPTIONS = [
  { id: 'high-priority', name: 'High Priority' },
  { id: 'at-risk', name: 'At Risk' },
  { id: 'star-client', name: 'Star Client' },
  { id: 'needs-attention', name: 'Needs Attention' },
  { id: 'inactive', name: 'Inactive' },
  { id: 'making-progress', name: 'Making Progress' }
];

const BulkActions = ({ nutritionistId, selectedClients = [], onClearSelection }) => {
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [clients, setClients] = useState([]);
  const [actionHistory, setActionHistory] = useState([]);

  // Action-specific state
  const [messageData, setMessageData] = useState({ subject: '', content: '' });
  const [selectedTag, setSelectedTag] = useState('');
  const [goalData, setGoalData] = useState({
    goal_type: 'weight_loss',
    target_value: '',
    target_date: '',
    description: ''
  });
  const [checkinData, setCheckinData] = useState({
    scheduled_date: '',
    checkin_type: 'weekly',
    notes: ''
  });

  useEffect(() => {
    if (nutritionistId) {
      fetchClients();
      fetchActionHistory();
    }
  }, [nutritionistId]);

  useEffect(() => {
    if (selectedClients.length > 0) {
      fetchSelectedClientsData();
    }
  }, [selectedClients]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          user_profiles (
            id,
            full_name,
            email,
            tier
          )
        `)
        .eq('nutritionist_id', nutritionistId);

      if (error) throw error;

      const clientsData = data.map(item => ({
        id: item.user_profiles.id,
        name: item.user_profiles.full_name,
        email: item.user_profiles.email,
        tier: item.user_profiles.tier
      }));

      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchSelectedClientsData = async () => {
    // Fetch additional data for selected clients if needed
    // This could include recent activity, tags, goals, etc.
  };

  const fetchActionHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bulk_action_history')
        .select('*')
        .eq('nutritionist_id', nutritionistId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActionHistory(data || []);
    } catch (error) {
      console.error('Error fetching action history:', error);
    }
  };

  const executeBulkAction = async (actionId) => {
    setLoading(true);

    try {
      switch (actionId) {
        case 'send-message':
          await sendBulkMessage();
          break;
        case 'add-tag':
          await addBulkTag();
          break;
        case 'remove-tag':
          await removeBulkTag();
          break;
        case 'assign-goal':
          await assignBulkGoal();
          break;
        case 'schedule-checkin':
          await scheduleBulkCheckin();
          break;
        case 'export-data':
          await exportClientData();
          break;
        default:
          break;
      }

      // Log action to history
      await logBulkAction(actionId);

      // Refresh data
      await fetchActionHistory();

      // Close dialog and clear selection
      setActiveAction(null);
      if (onClearSelection) onClearSelection();
    } catch (error) {
      console.error('Error executing bulk action:', error);
      alert('Failed to execute action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkMessage = async () => {
    const messagePromises = selectedClients.map(clientId =>
      supabase.from('messages').insert({
        sender_id: nutritionistId,
        recipient_id: clientId,
        subject: messageData.subject,
        content: messageData.content,
        message_type: 'nutritionist_to_client'
      })
    );

    await Promise.all(messagePromises);
  };

  const addBulkTag = async () => {
    const tagPromises = selectedClients.map(clientId =>
      supabase.from('client_tags').upsert({
        nutritionist_id: nutritionistId,
        client_id: clientId,
        tag_category: selectedTag
      }, { onConflict: 'nutritionist_id,client_id,tag_category' })
    );

    await Promise.all(tagPromises);
  };

  const removeBulkTag = async () => {
    await supabase
      .from('client_tags')
      .delete()
      .eq('nutritionist_id', nutritionistId)
      .in('client_id', selectedClients)
      .eq('tag_category', selectedTag);
  };

  const assignBulkGoal = async () => {
    const goalPromises = selectedClients.map(clientId =>
      supabase.from('client_goals').insert({
        user_id: clientId,
        nutritionist_id: nutritionistId,
        goal_type: goalData.goal_type,
        target_value: parseFloat(goalData.target_value),
        target_date: goalData.target_date,
        description: goalData.description,
        status: 'active'
      })
    );

    await Promise.all(goalPromises);
  };

  const scheduleBulkCheckin = async () => {
    const checkinPromises = selectedClients.map(clientId =>
      supabase.from('scheduled_checkins').insert({
        nutritionist_id: nutritionistId,
        client_id: clientId,
        scheduled_date: checkinData.scheduled_date,
        checkin_type: checkinData.checkin_type,
        notes: checkinData.notes,
        status: 'pending'
      })
    );

    await Promise.all(checkinPromises);
  };

  const exportClientData = async () => {
    try {
      // Fetch comprehensive data for selected clients
      const { data: clientData, error } = await supabase
        .from('user_profiles')
        .select(`
          id,
          full_name,
          email,
          tier,
          created_at,
          client_goals (goal_type, target_value, status),
          client_tags (tag_category),
          meals (id),
          workout_logs (id)
        `)
        .in('id', selectedClients);

      if (error) throw error;

      // Convert to CSV
      const csvContent = convertToCSV(clientData);

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `client-data-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';

    const headers = ['Name', 'Email', 'Tier', 'Join Date', 'Active Goals', 'Tags', 'Meals Logged', 'Workouts Logged'];
    const rows = data.map(client => [
      client.full_name,
      client.email,
      client.tier,
      new Date(client.created_at).toLocaleDateString(),
      client.client_goals?.filter(g => g.status === 'active').length || 0,
      client.client_tags?.map(t => t.tag_category).join('; ') || 'None',
      client.meals?.length || 0,
      client.workout_logs?.length || 0
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const logBulkAction = async (actionId) => {
    try {
      const action = BULK_ACTIONS.find(a => a.id === actionId);

      await supabase.from('bulk_action_history').insert({
        nutritionist_id: nutritionistId,
        action_type: actionId,
        action_name: action.name,
        clients_affected: selectedClients.length,
        client_ids: selectedClients,
        metadata: {
          message: messageData,
          tag: selectedTag,
          goal: goalData,
          checkin: checkinData
        }
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const renderActionDialog = () => {
    if (!activeAction) return null;

    const action = BULK_ACTIONS.find(a => a.id === activeAction);

    return (
      <Dialog open={!!activeAction} onOpenChange={() => setActiveAction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <action.icon className="w-5 h-5" />
              {action.name}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              {action.description} ({selectedClients.length} clients selected)
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {activeAction === 'send-message' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input
                    placeholder="Message subject"
                    value={messageData.subject}
                    onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    placeholder="Your message to clients..."
                    rows={6}
                    value={messageData.content}
                    onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                  />
                </div>
              </>
            )}

            {(activeAction === 'add-tag' || activeAction === 'remove-tag') && (
              <div>
                <label className="text-sm font-medium mb-2 block">Select Tag</label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_OPTIONS.map(tag => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeAction === 'assign-goal' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Goal Type</label>
                  <Select
                    value={goalData.goal_type}
                    onValueChange={(value) => setGoalData({ ...goalData, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Value (kg)</label>
                  <Input
                    type="number"
                    placeholder="e.g., 70"
                    value={goalData.target_value}
                    onChange={(e) => setGoalData({ ...goalData, target_value: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Date</label>
                  <Input
                    type="date"
                    value={goalData.target_date}
                    onChange={(e) => setGoalData({ ...goalData, target_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Goal description..."
                    rows={3}
                    value={goalData.description}
                    onChange={(e) => setGoalData({ ...goalData, description: e.target.value })}
                  />
                </div>
              </>
            )}

            {activeAction === 'schedule-checkin' && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-in Date</label>
                  <Input
                    type="datetime-local"
                    value={checkinData.scheduled_date}
                    onChange={(e) => setCheckinData({ ...checkinData, scheduled_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Check-in Type</label>
                  <Select
                    value={checkinData.checkin_type}
                    onValueChange={(value) => setCheckinData({ ...checkinData, checkin_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly Check-in</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly Check-in</SelectItem>
                      <SelectItem value="monthly">Monthly Check-in</SelectItem>
                      <SelectItem value="custom">Custom Check-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes</label>
                  <Textarea
                    placeholder="Any notes for this check-in..."
                    rows={3}
                    value={checkinData.notes}
                    onChange={(e) => setCheckinData({ ...checkinData, notes: e.target.value })}
                  />
                </div>
              </>
            )}

            {activeAction === 'export-data' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Export Client Data</h4>
                    <p className="text-sm text-blue-700">
                      This will export comprehensive data for {selectedClients.length} selected clients
                      including their profile, goals, tags, and activity statistics to a CSV file.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={() => executeBulkAction(activeAction)}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Execute Action (${selectedClients.length} clients)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (selectedClients.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Clients Selected</h3>
          <p className="text-gray-600">
            Select clients from your client list to perform bulk actions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Clients Banner */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-700" />
              <div>
                <h4 className="font-medium text-green-900">
                  {selectedClients.length} Client{selectedClients.length > 1 ? 's' : ''} Selected
                </h4>
                <p className="text-sm text-green-700">
                  Choose an action to perform on selected clients
                </p>
              </div>
            </div>
            {onClearSelection && (
              <Button
                size="sm"
                variant="ghost"
                className="text-green-700"
                onClick={onClearSelection}
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
          <CardDescription>
            Perform actions on multiple clients simultaneously
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BULK_ACTIONS.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setActiveAction(action.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full ${action.color} mx-auto mb-3 flex items-center justify-center`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-medium text-sm mb-1">{action.name}</h4>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action History */}
      {actionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Bulk Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionHistory.slice(0, 5).map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-700" />
                    </div>
                    <div>
                      <h5 className="font-medium text-sm">{action.action_name}</h5>
                      <p className="text-xs text-gray-600">
                        {action.clients_affected} clients • {new Date(action.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {new Date(action.created_at).toLocaleTimeString()}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      {renderActionDialog()}
    </div>
  );
};

export default BulkActions;
