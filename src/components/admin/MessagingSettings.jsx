import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bot, Settings as SettingsIcon, Save, Bell, Users, Mail, Phone, CheckCircle, XCircle, Clock, User as UserIcon, Eye, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MessagingSettings = ({ user }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    messaging_enabled: true,
    ai_auto_reply_enabled: true,
    ai_auto_reply_message: "Thank you for your message! Our team has been notified and will get back to you shortly. In the meantime, feel free to check out our AI Health Coach for instant assistance! 🌟",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    todayMessages: 0,
    pendingLeads: 0,
  });
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  useEffect(() => {
    loadSettings();
    loadStats();
    loadLeads();
    loadCustomers();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('key', 'messaging_config')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data?.value) setSettings(data.value);
    } catch (error) {
      console.error('Error loading messaging settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total conversations count
      const { count: convCount, error: convError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });

      if (convError) console.error('Error loading conversations count:', convError);

      // Get unread messages count - count manually instead of using RPC
      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_id', user.id); // Messages sent TO the admin (not from)

      if (unreadError) console.error('Error loading unread count:', unreadError);

      // Get today's messages count (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      const { count: todayCount, error: todayError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (todayError) console.error('Error loading today messages:', todayError);

      // Get pending leads count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('visitor_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) console.error('Error loading pending leads:', pendingError);

      setStats({
        totalConversations: convCount || 0,
        unreadMessages: unreadCount || 0,
        todayMessages: todayCount || 0,
        pendingLeads: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadLeads = async () => {
    try {
      setLoadingLeads(true);
      const { data, error } = await supabase
        .from('visitor_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'messaging_config',
          value: settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved',
        description: 'Messaging settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: error.code === '42P01' ? 'Please run the platform_settings migration first.' : 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateLeadStatus = async (leadId, status) => {
    try {
      const { error } = await supabase
        .from('visitor_inquiries')
        .update({
          status,
          contacted_at: status === 'contacted' ? new Date().toISOString() : null,
        })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Lead marked as ${status}`,
      });

      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    }
  };

  const deleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const { error } = await supabase
        .from('visitor_inquiries')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: 'Lead Deleted',
        description: 'The lead has been removed',
      });

      loadLeads();
      loadStats();
      setSelectedLead(null);
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead',
        variant: 'destructive',
      });
    }
  };

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, messaging_disabled')
        .eq('role', 'user')
        .order('full_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const toggleCustomerMessaging = async (customerId, currentlyDisabled) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ messaging_disabled: !currentlyDisabled })
        .eq('id', customerId);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: `Messaging ${!currentlyDisabled ? 'disabled' : 'enabled'} for customer`,
      });

      loadCustomers();
    } catch (error) {
      console.error('Error toggling customer messaging:', error);
      toast({
        title: 'Error',
        description: 'Failed to update customer messaging settings',
        variant: 'destructive',
      });
    }
  };

  const generateAIReply = async () => {
    try {
      setGeneratingAI(true);

      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates professional, friendly auto-reply messages for a health and wellness platform called GreenoFig. Keep messages concise, warm, and encouraging.'
            },
            {
              role: 'user',
              content: 'Generate a professional auto-reply message for customers who message our health and wellness platform. The message should: 1) Thank them for reaching out, 2) Let them know we\'ll respond soon, 3) Suggest they check out our AI Health Coach while waiting. Keep it under 50 words and include a friendly emoji.'
            }
          ]
        }
      });

      if (error) throw error;

      if (data?.response) {
        updateSetting('ai_auto_reply_message', data.response);
        toast({
          title: 'AI Message Generated',
          description: 'Auto-reply message has been generated successfully',
        });
      }
    } catch (error) {
      console.error('Error generating AI reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI message. Using default.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      contacted: { color: 'bg-blue-500', label: 'Contacted' },
      converted: { color: 'bg-green-500', label: 'Converted' },
      closed: { color: 'bg-gray-500', label: 'Closed' },
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={`${variant.color} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Messaging & Leads</h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">Manage customer messaging, auto-replies, and visitor inquiries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">Need response</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMessages}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leads</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingLeads}</div>
            <p className="text-xs text-muted-foreground">Awaiting contact</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Settings, Leads, and Customer Access */}
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="settings">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Mail className="h-4 w-4 mr-2" />
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            Customer Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Main Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Messaging Toggle */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle>Customer Messaging</CardTitle>
                </div>
                <CardDescription>
                  Enable or disable customer messaging feature
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="messaging-enabled" className="flex flex-col space-y-1">
                    <span className="font-medium">Enable Messaging</span>
                    <span className="text-sm text-muted-foreground">
                      Allow customers to send messages
                    </span>
                  </Label>
                  <Switch
                    id="messaging-enabled"
                    checked={settings.messaging_enabled}
                    onCheckedChange={(checked) => updateSetting('messaging_enabled', checked)}
                  />
                </div>

                {!settings.messaging_enabled && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Customers won't be able to send new messages
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Auto-Reply */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle>AI Auto-Reply</CardTitle>
                </div>
                <CardDescription>
                  Automatically respond to customer messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="ai-auto-reply" className="flex flex-col space-y-1">
                    <span className="font-medium">Enable Auto-Reply</span>
                    <span className="text-sm text-muted-foreground">
                      Send automatic response
                    </span>
                  </Label>
                  <Switch
                    id="ai-auto-reply"
                    checked={settings.ai_auto_reply_enabled}
                    onCheckedChange={(checked) => updateSetting('ai_auto_reply_enabled', checked)}
                    disabled={!settings.messaging_enabled}
                  />
                </div>

                {settings.ai_auto_reply_enabled && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                    <p className="text-sm text-primary">
                      Team will still be notified of new messages
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Auto-Reply Message */}
          {settings.ai_auto_reply_enabled && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Auto-Reply Message</CardTitle>
                </div>
                <CardDescription>
                  Customize the automatic reply message
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-reply-message">Message</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateAIReply}
                      disabled={generatingAI}
                      className="gap-2"
                    >
                      {generatingAI ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="auto-reply-message"
                    placeholder="Enter your auto-reply message..."
                    value={settings.ai_auto_reply_message}
                    onChange={(e) => updateSetting('ai_auto_reply_message', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sent when a customer starts a new conversation
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4 mt-6">
          {loadingLeads ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Leads Yet</h3>
                <p className="text-muted-foreground text-center">
                  Visitor inquiries will appear here when someone fills out the contact form
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card key={lead.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {lead.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(lead.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(lead.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lead.question && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium mb-1">Question:</p>
                        <p className="text-sm text-muted-foreground">{lead.question}</p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {lead.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateLeadStatus(lead.id, 'contacted')}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark Contacted
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `mailto:${lead.email}`}
                            className="gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            Email
                          </Button>
                        </>
                      )}
                      {lead.status === 'contacted' && (
                        <Button
                          size="sm"
                          onClick={() => updateLeadStatus(lead.id, 'converted')}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Mark Converted
                        </Button>
                      )}
                      {lead.status !== 'closed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateLeadStatus(lead.id, 'closed')}
                          className="gap-1"
                        >
                          <XCircle className="h-3 w-3" />
                          Close
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteLead(lead.id)}
                        className="gap-1 ml-auto"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Customer Access Tab */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Messaging Access</CardTitle>
              <CardDescription>
                Enable or disable messaging for individual customers. Customers with messaging disabled cannot send or receive messages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search customers by name or email..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {loadingCustomers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-muted-foreground">Loading customers...</p>
                  </div>
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Customers Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customer accounts will appear here once users sign up
                  </p>
                  <Button variant="outline" size="sm" onClick={loadCustomers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh List
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Customer Name</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Messaging Status</TableHead>
                          <TableHead className="text-right font-semibold min-w-[140px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers
                          .filter(customer =>
                            customer.full_name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                            customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                          )
                          .map((customer) => (
                            <TableRow key={customer.id} className="hover:bg-muted/30">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserIcon className="h-4 w-4 text-primary" />
                                  </div>
                                  {customer.full_name || 'Unknown'}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {customer.email}
                              </TableCell>
                              <TableCell>
                                {customer.messaging_disabled ? (
                                  <Badge variant="destructive" className="gap-1.5 px-3 py-1">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Disabled
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="gap-1.5 px-3 py-1 bg-green-500 hover:bg-green-600">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Enabled
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant={customer.messaging_disabled ? "default" : "outline"}
                                  onClick={() => toggleCustomerMessaging(customer.id, customer.messaging_disabled)}
                                  className="gap-1.5 font-medium"
                                >
                                  {customer.messaging_disabled ? (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      Enable
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4" />
                                      Disable
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>

                  {customers.filter(customer =>
                    customer.full_name?.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-t">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No customers match your search</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessagingSettings;
