import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
  Eye,
  Loader2,
  ClipboardList,
  Send,
  RotateCcw,
  ArrowRight,
  User
} from 'lucide-react';
import ClientIntakeForm from './ClientIntakeForm';

const statusConfig = {
  pending: {
    label: 'Pending',
    label_ar: 'قيد الانتظار',
    color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
    icon: Clock
  },
  in_progress: {
    label: 'In Progress',
    label_ar: 'قيد التقدم',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    icon: Edit3
  },
  submitted: {
    label: 'Submitted',
    label_ar: 'تم الإرسال',
    color: 'bg-primary/10 text-primary border-primary/30',
    icon: CheckCircle
  },
  approved: {
    label: 'Approved',
    label_ar: 'تمت الموافقة',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
    icon: CheckCircle
  },
  edit_requested: {
    label: 'Edit Requested',
    label_ar: 'طلب تعديل',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
    icon: RotateCcw
  }
};

export default function MyFormsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const language = i18n.language;
  const isRTL = language === 'ar';

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [editRequestReason, setEditRequestReason] = useState('');
  const [showEditRequestModal, setShowEditRequestModal] = useState(null);
  const [submittingEditRequest, setSubmittingEditRequest] = useState(false);

  useEffect(() => {
    fetchAssignments();

    const subscription = supabase
      .channel('my_form_assignments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'form_assignments',
        filter: `client_id=eq.${user?.id}`
      }, () => {
        fetchAssignments();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('form_assignments')
        .select(`
          *,
          form_template:form_templates(*),
          responses:form_responses(*)
        `)
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch nutritionist names for all assignments
      if (data && data.length > 0) {
        const nutritionistIds = [...new Set(data.map(a => a.nutritionist_id).filter(Boolean))];
        if (nutritionistIds.length > 0) {
          const { data: nutritionists } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .in('id', nutritionistIds);

          // Map nutritionist info to assignments
          const assignmentsWithNutritionist = data.map(assignment => ({
            ...assignment,
            nutritionist: nutritionists?.find(n => n.id === assignment.nutritionist_id) || null
          }));

          setAssignments(assignmentsWithNutritionist);
        } else {
          setAssignments(data);
        }
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormComplete = () => {
    setSelectedForm(null);
    fetchAssignments();
  };

  const handleRequestEdit = async (assignmentId) => {
    if (!editRequestReason.trim()) return;

    setSubmittingEditRequest(true);
    try {
      const { error } = await supabase
        .from('form_edit_requests')
        .insert({
          assignment_id: assignmentId,
          client_id: user.id,
          reason: editRequestReason
        });

      if (error) throw error;

      await supabase
        .from('form_assignments')
        .update({ status: 'edit_requested' })
        .eq('id', assignmentId);

      setShowEditRequestModal(null);
      setEditRequestReason('');
      fetchAssignments();
    } catch (error) {
      console.error('Error requesting edit:', error);
    } finally {
      setSubmittingEditRequest(false);
    }
  };

  const pendingForms = assignments.filter(a => ['pending', 'in_progress', 'edit_requested'].includes(a.status));
  const completedForms = assignments.filter(a => ['submitted', 'approved'].includes(a.status));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedForm) {
    return (
      <ClientIntakeForm
        assignmentId={selectedForm.id}
        formTemplate={selectedForm.form_template}
        existingResponses={selectedForm.responses?.[0]?.responses}
        onComplete={handleFormComplete}
        onClose={() => setSelectedForm(null)}
        readOnly={selectedForm.status === 'submitted' || selectedForm.status === 'approved'}
      />
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-primary/10">
            <ClipboardList className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isRTL ? 'النماذج الخاصة بي' : 'My Forms'}
            </h1>
            <p className="text-text-secondary mt-1">
              {isRTL
                ? 'أكمل هذه النماذج لمساعدة أخصائي التغذية في فهم احتياجاتك الصحية'
                : 'Complete these forms to help your nutritionist understand your health needs'}
            </p>
          </div>
        </div>
      </div>

      {/* Pending Forms Section */}
      {pendingForms.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-foreground">
              {isRTL ? 'نماذج تحتاج إلى إكمال' : 'Forms Requiring Completion'}
            </h2>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              {pendingForms.length}
            </Badge>
          </div>

          <div className="grid gap-4">
            {pendingForms.map((assignment) => {
              const template = assignment.form_template;
              const status = statusConfig[assignment.status];
              const StatusIcon = status.icon;
              const formName = isRTL ? (template.name_ar || template.name) : template.name;
              const formDesc = isRTL ? (template.description_ar || template.description) : template.description;

              return (
                <div
                  key={assignment.id}
                  className="glass-effect rounded-2xl p-4 sm:p-5 border border-border/30 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedForm(assignment)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-foreground">{formName}</h3>
                          <Badge className={`${status.color} border text-xs`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {isRTL ? status.label_ar : status.label}
                          </Badge>
                          {assignment.is_required && (
                            <Badge variant="destructive" className="text-xs">
                              {isRTL ? 'مطلوب' : 'Required'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary mb-2">{formDesc}</p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                          {assignment.nutritionist && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {isRTL ? 'من:' : 'From:'} {assignment.nutritionist.full_name}
                            </span>
                          )}
                          {assignment.due_date && (
                            <span>
                              {isRTL ? 'موعد التسليم:' : 'Due:'}{' '}
                              {new Date(assignment.due_date).toLocaleDateString(language)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground shadow-lg min-h-[44px]"
                    >
                      {assignment.status === 'in_progress'
                        ? (isRTL ? 'متابعة' : 'Continue')
                        : assignment.status === 'edit_requested'
                          ? (isRTL ? 'تعديل' : 'Edit')
                          : (isRTL ? 'ابدأ' : 'Start')}
                      <ArrowRight className={`w-4 h-4 ml-2 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Forms Section */}
      {completedForms.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {isRTL ? 'النماذج المكتملة' : 'Completed Forms'}
            </h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {completedForms.length}
            </Badge>
          </div>

          <div className="grid gap-3">
            {completedForms.map((assignment) => {
              const template = assignment.form_template;
              const status = statusConfig[assignment.status];
              const StatusIcon = status.icon;
              const formName = isRTL ? (template.name_ar || template.name) : template.name;

              return (
                <div key={assignment.id} className="glass-effect rounded-xl p-4 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{formName}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                          {assignment.nutritionist && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {isRTL ? 'من:' : 'From:'} {assignment.nutritionist.full_name}
                            </span>
                          )}
                          {assignment.nutritionist && <span>•</span>}
                          <span>
                            {isRTL ? 'تم الإرسال:' : 'Submitted:'}{' '}
                            {new Date(assignment.submitted_at).toLocaleDateString(language)}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${status.color} border text-xs`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {isRTL ? status.label_ar : status.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedForm(assignment)}
                        className="min-h-[40px]"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {isRTL ? 'عرض' : 'View'}
                      </Button>
                      {assignment.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEditRequestModal(assignment.id);
                          }}
                          className="min-h-[40px]"
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          {isRTL ? 'طلب تعديل' : 'Request Edit'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Forms Message */}
      {assignments.length === 0 && (
        <div className="glass-effect rounded-2xl p-8 sm:p-12 text-center border border-border/30">
          <div className="p-4 rounded-full bg-muted inline-block mb-4">
            <ClipboardList className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isRTL ? 'لا توجد نماذج حالياً' : 'No Forms Available'}
          </h3>
          <p className="text-text-secondary">
            {isRTL
              ? 'سيظهر هنا أي نماذج يرسلها لك أخصائي التغذية'
              : 'Any forms sent to you by your nutritionist will appear here'}
          </p>
        </div>
      )}

      {/* Edit Request Modal */}
      <Dialog open={!!showEditRequestModal} onOpenChange={() => setShowEditRequestModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              {isRTL ? 'طلب تعديل النموذج' : 'Request Form Edit'}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'يرجى شرح سبب حاجتك لتعديل هذا النموذج'
                : 'Please explain why you need to edit this form'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editRequestReason}
            onChange={(e) => setEditRequestReason(e.target.value)}
            placeholder={isRTL ? 'سبب طلب التعديل...' : 'Reason for edit request...'}
            className="min-h-[120px] bg-card/50"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditRequestModal(null);
                setEditRequestReason('');
              }}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => handleRequestEdit(showEditRequestModal)}
              disabled={!editRequestReason.trim() || submittingEditRequest}
              className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground"
            >
              {submittingEditRequest ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              {isRTL ? 'إرسال الطلب' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
