import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Stethoscope,
  Video,
  Calendar,
  Clock,
  FileText,
  Pill,
  Plus,
  Loader2,
  User,
  MessageSquare,
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

const DoctorConsultations = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor_id: '',
    consultation_type: 'video',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchConsultations();
      fetchDoctors();
      fetchPrescriptions();
    }
  }, [userProfile?.id]);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_consultations')
        .select('*, health_professionals(*)')
        .eq('user_id', userProfile.id)
        .order('scheduled_datetime', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('health_professionals')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*, doctor_consultations(*, health_professionals(*))')
        .eq('user_id', userProfile.id)
        .order('prescribed_date', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleBookConsultation = async () => {
    try {
      const scheduledDatetime = `${formData.date}T${formData.time}:00`;

      const { error } = await supabase
        .from('doctor_consultations')
        .insert({
          user_id: userProfile.id,
          doctor_id: formData.doctor_id,
          consultation_type: formData.consultation_type,
          scheduled_datetime: scheduledDatetime,
          reason: formData.reason,
          notes: formData.notes,
          status: 'scheduled',
        });

      if (error) throw error;

      toast({
        title: t('consultationBooked') || 'Consultation Booked',
        description: t('consultationBookedSuccessfully') || 'Your consultation has been scheduled successfully',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchConsultations();
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToBookConsultation') || 'Failed to book consultation',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      doctor_id: '',
      consultation_type: 'video',
      date: '',
      time: '',
      reason: '',
      notes: '',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-500/20 text-blue-300',
      completed: 'bg-green-500/20 text-green-300',
      cancelled: 'bg-red-500/20 text-red-300',
      inProgress: 'bg-yellow-500/20 text-yellow-300',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  const upcomingConsultations = consultations.filter(
    c => c.status === 'scheduled' && new Date(c.scheduled_datetime) > new Date()
  );
  const pastConsultations = consultations.filter(
    c => c.status === 'completed' || new Date(c.scheduled_datetime) < new Date()
  );

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Stethoscope className="w-6 h-6 text-primary" />
                {t('doctorConsultations') || 'Doctor Consultations'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('doctorConsultationsDescription') || 'Schedule and manage virtual consultations with healthcare professionals'}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('bookConsultation') || 'Book Consultation'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('scheduleConsultation') || 'Schedule Consultation'}</DialogTitle>
                  <DialogDescription>
                    {t('consultationDescription') || 'Book a virtual consultation with a healthcare professional'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doctor">{t('selectDoctor') || 'Select Doctor'}</Label>
                    <Select value={formData.doctor_id} onValueChange={(value) => setFormData(prev => ({ ...prev, doctor_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('chooseDoctor') || 'Choose a doctor'} />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">{t('consultationType') || 'Consultation Type'}</Label>
                    <Select value={formData.consultation_type} onValueChange={(value) => setFormData(prev => ({ ...prev, consultation_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <Video className="w-4 h-4 inline mr-2" />
                          {t('videoCall') || 'Video Call'}
                        </SelectItem>
                        <SelectItem value="chat">
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          {t('chat') || 'Chat'}
                        </SelectItem>
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
                    <Label htmlFor="reason">{t('reason') || 'Reason for Consultation'}</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder={t('enterReason') || 'Enter reason'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">{t('additionalNotes') || 'Additional Notes'}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={t('enterNotes') || 'Any additional information...'}
                    />
                  </div>

                  <Button onClick={handleBookConsultation} className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('confirmBooking') || 'Confirm Booking'}
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
              {t('upcoming') || 'Upcoming'} ({upcomingConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              {t('past') || 'Past'} ({pastConsultations.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              {t('prescriptions') || 'Prescriptions'} ({prescriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingConsultations.length > 0 ? (
              upcomingConsultations.map(consultation => (
                <Card key={consultation.id} className="glass-effect">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-primary/20 rounded-full">
                          <Stethoscope className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {consultation.health_professionals?.name}
                          </h3>
                          <p className="text-sm text-text-secondary mb-2">
                            {consultation.health_professionals?.specialization}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-text-secondary mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(consultation.scheduled_datetime).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(consultation.scheduled_datetime).toLocaleTimeString()}
                            </div>
                            <Badge className={getStatusColor(consultation.consultation_type)}>
                              {consultation.consultation_type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                              {consultation.consultation_type}
                            </Badge>
                          </div>
                          <p className="text-sm"><strong>{t('reason') || 'Reason'}:</strong> {consultation.reason}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noUpcomingConsultations') || 'No upcoming consultations'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastConsultations.length > 0 ? (
              pastConsultations.map(consultation => (
                <Card key={consultation.id} className="glass-effect opacity-80">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-muted rounded-full">
                          <Stethoscope className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {consultation.health_professionals?.name}
                          </h3>
                          <p className="text-sm text-text-secondary mb-2">
                            {consultation.health_professionals?.specialization}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(consultation.scheduled_datetime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300">
                        {t('completed') || 'Completed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noPastConsultations') || 'No past consultations'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-4">
            {prescriptions.length > 0 ? (
              prescriptions.map(prescription => (
                <Card key={prescription.id} className="glass-effect">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Pill className="w-6 h-6 text-primary" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{prescription.medication_name}</h3>
                        <p className="text-sm text-text-secondary mb-1">
                          <strong>{t('dosage') || 'Dosage'}:</strong> {prescription.dosage}
                        </p>
                        <p className="text-sm text-text-secondary mb-1">
                          <strong>{t('duration') || 'Duration'}:</strong> {prescription.duration}
                        </p>
                        <p className="text-sm text-text-secondary">
                          <strong>{t('prescribed') || 'Prescribed'}:</strong> {new Date(prescription.prescribed_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Pill className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noPrescriptions') || 'No prescriptions yet'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DoctorConsultations;
