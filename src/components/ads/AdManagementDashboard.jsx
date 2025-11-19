import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useAdManagement } from '@/hooks/useAdSystem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  DollarSign,
  MousePointer,
  Users,
  TrendingUp,
  Target,
  RefreshCw,
  Image as ImageIcon,
  Video,
  Layout,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ad Management Dashboard for Admins
 * Create, edit, and monitor ad campaigns
 */
const AdManagementDashboard = () => {
  const { user } = useAuth();
  const {
    placements,
    campaigns,
    analytics,
    loading,
    fetchPlacements,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    toggleCampaignStatus,
    fetchAnalytics
  } = useAdManagement();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [saving, setSaving] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchPlacements();
    fetchCampaigns();
    fetchAnalytics(30);
  }, [fetchPlacements, fetchCampaigns, fetchAnalytics]);

  // Default form data
  function getDefaultFormData() {
    return {
      name: '',
      advertiser_name: '',
      description: '',
      title: '',
      subtitle: '',
      body_text: '',
      image_url: '',
      video_url: '',
      cta_text: 'Learn More',
      cta_url: '',
      background_color: '#ffffff',
      text_color: '#000000',
      placement_id: '',
      target_plans: ['Base'],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true,
      status: 'active',
      cost_per_click: 0.50,
      cost_per_impression: 0.005,
      budget_daily: 100,
      budget_total: 1000,
      max_daily_impressions: 10000,
      frequency_cap: 5
    };
  }

  // Handle form change
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    setSaving(true);
    const campaignData = {
      ...formData,
      created_by: user?.id,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : new Date().toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
    };

    const result = await createCampaign(campaignData);
    setSaving(false);

    if (result.success) {
      setShowCreateDialog(false);
      setFormData(getDefaultFormData());
    } else {
      alert('Error creating campaign: ' + result.error);
    }
  };

  // Update campaign
  const handleUpdateCampaign = async () => {
    if (!selectedCampaign) return;

    setSaving(true);
    const updates = {
      ...formData,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null
    };

    const result = await updateCampaign(selectedCampaign.id, updates);
    setSaving(false);

    if (result.success) {
      setShowEditDialog(false);
      setSelectedCampaign(null);
    } else {
      alert('Error updating campaign: ' + result.error);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }

    const result = await deleteCampaign(campaignId);
    if (!result.success) {
      alert('Error deleting campaign: ' + result.error);
    }
  };

  // Edit campaign
  const handleEditClick = (campaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name || '',
      advertiser_name: campaign.advertiser_name || '',
      description: campaign.description || '',
      title: campaign.title || '',
      subtitle: campaign.subtitle || '',
      body_text: campaign.body_text || '',
      image_url: campaign.image_url || '',
      video_url: campaign.video_url || '',
      cta_text: campaign.cta_text || 'Learn More',
      cta_url: campaign.cta_url || '',
      background_color: campaign.background_color || '#ffffff',
      text_color: campaign.text_color || '#000000',
      placement_id: campaign.placement_id || '',
      target_plans: campaign.target_plans || ['Base'],
      start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
      end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
      is_active: campaign.is_active,
      status: campaign.status || 'active',
      cost_per_click: campaign.cost_per_click || 0.50,
      cost_per_impression: campaign.cost_per_impression || 0.005,
      budget_daily: campaign.budget_daily || 100,
      budget_total: campaign.budget_total || 1000,
      max_daily_impressions: campaign.max_daily_impressions || 10000,
      frequency_cap: campaign.frequency_cap || 5
    });
    setShowEditDialog(true);
  };

  // Calculate metrics
  const totalRevenue = analytics?.estimatedRevenue || 0;
  const avgCTR = analytics?.ctr || 0;
  const activeCampaigns = campaigns.filter(c => c.is_active && c.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ad Management</h2>
          <p className="text-text-secondary">Create and manage advertising campaigns for Basic tier users</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelpDialog(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Help Guide
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchCampaigns();
              fetchAnalytics(30);
            }}
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="placements">Ad Placements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalImpressions?.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgCTR}%</div>
                <p className="text-xs text-muted-foreground">{analytics?.totalClicks || 0} clicks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">of {campaigns.length} total</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
              <CardDescription>Campaigns with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.campaignPerformance?.slice(0, 5).map(campaign => {
                    const ctr = campaign.total_impressions > 0
                      ? ((campaign.total_clicks / campaign.total_impressions) * 100).toFixed(2)
                      : 0;
                    const revenue = (
                      (campaign.total_impressions * (campaign.cost_per_impression || 0.005)) +
                      (campaign.total_clicks * (campaign.cost_per_click || 0.50))
                    ).toFixed(2);

                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{campaign.total_impressions.toLocaleString()}</TableCell>
                        <TableCell>{campaign.total_clicks.toLocaleString()}</TableCell>
                        <TableCell>{ctr}%</TableCell>
                        <TableCell>${revenue}</TableCell>
                      </TableRow>
                    );
                  })}
                  {(!analytics?.campaignPerformance || analytics.campaignPerformance.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-text-secondary">
                        No campaign data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>Manage your advertising campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CPC</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(campaign => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-xs text-text-secondary">{campaign.advertiser_name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {campaign.ad_placements?.display_name || 'Unassigned'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={campaign.is_active}
                          onCheckedChange={(checked) => toggleCampaignStatus(campaign.id, checked)}
                        />
                      </TableCell>
                      <TableCell>{campaign.total_impressions?.toLocaleString() || 0}</TableCell>
                      <TableCell>{campaign.total_clicks?.toLocaleString() || 0}</TableCell>
                      <TableCell>${campaign.cost_per_click?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(campaign)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {campaigns.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-text-secondary">
                        No campaigns created yet. Click "Create Campaign" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placements Tab */}
        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Placements</CardTitle>
              <CardDescription>Available locations for displaying ads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {placements.map(placement => (
                  <Card key={placement.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{placement.display_name}</CardTitle>
                        {placement.placement_type === 'banner' && <Layout className="w-5 h-5 text-primary" />}
                        {placement.placement_type === 'video' && <Video className="w-5 h-5 text-primary" />}
                        {placement.placement_type === 'native' && <ImageIcon className="w-5 h-5 text-primary" />}
                        {placement.placement_type === 'interstitial' && <Target className="w-5 h-5 text-primary" />}
                        {placement.placement_type === 'sidebar' && <BarChart3 className="w-5 h-5 text-primary" />}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-text-secondary mb-3">{placement.description}</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Type:</span>
                          <span className="font-medium capitalize">{placement.placement_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Location:</span>
                          <span className="font-medium capitalize">{placement.page_location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Position:</span>
                          <span className="font-medium capitalize">{placement.position}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Dimensions:</span>
                          <span className="font-medium">
                            {placement.dimensions?.width}x{placement.dimensions?.height}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Priority:</span>
                          <span className="font-medium">{placement.priority}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs",
                          placement.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {placement.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed metrics for your ad campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Engagement Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Total Impressions</span>
                      <span className="font-bold">{analytics?.totalImpressions?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Total Clicks</span>
                      <span className="font-bold">{analytics?.totalClicks?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Total Conversions</span>
                      <span className="font-bold">{analytics?.totalConversions?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Rates</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Click-Through Rate (CTR)</span>
                      <span className="font-bold">{analytics?.ctr || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Conversion Rate (CVR)</span>
                      <span className="font-bold">{analytics?.cvr || 0}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Active Campaigns</span>
                      <span className="font-bold">{activeCampaigns}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Revenue</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Estimated Revenue</span>
                      <span className="font-bold text-green-600">${analytics?.estimatedRevenue || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Revenue per 1K Impressions</span>
                      <span className="font-bold">
                        ${analytics?.totalImpressions > 0
                          ? ((analytics.estimatedRevenue / analytics.totalImpressions) * 1000).toFixed(2)
                          : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-secondary">Date Range</span>
                      <span className="font-bold">{analytics?.dateRange || 30} days</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Campaign Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Set up a new advertising campaign for Basic tier users
            </DialogDescription>
          </DialogHeader>

          <CampaignForm
            formData={formData}
            onChange={handleFormChange}
            placements={placements}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign} disabled={saving}>
              {saving ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update campaign settings and content
            </DialogDescription>
          </DialogHeader>

          <CampaignForm
            formData={formData}
            onChange={handleFormChange}
            placements={placements}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCampaign} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Guide Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Ad Management Help Guide
            </DialogTitle>
            <DialogDescription>
              Learn how to create and manage ads to monetize your Basic (free) tier users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Quick Start Guide
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium">Run Database Migration</p>
                    <p className="text-sm text-text-secondary">Execute the SQL migration file to create ad tables in your Supabase database</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-1 block">npx supabase db push</code>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium">Create Your First Campaign</p>
                    <p className="text-sm text-text-secondary">Click "Create Campaign" button above and fill in the details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium">Choose a Placement</p>
                    <p className="text-sm text-text-secondary">Select where your ad will appear (top banner, sidebar, blog, etc.)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                  <div>
                    <p className="font-medium">Activate & Monitor</p>
                    <p className="text-sm text-text-secondary">Toggle the campaign to Active and track performance in Analytics tab</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Make Money */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                How to Make Money with Ads
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Option A: Promote Your Premium Plans</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Create ads that encourage free users to upgrade:</p>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      <li>Title: "Upgrade to Premium"</li>
                      <li>CTA: "See Plans" → /pricing</li>
                      <li>Revenue: Subscription payments</li>
                    </ul>
                    <p className="text-green-600 font-medium">Best for: Growing paid user base</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Option B: Sell Ad Space</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Contact health/fitness brands directly:</p>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      <li>Banner: $500-1000/month</li>
                      <li>Sidebar: $750-1500/month</li>
                      <li>Video: $1500-3000/month</li>
                    </ul>
                    <p className="text-green-600 font-medium">Best for: Direct revenue from advertisers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Option C: Google AdSense</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Automatic ad network integration:</p>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      <li>Sign up at google.com/adsense</li>
                      <li>Revenue: $1-5 per 1000 impressions</li>
                      <li>Automatic, no sales needed</li>
                    </ul>
                    <p className="text-green-600 font-medium">Best for: Passive income</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Option D: Affiliate Marketing</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Earn commissions on product sales:</p>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      <li>Partner with supplement brands</li>
                      <li>Fitness equipment companies</li>
                      <li>5-20% commission per sale</li>
                    </ul>
                    <p className="text-green-600 font-medium">Best for: Performance-based revenue</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Ad Placements */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-500" />
                Available Ad Placements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span><strong>Top Banner:</strong> Top of user dashboard</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span><strong>Bottom Banner:</strong> Fixed at bottom of screen</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span><strong>Dashboard Sidebar:</strong> Side panel in dashboard</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span><strong>Blog Inline:</strong> Within blog content</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span><strong>Rewarded Video:</strong> Users watch for rewards</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span><strong>After AI Generation:</strong> Full-screen interstitial</span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Important Notes
              </h3>
              <ul className="text-sm space-y-2 text-text-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Ads are <strong>only shown to Basic (free) tier users</strong> - paid subscribers never see ads</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>All tracking (impressions, clicks, conversions) is automatic</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Set CPC/CPM rates based on what advertisers will pay you</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Revenue shown is estimated based on your configured rates</span>
                </li>
              </ul>
            </div>

            {/* Revenue Estimate */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Estimated Revenue (per 1,000 free users)
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary">Banner Ads</p>
                  <p className="font-bold text-green-600">$100-200/month</p>
                </div>
                <div>
                  <p className="text-text-secondary">Interstitial Ads</p>
                  <p className="font-bold text-green-600">$150-300/month</p>
                </div>
                <div>
                  <p className="text-text-secondary">Video Ads</p>
                  <p className="font-bold text-green-600">$200-400/month</p>
                </div>
                <div>
                  <p className="text-text-secondary">Direct Sales</p>
                  <p className="font-bold text-green-600">$500-1000/month</p>
                </div>
              </div>
              <p className="text-base font-bold text-green-600 mt-3">Total Potential: $950-1,900/month</p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowHelpDialog(false)}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Campaign Form Component
 */
const CampaignForm = ({ formData, onChange, placements }) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Campaign Information</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g., Premium Upgrade Q1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="advertiser_name">Advertiser Name</Label>
            <Input
              id="advertiser_name"
              value={formData.advertiser_name}
              onChange={(e) => onChange('advertiser_name', e.target.value)}
              placeholder="e.g., GreenoFig"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Internal notes about this campaign..."
            rows={2}
          />
        </div>
      </div>

      {/* Creative Content */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Ad Creative</h4>
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            placeholder="e.g., Upgrade to Premium"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => onChange('subtitle', e.target.value)}
            placeholder="e.g., Unlock unlimited features"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body_text">Body Text</Label>
          <Textarea
            id="body_text"
            value={formData.body_text}
            onChange={(e) => onChange('body_text', e.target.value)}
            placeholder="Main ad copy..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => onChange('image_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (for video ads)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => onChange('video_url', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cta_text">Call-to-Action Text</Label>
            <Input
              id="cta_text"
              value={formData.cta_text}
              onChange={(e) => onChange('cta_text', e.target.value)}
              placeholder="e.g., Learn More"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta_url">CTA URL *</Label>
            <Input
              id="cta_url"
              value={formData.cta_url}
              onChange={(e) => onChange('cta_url', e.target.value)}
              placeholder="/pricing or https://..."
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="background_color">Background Color</Label>
            <Input
              id="background_color"
              type="color"
              value={formData.background_color}
              onChange={(e) => onChange('background_color', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="text_color">Text Color</Label>
            <Input
              id="text_color"
              type="color"
              value={formData.text_color}
              onChange={(e) => onChange('text_color', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Targeting */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Targeting</h4>
        <div className="space-y-2">
          <Label htmlFor="placement_id">Ad Placement *</Label>
          <Select
            value={formData.placement_id}
            onValueChange={(value) => onChange('placement_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select placement" />
            </SelectTrigger>
            <SelectContent>
              {placements.map(placement => (
                <SelectItem key={placement.id} value={placement.id}>
                  {placement.display_name} ({placement.placement_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Plans</Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.target_plans.includes('Base')}
                onChange={(e) => {
                  const plans = e.target.checked
                    ? [...formData.target_plans, 'Base']
                    : formData.target_plans.filter(p => p !== 'Base');
                  onChange('target_plans', plans);
                }}
              />
              <span className="text-sm">Base (Free)</span>
            </label>
          </div>
          <p className="text-xs text-text-secondary">
            Ads are only shown to Basic (free) tier users. Paid subscribers have ad-free experience.
          </p>
        </div>
      </div>

      {/* Schedule */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Schedule & Budget</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => onChange('start_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">End Date (optional)</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => onChange('end_date', e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost_per_click">Cost Per Click (CPC) $</Label>
            <Input
              id="cost_per_click"
              type="number"
              step="0.01"
              value={formData.cost_per_click}
              onChange={(e) => onChange('cost_per_click', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost_per_impression">Cost Per Impression (CPM) $</Label>
            <Input
              id="cost_per_impression"
              type="number"
              step="0.001"
              value={formData.cost_per_impression}
              onChange={(e) => onChange('cost_per_impression', parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget_daily">Daily Budget $</Label>
            <Input
              id="budget_daily"
              type="number"
              value={formData.budget_daily}
              onChange={(e) => onChange('budget_daily', parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget_total">Total Budget $</Label>
            <Input
              id="budget_total"
              type="number"
              value={formData.budget_total}
              onChange={(e) => onChange('budget_total', parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_daily_impressions">Max Daily Impressions</Label>
            <Input
              id="max_daily_impressions"
              type="number"
              value={formData.max_daily_impressions}
              onChange={(e) => onChange('max_daily_impressions', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency_cap">Frequency Cap (per user/day)</Label>
            <Input
              id="frequency_cap"
              type="number"
              value={formData.frequency_cap}
              onChange={(e) => onChange('frequency_cap', parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Campaign Status</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => onChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <Select
            value={formData.status}
            onValueChange={(value) => onChange('status', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AdManagementDashboard;
