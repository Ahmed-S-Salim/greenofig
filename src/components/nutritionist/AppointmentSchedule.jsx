import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  Video,
  Save,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const AppointmentSchedule = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('month'); // month, week, day

  const [appointmentForm, setAppointmentForm] = useState({
    client_id: '',
    title: '',
    description: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 60,
    consultation_type: 'follow_up',
    meeting_link: '',
    status: 'scheduled',
    notes: ''
  });

  const consultationTypes = [
    { value: 'initial', label: 'Initial Consultation' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'check_in', label: 'Check-in' }
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
    { value: 'no_show', label: 'No Show', color: 'bg-gray-500' }
  ];

  useEffect(() => {
    fetchAppointments();
    fetchClients();
  }, [user, currentDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:user_profiles!appointments_client_id_fkey(id, full_name, email)
        `)
        .eq('nutritionist_id', user.id)
        .gte('appointment_date', start.toISOString())
        .lte('appointment_date', end.toISOString())
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch appointments'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'user')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleOpenDialog = (appointment = null, date = null) => {
    if (appointment) {
      const aptDate = new Date(appointment.appointment_date);
      setEditingAppointment(appointment);
      setAppointmentForm({
        client_id: appointment.client_id,
        title: appointment.title,
        description: appointment.description || '',
        appointment_date: format(aptDate, 'yyyy-MM-dd'),
        appointment_time: format(aptDate, 'HH:mm'),
        duration_minutes: appointment.duration_minutes || 60,
        consultation_type: appointment.consultation_type || 'follow_up',
        meeting_link: appointment.meeting_link || '',
        status: appointment.status || 'scheduled',
        notes: appointment.notes || ''
      });
    } else {
      const selectedDateTime = date || selectedDate;
      setEditingAppointment(null);
      setAppointmentForm({
        client_id: '',
        title: '',
        description: '',
        appointment_date: format(selectedDateTime, 'yyyy-MM-dd'),
        appointment_time: '10:00',
        duration_minutes: 60,
        consultation_type: 'follow_up',
        meeting_link: '',
        status: 'scheduled',
        notes: ''
      });
    }
    setShowAppointmentDialog(true);
  };

  const handleSaveAppointment = async () => {
    if (!appointmentForm.client_id || !appointmentForm.title || !appointmentForm.appointment_date || !appointmentForm.appointment_time) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields'
      });
      return;
    }

    setSaving(true);
    try {
      const appointmentDateTime = new Date(`${appointmentForm.appointment_date}T${appointmentForm.appointment_time}`);

      const appointmentData = {
        nutritionist_id: user.id,
        client_id: appointmentForm.client_id,
        title: appointmentForm.title,
        description: appointmentForm.description,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: parseInt(appointmentForm.duration_minutes),
        consultation_type: appointmentForm.consultation_type,
        meeting_link: appointmentForm.meeting_link,
        status: appointmentForm.status,
        notes: appointmentForm.notes
      };

      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(appointmentData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
        toast({ title: 'Appointment updated successfully' });
      } else {
        const { error } = await supabase
          .from('appointments')
          .insert(appointmentData);

        if (error) throw error;
        toast({ title: 'Appointment created successfully' });
      }

      setShowAppointmentDialog(false);
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save appointment'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({ title: 'Appointment deleted successfully' });
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete appointment'
      });
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt =>
      isSameDay(parseISO(apt.appointment_date), date)
    );
  };

  const getAppointmentsForToday = () => {
    const today = new Date();
    return appointments.filter(apt => isSameDay(parseISO(apt.appointment_date), today));
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const AppointmentCard = ({ appointment, compact = false }) => {
    const status = statusOptions.find(s => s.value === appointment.status);
    const aptTime = new Date(appointment.appointment_date);

    if (compact) {
      return (
        <div
          onClick={() => handleOpenDialog(appointment)}
          className="text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
          style={{ backgroundColor: status?.color.replace('bg-', '') + '30' }}
        >
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className="font-medium">{format(aptTime, 'h:mm a')}</span>
          </div>
          <div className="truncate">{appointment.title}</div>
        </div>
      );
    }

    return (
      <Card className="glass-effect hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  {format(aptTime, 'MMM d, yyyy')} at {format(aptTime, 'h:mm a')}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{appointment.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <User className="w-3 h-3" />
                {appointment.client?.full_name || 'Unknown Client'}
              </p>
            </div>
            <Badge variant={appointment.status === 'completed' ? 'default' : 'secondary'}>
              {status?.label}
            </Badge>
          </div>

          {appointment.description && (
            <p className="text-sm text-muted-foreground mb-3">{appointment.description}</p>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">
                Duration: {appointment.duration_minutes} min
              </span>
              {appointment.meeting_link && (
                <span className="flex items-center gap-1 text-primary">
                  <Video className="w-4 h-4" />
                  Video call
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenDialog(appointment)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteAppointment(appointment.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            Schedule
          </h2>
          <p className="text-muted-foreground mt-1">Manage your appointments and consultations</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-xl font-semibold min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {getDaysInMonth().map(day => {
              const dayAppointments = getAppointmentsForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                  } ${isCurrentDay ? 'bg-primary/5' : ''}`}
                >
                  <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map(apt => (
                      <AppointmentCard key={apt.id} appointment={apt} compact />
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Appointments */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>
            Appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getAppointmentsForDate(selectedDate).length > 0 ? (
            <div className="space-y-4">
              {getAppointmentsForDate(selectedDate).map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">No appointments scheduled for this date</p>
              <Button
                variant="outline"
                onClick={() => handleOpenDialog(null, selectedDate)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="glass-effect custom-scrollbar max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Client *</label>
                <select
                  value={appointmentForm.client_id}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Title *</label>
                <Input
                  value={appointmentForm.title}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })}
                  placeholder="e.g., Initial Consultation"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={appointmentForm.description}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                  placeholder="Brief description of the appointment"
                  rows={3}
                />
              </div>

              <div className="min-w-0">
                <label className="text-sm font-medium mb-2 block">Date *</label>
                <Input
                  type="date"
                  value={appointmentForm.appointment_date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                  className="w-full min-w-0"
                />
              </div>

              <div className="min-w-0">
                <label className="text-sm font-medium mb-2 block">Time *</label>
                <Input
                  type="time"
                  value={appointmentForm.appointment_time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_time: e.target.value })}
                  className="w-full min-w-0"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={appointmentForm.duration_minutes}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, duration_minutes: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={appointmentForm.consultation_type}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, consultation_type: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  {consultationTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <select
                  value={appointmentForm.status}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md"
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Meeting Link (optional)</label>
                <Input
                  value={appointmentForm.meeting_link}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <Textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                  placeholder="Additional notes about this appointment"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAppointment} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentSchedule;
