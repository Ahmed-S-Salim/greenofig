import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ruler,
  TrendingDown,
  TrendingUp,
  Calendar,
  Plus,
  Trash2,
  Download,
  BarChart3,
  LineChart as LineChartIcon,
  Table,
  Edit2,
  Save,
  X,
  Target,
  Activity,
  Award,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';

const MEASUREMENT_POINTS = [
  { id: 'weight', label: 'Weight', unit: 'kg', icon: Activity },
  { id: 'neck', label: 'Neck', unit: 'cm', icon: Ruler },
  { id: 'shoulders', label: 'Shoulders', unit: 'cm', icon: Ruler },
  { id: 'chest', label: 'Chest', unit: 'cm', icon: Ruler },
  { id: 'left_bicep', label: 'Left Bicep', unit: 'cm', icon: Ruler },
  { id: 'right_bicep', label: 'Right Bicep', unit: 'cm', icon: Ruler },
  { id: 'waist', label: 'Waist', unit: 'cm', icon: Ruler },
  { id: 'hips', label: 'Hips', unit: 'cm', icon: Ruler },
  { id: 'left_thigh', label: 'Left Thigh', unit: 'cm', icon: Ruler },
  { id: 'right_thigh', label: 'Right Thigh', unit: 'cm', icon: Ruler },
  { id: 'left_calf', label: 'Left Calf', unit: 'cm', icon: Ruler },
  { id: 'right_calf', label: 'Right Calf', unit: 'cm', icon: Ruler }
];

const BodyMeasurements = ({ compact = false }) => {
  const [measurements, setMeasurements] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('30'); // days
  const [loading, setLoading] = useState(true);
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  // New measurement form
  const [newMeasurement, setNewMeasurement] = useState({
    weight: '',
    neck: '',
    shoulders: '',
    chest: '',
    left_bicep: '',
    right_bicep: '',
    waist: '',
    hips: '',
    left_thigh: '',
    right_thigh: '',
    left_calf: '',
    right_calf: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchMeasurements();
    }
  }, [user]);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load measurements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async () => {
    try {
      // Convert empty strings to null
      const measurementData = {};
      Object.keys(newMeasurement).forEach(key => {
        if (key !== 'notes') {
          measurementData[key] = newMeasurement[key] ? parseFloat(newMeasurement[key]) : null;
        } else {
          measurementData[key] = newMeasurement[key];
        }
      });

      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          ...measurementData
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Measurements recorded successfully'
      });

      setShowAddDialog(false);
      setNewMeasurement({
        weight: '',
        neck: '',
        shoulders: '',
        chest: '',
        left_bicep: '',
        right_bicep: '',
        waist: '',
        hips: '',
        left_thigh: '',
        right_thigh: '',
        left_calf: '',
        right_calf: '',
        notes: ''
      });
      fetchMeasurements();
    } catch (error) {
      console.error('Error adding measurement:', error);
      toast({
        title: 'Error',
        description: 'Failed to record measurements',
        variant: 'destructive'
      });
    }
  };

  const deleteMeasurement = async (id) => {
    try {
      const { error } = await supabase
        .from('body_measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Measurement deleted successfully'
      });

      fetchMeasurements();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete measurement',
        variant: 'destructive'
      });
    }
  };

  const getChartData = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange));

    return measurements
      .filter(m => new Date(m.measured_at) >= cutoffDate)
      .reverse()
      .map(m => ({
        date: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: m[selectedMetric] || 0,
        fullDate: m.measured_at
      }));
  };

  const getProgressStats = (metric) => {
    if (measurements.length < 2) return null;

    const latest = measurements[0][metric];
    const oldest = measurements[measurements.length - 1][metric];

    if (!latest || !oldest) return null;

    const change = latest - oldest;
    const percentChange = ((change / oldest) * 100).toFixed(1);

    return {
      latest,
      oldest,
      change: change.toFixed(1),
      percentChange,
      isImprovement: metric === 'weight' || metric === 'waist' ? change < 0 : change > 0
    };
  };

  const getLatestMeasurement = () => {
    return measurements.length > 0 ? measurements[0] : null;
  };

  const chartData = getChartData();
  const latestMeasurement = getLatestMeasurement();
  const progressStats = getProgressStats(selectedMetric);

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Ruler className="w-6 h-6 text-primary" />
                Body Measurements
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {measurements.length} measurements • 11-point tracking
              </p>
            </div>

            <Button
              onClick={() => setShowAddDialog(true)}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600"
            >
              <Plus className="w-4 h-4" />
              Record Measurements
            </Button>
          </div>
        </CardHeader>

        {/* Latest Measurements Summary */}
        {latestMeasurement && (
          <CardContent className="border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {MEASUREMENT_POINTS.slice(0, 6).map(point => {
                const value = latestMeasurement[point.id];
                const stats = getProgressStats(point.id);

                return (
                  <div
                    key={point.id}
                    className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-purple-500/5 border"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-muted-foreground">{point.label}</p>
                      {stats && (
                        <Badge
                          variant="secondary"
                          className={`text-xs ${stats.isImprovement ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'}`}
                        >
                          {stats.change > 0 ? '+' : ''}{stats.change}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold">
                      {value ? `${value}${point.unit}` : '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Progress Chart */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Progress Chart</CardTitle>

            <div className="flex items-center gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEASUREMENT_POINTS.map(point => (
                    <SelectItem key={point.id} value={point.id}>
                      {point.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">6 Months</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <BarChart3 className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Record your first measurements to start tracking your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Stats */}
              {progressStats && (
                <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Latest</p>
                    <p className="text-2xl font-bold text-primary">
                      {progressStats.latest}
                      {MEASUREMENT_POINTS.find(p => p.id === selectedMetric)?.unit}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Change</p>
                    <p className={`text-2xl font-bold ${progressStats.isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                      {progressStats.change > 0 ? '+' : ''}{progressStats.change}
                      {MEASUREMENT_POINTS.find(p => p.id === selectedMetric)?.unit}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Percentage</p>
                    <p className={`text-2xl font-bold ${progressStats.isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                      {progressStats.percentChange}%
                    </p>
                  </div>
                </div>
              )}

              {/* Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Measurement History */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Measurement History</CardTitle>
        </CardHeader>

        <CardContent>
          {measurements.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Ruler className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No measurements yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Start tracking your body measurements to monitor your progress
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Record First Measurement
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {measurements.map((measurement, index) => (
                <motion.div
                  key={measurement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <p className="font-semibold">
                              {new Date(measurement.measured_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {Math.floor((new Date() - new Date(measurement.measured_at)) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMeasurement(measurement.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Measurements Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {MEASUREMENT_POINTS.map(point => {
                          const value = measurement[point.id];
                          if (!value) return null;

                          return (
                            <div
                              key={point.id}
                              className="p-2 rounded-lg bg-muted text-center"
                            >
                              <p className="text-xs text-muted-foreground mb-1">{point.label}</p>
                              <p className="text-sm font-semibold">
                                {value}{point.unit}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Notes */}
                      {measurement.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-sm">{measurement.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Measurement Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Body Measurements</DialogTitle>
            <DialogDescription>
              Track your progress with 11-point body measurements
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Primary Measurements */}
            <div>
              <h3 className="font-semibold mb-3">Primary Measurements</h3>
              <div className="grid grid-cols-2 gap-4">
                {MEASUREMENT_POINTS.slice(0, 4).map(point => (
                  <div key={point.id}>
                    <label className="text-sm font-medium mb-2 block">{point.label} ({point.unit})</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder={`e.g., ${point.id === 'weight' ? '75.5' : '85.0'}`}
                      value={newMeasurement[point.id]}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, [point.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Arm Measurements */}
            <div>
              <h3 className="font-semibold mb-3">Arms</h3>
              <div className="grid grid-cols-2 gap-4">
                {MEASUREMENT_POINTS.slice(4, 6).map(point => (
                  <div key={point.id}>
                    <label className="text-sm font-medium mb-2 block">{point.label} ({point.unit})</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 32.5"
                      value={newMeasurement[point.id]}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, [point.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Core Measurements */}
            <div>
              <h3 className="font-semibold mb-3">Core</h3>
              <div className="grid grid-cols-2 gap-4">
                {MEASUREMENT_POINTS.slice(6, 8).map(point => (
                  <div key={point.id}>
                    <label className="text-sm font-medium mb-2 block">{point.label} ({point.unit})</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 80.0"
                      value={newMeasurement[point.id]}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, [point.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Leg Measurements */}
            <div>
              <h3 className="font-semibold mb-3">Legs</h3>
              <div className="grid grid-cols-2 gap-4">
                {MEASUREMENT_POINTS.slice(8, 12).map(point => (
                  <div key={point.id}>
                    <label className="text-sm font-medium mb-2 block">{point.label} ({point.unit})</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 55.0"
                      value={newMeasurement[point.id]}
                      onChange={(e) => setNewMeasurement({ ...newMeasurement, [point.id]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
              <Input
                placeholder="How are you feeling today?"
                value={newMeasurement.notes}
                onChange={(e) => setNewMeasurement({ ...newMeasurement, notes: e.target.value })}
              />
            </div>

            {/* Tips */}
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📏 Measurement Tips:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Measure at the same time of day (preferably morning)</li>
                <li>• Measure on bare skin, not over clothing</li>
                <li>• Keep the tape measure snug but not tight</li>
                <li>• Take measurements in front of a mirror for accuracy</li>
              </ul>
            </div>

            <Button
              onClick={addMeasurement}
              disabled={!newMeasurement.weight && !newMeasurement.waist}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Measurements
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodyMeasurements;
