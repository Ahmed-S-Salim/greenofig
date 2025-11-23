import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  FileText,
  TrendingUp,
  Activity,
  Heart,
  Target,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import TierBadge from './TierBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

const ClientOnboarding = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [intakeForms, setIntakeForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedForm, setSelectedForm] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignmentTier, setAssignmentTier] = useState('Base');

  useEffect(() => {
    fetchIntakeForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [searchTerm, statusFilter, intakeForms]);

  const fetchIntakeForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_intake_forms')
        .select(`
          *,
          user_profiles!client_intake_forms_client_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setIntakeForms(data || []);
    } catch (error) {
      console.error('Error fetching intake forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterForms = () => {
    let filtered = intakeForms;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => form.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(form =>
        form.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredForms(filtered);
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setReviewNotes('');
    setAssignmentTier(form.user_profiles?.tier || 'Base');
    setDialogOpen(true);
  };

  const handleApproveForm = async () => {
    if (!selectedForm) return;

    try {
      // Update intake form status
      const { error: formError } = await supabase
        .from('client_intake_forms')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', selectedForm.id);

      if (formError) throw formError;

      // Create client assignment
      const { error: assignmentError } = await supabase
        .from('nutritionist_client_assignments')
        .insert({
          nutritionist_id: user.id,
          client_id: selectedForm.client_id,
          tier: assignmentTier,
          notes: reviewNotes,
          status: 'active'
        });

      if (assignmentError && !assignmentError.message.includes('duplicate')) {
        throw assignmentError;
      }

      // Create welcome notification for client
      await supabase.rpc('create_notification', {
        p_user_id: selectedForm.client_id,
        p_type: 'new_client',
        p_title: 'Welcome to GreenoFig!',
        p_message: `You've been assigned to ${user.full_name}. Let's start your transformation journey!`,
        p_action_url: '/app/messages',
        p_priority: 'high'
      });

      // Refresh forms
      await fetchIntakeForms();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error approving form:', error);
      alert('Failed to approve form. Please try again.');
    }
  };

  const handleRejectForm = async () => {
    if (!selectedForm) return;

    try {
      const { error } = await supabase
        .from('client_intake_forms')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', selectedForm.id);

      if (error) throw error;

      // Create notification for client
      await supabase.rpc('create_notification', {
        p_user_id: selectedForm.client_id,
        p_type: 'new_client',
        p_title: 'Intake Form Update',
        p_message: 'Your intake form needs additional information. Please update and resubmit.',
        p_action_url: '/app/survey',
        p_priority: 'normal'
      });

      await fetchIntakeForms();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting form:', error);
      alert('Failed to reject form. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityLevelLabel = (level) => {
    const labels = {
      sedentary: 'Sedentary (Little to no exercise)',
      light: 'Light (1-3 days/week)',
      moderate: 'Moderate (3-5 days/week)',
      very_active: 'Very Active (6-7 days/week)',
      extremely_active: 'Extremely Active (2x/day)'
    };
    return labels[level] || level;
  };

  const getGoalLabel = (goal) => {
    const labels = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Muscle Gain',
      maintenance: 'Maintenance',
      athletic_performance: 'Athletic Performance',
      health_improvement: 'Health Improvement'
    };
    return labels[goal] || goal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-primary" />
            Client Onboarding
          </h2>
          <p className="text-text-secondary mt-1">Review and approve new client intake forms</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Pending</p>
                <p className="text-2xl font-bold">{intakeForms.filter(f => f.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Approved</p>
                <p className="text-2xl font-bold text-green-600">{intakeForms.filter(f => f.status === 'approved').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{intakeForms.filter(f => f.status === 'reviewed').length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{intakeForms.filter(f => f.status === 'rejected').length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Intake Forms List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredForms.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary">No intake forms found</p>
            </CardContent>
          </Card>
        ) : (
          filteredForms.map((form) => (
            <Card key={form.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {form.user_profiles?.avatar_url ? (
                        <img
                          src={form.user_profiles.avatar_url}
                          alt={form.user_profiles.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-bold text-lg">
                          {form.user_profiles?.full_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{form.user_profiles?.full_name || 'Unknown'}</h3>
                      <p className="text-sm text-text-secondary">{form.user_profiles?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(form.status)}
                        <Badge variant={form.status === 'approved' ? 'success' : form.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {form.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary">
                        Submitted {format(new Date(form.submitted_at), 'MMM dd, yyyy')}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleViewForm(form)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Goal</p>
                      <p className="text-sm font-medium">{getGoalLabel(form.primary_goal)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Target Weight</p>
                      <p className="text-sm font-medium">{form.target_weight_kg} kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Activity</p>
                      <p className="text-sm font-medium capitalize">{form.activity_level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Deadline</p>
                      <p className="text-sm font-medium">
                        {form.goal_deadline ? format(new Date(form.goal_deadline), 'MMM dd, yyyy') : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Intake Form Review</DialogTitle>
            <DialogDescription>
              Review the client's health information and assign them to your practice
            </DialogDescription>
          </DialogHeader>

          {selectedForm && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {selectedForm.user_profiles?.avatar_url ? (
                    <img
                      src={selectedForm.user_profiles.avatar_url}
                      alt={selectedForm.user_profiles.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-bold text-2xl">
                      {selectedForm.user_profiles?.full_name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedForm.user_profiles?.full_name}</h3>
                  <p className="text-text-secondary">{selectedForm.user_profiles?.email}</p>
                  <Badge className="mt-2">{selectedForm.age} years old • {selectedForm.gender}</Badge>
                </div>
              </div>

              {/* Details Tabs */}
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Height</label>
                      <p className="text-lg">{selectedForm.height_cm} cm</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Current Weight</label>
                      <p className="text-lg">{selectedForm.current_weight_kg} kg</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target Weight</label>
                      <p className="text-lg">{selectedForm.target_weight_kg} kg</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">BMI</label>
                      <p className="text-lg">
                        {((selectedForm.current_weight_kg / ((selectedForm.height_cm / 100) ** 2))).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="health" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Medical Conditions</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedForm.medical_conditions?.length > 0 ? (
                        selectedForm.medical_conditions.map((condition, idx) => (
                          <Badge key={idx} variant="outline">{condition}</Badge>
                        ))
                      ) : (
                        <p className="text-text-secondary">None reported</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Allergies</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedForm.allergies?.length > 0 ? (
                        selectedForm.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="outline">{allergy}</Badge>
                        ))
                      ) : (
                        <p className="text-text-secondary">None reported</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Medications</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedForm.medications?.length > 0 ? (
                        selectedForm.medications.map((med, idx) => (
                          <Badge key={idx} variant="outline">{med}</Badge>
                        ))
                      ) : (
                        <p className="text-text-secondary">None reported</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dietary Restrictions</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedForm.dietary_restrictions?.length > 0 ? (
                        selectedForm.dietary_restrictions.map((restriction, idx) => (
                          <Badge key={idx} variant="outline">{restriction}</Badge>
                        ))
                      ) : (
                        <p className="text-text-secondary">None</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="lifestyle" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Activity Level</label>
                      <p className="text-lg">{getActivityLevelLabel(selectedForm.activity_level)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Sleep Hours</label>
                      <p className="text-lg">{selectedForm.sleep_hours} hours/night</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stress Level</label>
                      <Badge variant={selectedForm.stress_level === 'high' ? 'destructive' : 'secondary'}>
                        {selectedForm.stress_level}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Water Intake</label>
                      <p className="text-lg">{selectedForm.water_intake_liters} L/day</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cooking Skill</label>
                      <p className="text-lg capitalize">{selectedForm.cooking_skill_level}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weekly Budget</label>
                      <p className="text-lg">${selectedForm.budget_per_week}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="goals" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Primary Goal</label>
                    <p className="text-lg">{getGoalLabel(selectedForm.primary_goal)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Goal Deadline</label>
                    <p className="text-lg">
                      {selectedForm.goal_deadline ? format(new Date(selectedForm.goal_deadline), 'MMMM dd, yyyy') : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Motivation Level</label>
                    <Badge variant={selectedForm.motivation_level === 'high' ? 'success' : 'secondary'}>
                      {selectedForm.motivation_level}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Previous Diet Experience</label>
                    <p className="text-sm mt-2 p-3 bg-muted rounded">
                      {selectedForm.previous_diet_experience || 'None provided'}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Assignment Section */}
              {selectedForm.status === 'pending' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">Assignment Details</h4>
                  <div>
                    <label className="text-sm font-medium">Assign Tier</label>
                    <div className="flex gap-2 mt-2">
                      {['Base', 'Premium', 'Elite'].map((tier) => (
                        <Button
                          key={tier}
                          variant={assignmentTier === tier ? 'default' : 'outline'}
                          onClick={() => setAssignmentTier(tier)}
                          size="sm"
                        >
                          {tier}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Review Notes (Optional)</label>
                    <Textarea
                      placeholder="Add any notes about this client..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedForm?.status === 'pending' && (
              <>
                <Button variant="outline" onClick={handleRejectForm}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApproveForm}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Assign
                </Button>
              </>
            )}
            {selectedForm?.status !== 'pending' && (
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientOnboarding;
