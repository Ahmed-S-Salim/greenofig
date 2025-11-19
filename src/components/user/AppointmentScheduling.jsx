import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Bell,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AppointmentScheduling = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    professional_id: '',
    appointment_type: 'checkup',
    date: '',
    time: '',
    location: '',
    notes: '',
    reminder_time: '24',
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchAppointments();
      fetchProfessionals();
    }
  }, [userProfile?.id]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_appointments')
        .select('*, health_professionals(*)')
        .eq('user_id', userProfile.id)
        .order('appointment_datetime', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToLoadAppointments') || 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('health_professionals')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      const appointmentDatetime = `${formData.date}T${formData.time}:00`;

      const { error } = await supabase
        .from('doctor_appointments')
        .insert({
          user_id: userProfile.id,
          professional_id: formData.professional_id,
          appointment_type: formData.appointment_type,
          appointment_datetime: appointmentDatetime,
          location: formData.location,
          notes: formData.notes,
          reminder_hours_before: parseInt(formData.reminder_time),
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: t('appointmentScheduled') || 'Appointment Scheduled',
        description: t('appointmentScheduledSuccessfully') || 'Your appointment has been scheduled successfully',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToScheduleAppointment') || 'Failed to schedule appointment',
        variant: 'destructive',
      });
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const { error } = await supabase
        .from('doctor_appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('appointmentCancelled') || 'Appointment Cancelled',
        description: t('appointmentCancelledSuccessfully') || 'The appointment has been cancelled',
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToCancelAppointment') || 'Failed to cancel appointment',
        variant: 'destructive',
      });
    }
  };

  const handleReschedule = async (appointment) => {
    // Implementation for rescheduling
    setFormData({
      professional_id: appointment.professional_id,
      appointment_type: appointment.appointment_type,
      date: appointment.appointment_datetime.split('T')[0],
      time: appointment.appointment_datetime.split('T')[1].substring(0, 5),
      location: appointment.location || '',
      notes: appointment.notes || '',
      reminder_time: appointment.reminder_hours_before?.toString() || '24',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      professional_id: '',
      appointment_type: 'checkup',
      date: '',
      time: '',
      location: '',
      notes: '',
      reminder_time: '24',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-300',
      completed: 'bg-green-500/20 text-green-300',
      cancelled: 'bg-red-500/20 text-red-300',
      missed: 'bg-orange-500/20 text-orange-300',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const appointmentTypes = [
    { value: 'checkup', label: t('generalCheckup') || 'General Checkup', icon: '🩺' },
    { value: 'followup', label: t('followUp') || 'Follow-up', icon: '📋' },
    { value: 'consultation', label: t('consultation') || 'Consultation', icon: '💬' },
    { value: 'therapy', label: t('therapy') || 'Therapy', icon: '🧘' },
    { value: 'vaccination', label: t('vaccination') || 'Vaccination', icon: '💉' },
    { value: 'labwork', label: t('labWork') || 'Lab Work', icon: '🔬' },
  ];

  const upcomingAppointments = appointments.filter(
    a => a.status === 'scheduled' && new Date(a.appointment_datetime) > new Date()
  );
  const pastAppointments = appointments.filter(
    a => a.status === 'completed' || new Date(a.appointment_datetime) < new Date()
  );

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="w-6 h-6 text-primary" />
                {t('appointmentScheduling') || 'Appointment Scheduling'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('appointmentSchedulingDescription') || 'Manage your healthcare appointments and reminders'}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newAppointment') || 'New Appointment'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('scheduleAppointment') || 'Schedule Appointment'}</DialogTitle>
                  <DialogDescription>
                    {t('appointmentDescription') || 'Book an appointment with a healthcare professional'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="professional">{t('selectProfessional') || 'Select Healthcare Professional'}</Label>
                    <Select value={formData.professional_id} onValueChange={(value) => setFormData(prev => ({ ...prev, professional_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('chooseProfessional') || 'Choose a professional'} />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map(prof => (
                          <SelectItem key={prof.id} value={prof.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {prof.name} - {prof.specialization}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">{t('appointmentType') || 'Appointment Type'}</Label>
                    <Select value={formData.appointment_type} onValueChange={(value) => setFormData(prev => ({ ...prev, appointment_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">{t('date') || 'Date'}</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">{t('time') || 'Time'}</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">{t('location') || 'Location'}</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder={t('enterLocation') || 'Enter location or clinic address'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reminder">{t('reminder') || 'Reminder'}</Label>
                    <Select value={formData.reminder_time} onValueChange={(value) => setFormData(prev => ({ ...prev, reminder_time: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="24">1 day before</SelectItem>
                        <SelectItem value="48">2 days before</SelectItem>
                        <SelectItem value="168">1 week before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">{t('notes') || 'Notes'}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={t('enterNotes') || 'Any special notes or preparations...'}
                    />
                  </div>

                  <Button onClick={handleCreateAppointment} className="w-full">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {t('scheduleAppointment') || 'Schedule Appointment'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              {t('upcoming') || 'Upcoming'} ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t('past') || 'Past'} ({pastAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">
              {t('calendar') || 'Calendar'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map(appointment => (
                <Card key={appointment.id} className="glass-effect">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-primary/20 rounded-lg">
                          <CalendarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {appointmentTypes.find(t => t.value === appointment.appointment_type)?.label || appointment.appointment_type}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mb-2">
                            {t('with') || 'with'} {appointment.health_professionals?.name}
                          </p>
                          <div className="space-y-1 text-sm text-text-secondary">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {new Date(appointment.appointment_datetime).toLocaleString()}
                            </div>
                            {appointment.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {appointment.location}
                              </div>
                            )}
                            {appointment.reminder_hours_before && (
                              <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4" />
                                Reminder {appointment.reminder_hours_before}h before
                              </div>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm mt-2 p-2 bg-muted rounded">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReschedule(appointment)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          {t('reschedule') || 'Reschedule'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {t('cancel') || 'Cancel'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary mb-4">{t('noUpcomingAppointments') || 'No upcoming appointments'}</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('scheduleFirst') || 'Schedule Your First Appointment'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length > 0 ? (
              pastAppointments.map(appointment => (
                <Card key={appointment.id} className="glass-effect opacity-80">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {appointmentTypes.find(t => t.value === appointment.appointment_type)?.label || appointment.appointment_type}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {appointment.health_professionals?.name} - {new Date(appointment.appointment_datetime).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CalendarIcon className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noPastAppointments') || 'No past appointments'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="glass-effect">
              <CardContent className="p-6 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AppointmentScheduling;
