import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  MessageSquare,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  scheduled: { label: 'Scheduled', label_ar: 'مجدول', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Calendar },
  confirmed: { label: 'Confirmed', label_ar: 'مؤكد', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: CheckCircle },
  completed: { label: 'Completed', label_ar: 'مكتمل', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', label_ar: 'ملغي', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
  no_show: { label: 'No Show', label_ar: 'لم يحضر', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: AlertCircle },
  rescheduled: { label: 'Rescheduled', label_ar: 'أعيد جدولته', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', icon: RefreshCw }
};

const typeConfig = {
  video_call: { label: 'Video Call', label_ar: 'مكالمة فيديو', icon: Video, color: 'text-blue-500' },
  phone_call: { label: 'Phone Call', label_ar: 'مكالمة هاتفية', icon: Phone, color: 'text-green-500' },
  in_person: { label: 'In Person', label_ar: 'حضوري', icon: MapPin, color: 'text-purple-500' },
  chat: { label: 'Chat', label_ar: 'محادثة', icon: MessageSquare, color: 'text-orange-500' }
};

export default function UserAppointments() {
  const { t, i18n } = useTranslation();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (userProfile?.id) {
      fetchAppointments();
    }
  }, [userProfile?.id]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          nutritionist:user_profiles!appointments_nutritionist_id_fkey(id, full_name, profile_picture_url, email)
        `)
        .eq('client_id', userProfile.id)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = (appointment) => {
    if (appointment.meeting_link) {
      window.open(appointment.meeting_link, '_blank');
    } else if (appointment.room_id) {
      navigate(`/call/${appointment.room_id}`);
    } else {
      toast({
        title: isRTL ? 'رابط غير متوفر' : 'Link Not Available',
        description: isRTL ? 'سيتم إرسال رابط الاجتماع قريباً' : 'Meeting link will be shared soon',
        variant: 'destructive'
      });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm(isRTL ? 'هل تريد إلغاء هذا الموعد؟' : 'Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: isRTL ? 'تم الإلغاء' : 'Appointment Cancelled',
        description: isRTL ? 'تم إلغاء الموعد بنجاح' : 'Your appointment has been cancelled'
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل إلغاء الموعد' : 'Failed to cancel appointment',
        variant: 'destructive'
      });
    }
  };

  const now = new Date();
  const upcomingAppointments = appointments.filter(a =>
    new Date(a.appointment_date) >= now && !['cancelled', 'completed', 'no_show'].includes(a.status)
  );
  const pastAppointments = appointments.filter(a =>
    new Date(a.appointment_date) < now || ['completed', 'no_show'].includes(a.status)
  );
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(isRTL ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString) => {
    const appointmentDate = new Date(dateString);
    const timeDiff = appointmentDate - now;
    return timeDiff > 0 && timeDiff < 30 * 60 * 1000; // Within 30 minutes
  };

  const AppointmentCard = ({ appointment }) => {
    const status = statusConfig[appointment.status] || statusConfig.scheduled;
    const type = typeConfig[appointment.type] || typeConfig.video_call;
    const StatusIcon = status.icon;
    const TypeIcon = type.icon;
    const canJoin = isUpcoming(appointment.appointment_date) ||
      (new Date(appointment.appointment_date) <= now && appointment.status !== 'completed');
    const canCancel = ['scheduled', 'confirmed'].includes(appointment.status) &&
      new Date(appointment.appointment_date) > now;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-3 sm:p-4 border border-border/30 hover:border-primary/30 transition-all"
      >
        <div className="flex flex-col gap-3">
          {/* Top row: Avatar + Info */}
          <div className="flex items-start gap-3">
            {/* Nutritionist Avatar */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {appointment.nutritionist?.profile_picture_url ? (
                <img
                  src={appointment.nutritionist.profile_picture_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title & Nutritionist */}
              <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                {appointment.title || (isRTL ? 'استشارة' : 'Consultation')}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary">
                {isRTL ? 'مع' : 'with'} {appointment.nutritionist?.full_name || (isRTL ? 'أخصائي التغذية' : 'Nutritionist')}
              </p>

              {/* Type & Status Badges - Mobile optimized */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Badge variant="outline" className={`${type.color} border-current/30 text-xs px-1.5 py-0.5`}>
                  <TypeIcon className="w-3 h-3 mr-0.5" />
                  <span className="hidden xs:inline">{isRTL ? type.label_ar : type.label}</span>
                </Badge>
                <Badge className={`${status.color} border text-xs px-1.5 py-0.5`}>
                  <StatusIcon className="w-3 h-3 mr-0.5" />
                  <span className="hidden xs:inline">{isRTL ? status.label_ar : status.label}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Date & Time - Mobile stacked */}
          <div className="flex flex-col xs:flex-row xs:flex-wrap items-start xs:items-center gap-1 xs:gap-3 text-xs sm:text-sm bg-muted/30 rounded-lg p-2">
            <span className="flex items-center gap-1 text-text-secondary">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{formatDate(appointment.appointment_date)}</span>
            </span>
            <span className="flex items-center gap-1 text-text-secondary">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              {formatTime(appointment.appointment_date)}
              {appointment.duration_minutes && ` (${appointment.duration_minutes} ${isRTL ? 'د' : 'm'})`}
            </span>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <p className="text-xs text-text-secondary italic line-clamp-2">
              "{appointment.notes}"
            </p>
          )}

          {/* Action Buttons - Full width on mobile */}
          {(canJoin || canCancel) && (
            <div className="flex gap-2 pt-1">
              {canJoin && appointment.type === 'video_call' && (
                <Button
                  size="sm"
                  className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-xs sm:text-sm h-9"
                  onClick={() => handleJoinCall(appointment)}
                >
                  <Video className="w-4 h-4 mr-1" />
                  {isRTL ? 'انضم للمكالمة' : 'Join Call'}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 text-xs sm:text-sm h-9"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="glass-effect border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="w-5 h-5 text-primary" />
          {isRTL ? 'مواعيدي' : 'My Appointments'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming" className="flex items-center gap-1">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'القادمة' : 'Upcoming'}</span>
              {upcomingAppointments.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {upcomingAppointments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-1">
              <CalendarCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'السابقة' : 'Past'}</span>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-1">
              <CalendarX className="w-4 h-4" />
              <span className="hidden sm:inline">{isRTL ? 'الملغاة' : 'Cancelled'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-text-secondary">
                  {isRTL ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}
                </p>
              </div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-3">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-text-secondary">
                  {isRTL ? 'لا توجد مواعيد سابقة' : 'No past appointments'}
                </p>
              </div>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarX className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-text-secondary">
                  {isRTL ? 'لا توجد مواعيد ملغاة' : 'No cancelled appointments'}
                </p>
              </div>
            ) : (
              cancelledAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
