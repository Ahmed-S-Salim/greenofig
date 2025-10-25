import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  User,
  TrendingUp,
  Activity,
  FileText,
  Save,
  Plus,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const ClientProfileDialog = ({ client, open, onOpenChange, onUpdate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [progressData, setProgressData] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [notes, setNotes] = useState('');
  const [newProgress, setNewProgress] = useState({
    weight_kg: '',
    body_fat_percentage: '',
    waist_cm: '',
    hips_cm: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && client) {
      fetchClientData();
    }
  }, [open, client]);

  const fetchClientData = async () => {
    try {
      // Fetch progress history
      const { data: progress } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', client.id)
        .order('date', { ascending: true });

      setProgressData(progress || []);

      // Fetch health data
      const { data: health } = await supabase
        .from('client_health_data')
        .select('*')
        .eq('client_id', client.id)
        .single();

      setHealthData(health);

      // Load existing notes
      setNotes(client.nutritionist_notes || '');
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ nutritionist_notes: notes })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: 'Notes saved',
        description: 'Your notes have been saved successfully',
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save notes',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddProgress = async () => {
    if (!newProgress.weight_kg) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Weight is required',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('client_progress')
        .insert({
          client_id: client.id,
          nutritionist_id: user.id,
          ...newProgress,
        });

      if (error) throw error;

      toast({
        title: 'Progress added',
        description: 'Client progress has been recorded',
      });

      // Reset form and refetch data
      setNewProgress({
        weight_kg: '',
        body_fat_percentage: '',
        waist_cm: '',
        hips_cm: '',
      });
      fetchClientData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error adding progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add progress',
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {client?.full_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{client?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{client?.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-medium">{client?.height_cm ? `${client.height_cm} cm` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Weight</p>
                  <p className="font-medium">{client?.latestWeight ? `${client.latestWeight} kg` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">BMI</p>
                  <p className="font-medium">{calculateBMI(client?.latestWeight, client?.height_cm)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity Level</p>
                  <p className="font-medium capitalize">{client?.activity_level?.replace('_', ' ') || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {healthData && (
              <Card>
                <CardHeader>
                  <CardTitle>Health Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthData.allergies && healthData.allergies.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-2">
                        {healthData.allergies.map((allergy, i) => (
                          <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive rounded text-sm">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {healthData.dietary_restrictions && healthData.dietary_restrictions.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Dietary Restrictions</p>
                      <div className="flex flex-wrap gap-2">
                        {healthData.dietary_restrictions.map((restriction, i) => (
                          <span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded text-sm">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            {/* Progress Chart */}
            {progressData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Weight Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => format(new Date(date), 'MMM d')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight_kg"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Add Progress Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Progress Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Weight (kg) *</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newProgress.weight_kg}
                      onChange={(e) => setNewProgress({ ...newProgress, weight_kg: e.target.value })}
                      placeholder="70.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Body Fat %</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newProgress.body_fat_percentage}
                      onChange={(e) => setNewProgress({ ...newProgress, body_fat_percentage: e.target.value })}
                      placeholder="20.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Waist (cm)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newProgress.waist_cm}
                      onChange={(e) => setNewProgress({ ...newProgress, waist_cm: e.target.value })}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hips (cm)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newProgress.hips_cm}
                      onChange={(e) => setNewProgress({ ...newProgress, hips_cm: e.target.value })}
                      placeholder="95"
                    />
                  </div>
                </div>
                <Button onClick={handleAddProgress} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : 'Add Progress'}
                </Button>
              </CardContent>
            </Card>

            {/* Progress History */}
            {progressData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Progress History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {progressData.slice().reverse().map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{format(new Date(entry.date), 'MMMM d, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            Weight: {entry.weight_kg} kg
                            {entry.body_fat_percentage && ` • Body Fat: ${entry.body_fat_percentage}%`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Private Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add private notes about this client..."
                  rows={10}
                />
                <Button onClick={handleSaveNotes} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientProfileDialog;
