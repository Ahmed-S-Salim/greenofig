import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageSquare,
  FileText,
  Clock,
  X
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import TierBadge from './TierBadge';
import TierBasedActions from './TierBasedActions';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ClientDetailsModal = ({ client, open, onOpenChange, onUpdate }) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [mealLogs, setMealLogs] = useState([]);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (client && open) {
      fetchClientData();
    }
  }, [client, open]);

  const fetchClientData = async () => {
    setLoading(true);
    try {
      // Fetch progress data
      const { data: progressData, error: progressError } = await supabase
        .from('client_progress')
        .select('*')
        .eq('client_id', client.id)
        .order('date', { ascending: true })
        .limit(30);

      if (!progressError) {
        setProgressData(progressData || []);
      }

      // Fetch meal logs (limited for Base tier)
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', client.id)
        .order('created_at', { ascending: false })
        .limit(client.tier === 'Base' ? 5 : 20);

      if (!mealsError) {
        setMealLogs(mealsData || []);
      }

      // Fetch nutritionist notes
      const { data: notesData, error: notesError } = await supabase
        .from('nutritionist_notes')
        .select('*')
        .eq('client_id', client.id)
        .eq('nutritionist_id', user.id)
        .maybeSingle();

      if (!notesError && notesData) {
        setNotes(notesData.notes || '');
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;

    try {
      const updatedNotes = notes ? `${notes}\n\n[${format(new Date(), 'MMM d, yyyy HH:mm')}]\n${newNote}` : newNote;

      const { error } = await supabase
        .from('nutritionist_notes')
        .upsert({
          client_id: client.id,
          nutritionist_id: user.id,
          notes: updatedNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'client_id,nutritionist_id'
        });

      if (error) throw error;

      setNotes(updatedNotes);
      setNewNote('');
      toast({
        title: 'Note saved',
        description: 'Your note has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save note.',
        variant: 'destructive',
      });
    }
  };

  const handleAction = (actionType, clientData) => {
    switch (actionType) {
      case 'message':
        toast({
          title: 'Message',
          description: 'Opening message composer...',
        });
        // TODO: Open message composer
        break;
      case 'createMealPlan':
        toast({
          title: 'Meal Plan',
          description: 'Redirecting to meal plan creator...',
        });
        // TODO: Navigate to meal plan creator
        break;
      case 'scheduleVideo':
        toast({
          title: 'Video Call',
          description: 'Opening scheduler...',
        });
        // TODO: Open video call scheduler
        break;
      default:
        toast({
          title: actionType,
          description: `Action: ${actionType}`,
        });
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return 'N/A';
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    return bmi;
  };

  const chartData = progressData.map(p => ({
    date: format(new Date(p.date), 'MMM d'),
    weight: p.weight_kg,
  }));

  const latestProgress = progressData[progressData.length - 1];
  const previousProgress = progressData[progressData.length - 2];
  const weightChange = latestProgress && previousProgress
    ? (latestProgress.weight_kg - previousProgress.weight_kg).toFixed(1)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{client.full_name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{client.email}</p>
            </div>
            <TierBadge tier={client.tier || 'Base'} size="lg" />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="meals">Meal Logs</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Client Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Current Weight</p>
                    <p className="text-3xl font-bold">
                      {latestProgress?.weight_kg || 'N/A'}
                      {latestProgress && <span className="text-lg"> kg</span>}
                    </p>
                    {weightChange && (
                      <p className={`text-sm mt-2 flex items-center justify-center gap-1 ${
                        parseFloat(weightChange) < 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(weightChange) < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        {Math.abs(weightChange)} kg
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">BMI</p>
                    <p className="text-3xl font-bold">
                      {calculateBMI(latestProgress?.weight_kg, client.height_cm)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Height: {client.height_cm ? `${client.height_cm} cm` : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Last Update</p>
                    <p className="text-lg font-bold">
                      {latestProgress?.date
                        ? format(new Date(latestProgress.date), 'MMM d, yyyy')
                        : 'No updates'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Member since {client.created_at ? format(new Date(client.created_at), 'MMM yyyy') : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nutritionist Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{notes}</pre>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newNote">Add Note</Label>
                  <Textarea
                    id="newNote"
                    placeholder="Add a new note about this client..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleSaveNote} disabled={!newNote.trim()}>
                    <FileText className="w-4 h-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {client.tier === 'Base' ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Progress Tracking Unavailable</h3>
                  <p className="text-muted-foreground mb-4">
                    Progress tracking is available for Premium and Elite tier clients
                  </p>
                  <TierBadge tier="Premium" />
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Weight Progress (Last 30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="weight"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No progress data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Meal Logs</span>
                  {client.tier === 'Base' && (
                    <span className="text-xs text-muted-foreground">(Limited to 5)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mealLogs.length > 0 ? (
                  <div className="space-y-3">
                    {mealLogs.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{meal.meal_name || 'Meal'}</p>
                          <p className="text-sm text-muted-foreground">
                            {meal.created_at ? format(new Date(meal.created_at), 'MMM d, yyyy HH:mm') : 'Unknown date'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{meal.calories || 0} cal</p>
                          <p className="text-xs text-muted-foreground">
                            P: {meal.protein || 0}g | C: {meal.carbs || 0}g | F: {meal.fat || 0}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No meal logs available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Actions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Actions available based on client's {client.tier} tier
                </p>
              </CardHeader>
              <CardContent>
                <TierBasedActions client={client} onAction={handleAction} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ClientDetailsModal;
