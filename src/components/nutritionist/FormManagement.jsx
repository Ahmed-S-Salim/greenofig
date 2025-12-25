import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  Loader2,
  ClipboardList,
  RotateCcw,
  CheckSquare,
  XCircle,
  Trash2,
  RefreshCw,
  Bell,
  CalendarClock,
  Copy,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  History,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  GripVertical,
  Link2,
  ExternalLink,
  Download
} from 'lucide-react';
import ClientIntakeForm from '../forms/ClientIntakeForm';
import ExternalFormsManager from './ExternalFormsManager';

const statusConfig = {
  pending: { label: 'Pending', label_ar: 'قيد الانتظار', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: Clock },
  in_progress: { label: 'In Progress', label_ar: 'قيد التقدم', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: Clock },
  submitted: { label: 'Submitted', label_ar: 'تم الإرسال', color: 'bg-primary/10 text-primary border-primary/30', icon: CheckCircle },
  approved: { label: 'Approved', label_ar: 'تمت الموافقة', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', icon: CheckCircle },
  edit_requested: { label: 'Edit Requested', label_ar: 'طلب تعديل', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: RotateCcw }
};

const questionTypes = [
  { value: 'text', label: 'Text', label_ar: 'نص' },
  { value: 'textarea', label: 'Long Text', label_ar: 'نص طويل' },
  { value: 'yes_no', label: 'Yes/No', label_ar: 'نعم/لا' },
  { value: 'select', label: 'Dropdown', label_ar: 'قائمة منسدلة' },
  { value: 'multiselect', label: 'Multi Select', label_ar: 'تحديد متعدد' },
  { value: 'date', label: 'Date', label_ar: 'تاريخ' },
  { value: 'number', label: 'Number', label_ar: 'رقم' },
  { value: 'email', label: 'Email', label_ar: 'بريد إلكتروني' },
  { value: 'phone', label: 'Phone', label_ar: 'هاتف' },
  { value: 'signature', label: 'Signature', label_ar: 'توقيع' },
];

export default function FormManagement() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { sendPushToUser } = usePushNotifications();
  const language = i18n.language;
  const isRTL = language === 'ar';

  const [activeTab, setActiveTab] = useState('sent');
  const [templates, setTemplates] = useState([]);
  const [systemTemplates, setSystemTemplates] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Accordion state - track which clients are expanded
  const [expandedClients, setExpandedClients] = useState({});

  // Send form modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedClients, setSelectedClients] = useState([]);
  const [sendingForm, setSendingForm] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [isResend, setIsResend] = useState(false);

  // View response modal
  const [viewingResponse, setViewingResponse] = useState(null);

  // Preview modal
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewTemplate, setPdfPreviewTemplate] = useState(null);

  // Adjust due date modal
  const [adjustingDueDate, setAdjustingDueDate] = useState(null);
  const [newDueDate, setNewDueDate] = useState('');

  // Send reminder modal
  const [sendingReminder, setSendingReminder] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');

  // Form history modal
  const [viewingHistory, setViewingHistory] = useState(null);
  const [formHistory, setFormHistory] = useState([]);

  // Create/Edit Template Modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    form_type: 'custom',
    sections: []
  });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Language selection for system templates (per template)
  const [templateLanguages, setTemplateLanguages] = useState({});

  // Get selected language for a template (default to current app language)
  const getTemplateLanguage = (templateId) => templateLanguages[templateId] || (isRTL ? 'ar' : 'en');

  // Toggle language for a specific template
  const toggleTemplateLanguage = (templateId) => {
    setTemplateLanguages(prev => ({
      ...prev,
      [templateId]: prev[templateId] === 'ar' ? 'en' : 'ar'
    }));
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }

    const subscription = supabase
      .channel('nutritionist_forms_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'form_assignments' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'form_responses' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'form_edit_requests' }, fetchData)
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      // Fetch user's custom templates (exclude system and default templates)
      const { data: templatesData } = await supabase
        .from('form_templates')
        .select('*')
        .eq('is_active', true)
        .or(`is_system_template.is.null,is_system_template.eq.false`)
        .or(`is_default.is.null,is_default.eq.false`)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      // Fetch GreenoFig system templates
      const { data: systemTemplatesData } = await supabase
        .from('form_templates')
        .select('*')
        .eq('is_system_template', true)
        .eq('is_active', true)
        .order('name');

      setSystemTemplates(systemTemplatesData || []);

      const { data: assignmentsData } = await supabase
        .from('form_assignments')
        .select(`*, form_template:form_templates(*), responses:form_responses(*)`)
        .order('created_at', { ascending: false });

      if (assignmentsData && assignmentsData.length > 0) {
        const clientIds = [...new Set(assignmentsData.map(a => a.client_id))];
        const { data: clientsData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, profile_picture_url')
          .in('id', clientIds);

        const assignmentsWithClients = assignmentsData.map(a => ({
          ...a,
          client: clientsData?.find(c => c.id === a.client_id) || null
        }));

        setAssignments(assignmentsWithClients);
      } else {
        setAssignments([]);
      }

      const { data: allClientsData } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, profile_picture_url')
        .eq('role', 'user')
        .order('full_name');

      const { data: editRequestsData } = await supabase
        .from('form_edit_requests')
        .select(`*, assignment:form_assignments(*, form_template:form_templates(*))`)
        .eq('status', 'pending');

      if (editRequestsData && editRequestsData.length > 0) {
        const clientIds = [...new Set(editRequestsData.map(r => r.client_id))];
        const { data: reqClientsData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email')
          .in('id', clientIds);

        const editRequestsWithClients = editRequestsData.map(r => ({
          ...r,
          client: reqClientsData?.find(c => c.id === r.client_id) || null
        }));

        setEditRequests(editRequestsWithClients);
      } else {
        setEditRequests([]);
      }

      setTemplates(templatesData || []);
      setClients(allClientsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF HTML for form template - Optimized for clean printing and PDF
  const generateFormPdfHtml = (template, forPrint = false, formLang = null) => {
    const primaryColor = '#6BD55C';
    const sections = template.sections || [];
    const useArabic = formLang ? formLang === 'ar' : isRTL;

    const renderQuestion = (q) => {
      const label = useArabic ? (q.label_ar || q.label) : q.label;
      const required = q.required ? '<span style="color:#dc2626">*</span>' : '';

      if (q.type === 'yes_no') {
        return `<tr>
          <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:10px">${label} ${required}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;width:50px;text-align:center">
            <span style="display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:12px;height:12px;border:1.5px solid #374151;border-radius:2px"></span><span style="font-size:9px">${useArabic?'نعم':'Yes'}</span></span>
          </td>
          <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;width:50px;text-align:center">
            <span style="display:inline-flex;align-items:center;gap:4px"><span style="display:inline-block;width:12px;height:12px;border:1.5px solid #374151;border-radius:2px"></span><span style="font-size:9px">${useArabic?'لا':'No'}</span></span>
          </td>
        </tr>`;
      }

      if ((q.type === 'multiselect' || q.type === 'checkbox') && q.options) {
        const opts = useArabic && q.options_ar ? q.options_ar : q.options;
        const options = opts.map(opt => `<span style="display:inline-flex;align-items:center;gap:5px;margin:2px 12px 2px 0;font-size:9px"><span style="display:inline-block;width:11px;height:11px;min-width:11px;border:1.5px solid #374151;border-radius:2px;flex-shrink:0"></span><span>${typeof opt === 'object' ? (useArabic ? (opt.label_ar || opt.label) : opt.label) : opt}</span></span>`).join('');
        return `<tr><td colspan="3" style="padding:6px 10px;border-bottom:1px solid #e5e7eb">
          <div style="font-size:10px;margin-bottom:4px;font-weight:500">${label} ${required}</div>
          <div style="display:flex;flex-wrap:wrap">${options}</div>
        </td></tr>`;
      }

      if (q.type === 'select' && q.options) {
        const opts = useArabic && q.options_ar ? q.options_ar : q.options;
        const options = opts.map(opt => `<span style="display:inline-flex;align-items:center;gap:5px;margin:2px 12px 2px 0;font-size:9px"><span style="display:inline-block;width:11px;height:11px;min-width:11px;border:1.5px solid #374151;border-radius:50%;flex-shrink:0"></span><span>${typeof opt === 'object' ? (useArabic ? (opt.label_ar || opt.label) : opt.label) : opt}</span></span>`).join('');
        return `<tr><td colspan="3" style="padding:6px 10px;border-bottom:1px solid #e5e7eb">
          <div style="font-size:10px;margin-bottom:4px;font-weight:500">${label} ${required}</div>
          <div style="display:flex;flex-wrap:wrap">${options}</div>
        </td></tr>`;
      }

      if (q.type === 'textarea') {
        return `<tr><td colspan="3" style="padding:6px 10px;border-bottom:1px solid #e5e7eb">
          <div style="font-size:10px;margin-bottom:4px;font-weight:500">${label} ${required}</div>
          <div style="border-bottom:1px solid #9ca3af;height:14px;margin-bottom:3px"></div>
          <div style="border-bottom:1px solid #9ca3af;height:14px"></div>
        </td></tr>`;
      }

      if (q.type === 'signature') {
        return `<tr><td colspan="3" style="padding:6px 10px;border-bottom:1px solid #e5e7eb">
          <div style="font-size:10px;margin-bottom:4px;font-weight:500">${label} ${required}</div>
          <div style="border:1px solid #d1d5db;height:35px;border-radius:3px;background:#f9fafb"></div>
        </td></tr>`;
      }

      return `<tr><td colspan="3" style="padding:6px 10px;border-bottom:1px solid #e5e7eb">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:10px;white-space:nowrap">${label} ${required}</span>
          <span style="flex:1;border-bottom:1px solid #9ca3af;height:1px;min-width:40px"></span>
        </div>
      </td></tr>`;
    };

    const sectionsHtml = sections.map(section => {
      const sectionTitle = useArabic ? (section.title_ar || section.title) : section.title;
      const questionsHtml = (section.questions || []).map(q => renderQuestion(q)).join('');
      return `<div style="margin-bottom:8px;page-break-inside:avoid;break-inside:avoid">
        <div style="background:linear-gradient(135deg,${primaryColor},#4ade80);color:white;padding:5px 8px;font-weight:600;font-size:11px;border-radius:3px 3px 0 0">${sectionTitle}</div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-top:none"><tbody>${questionsHtml}</tbody></table>
      </div>`;
    }).join('');

    return `<!DOCTYPE html><html dir="${useArabic?'rtl':'ltr'}"><head><meta charset="UTF-8"><title> </title>
<style>
@page{size:A4;margin:8mm}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;margin:0;padding:0}*{page-break-inside:avoid;break-inside:avoid}}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:8px;background:${forPrint?'white':'#f3f4f6'};color:#1f2937;direction:${useArabic?'rtl':'ltr'};font-size:10px}
.container{width:100%;max-width:190mm;margin:0 auto;background:white;padding:8mm 10mm;box-sizing:border-box}
</style></head><body><div class="container">
<div style="page-break-inside:avoid;break-inside:avoid">
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid ${primaryColor};padding-bottom:10px;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:8px">
      <img style="width:35px;height:35px;object-fit:contain" src="https://greenofig.com/logo.png" alt="GreenoFig" onerror="this.style.display='none'"/>
      <span style="font-size:18px;font-weight:700;color:${primaryColor}">GreenoFig</span>
    </div>
    <div style="font-size:14px;font-weight:700;color:#1f2937">${useArabic?(template.name_ar||template.name):template.name}</div>
  </div>
  <div style="display:flex;gap:20px;margin-bottom:12px;flex-wrap:wrap;padding:6px 0">
    <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:150px">
      <span style="font-weight:700;font-size:10px;white-space:nowrap">${useArabic?'الاسم:':'NAME:'}</span>
      <span style="flex:1;border-bottom:1.5px solid #374151;height:1px;min-width:80px"></span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:150px">
      <span style="font-weight:700;font-size:10px;white-space:nowrap">${useArabic?'التاريخ:':'DATE:'}</span>
      <span style="flex:1;border-bottom:1.5px solid #374151;height:1px;min-width:80px"></span>
    </div>
  </div>
</div>
${sectionsHtml}
<div style="page-break-inside:avoid;break-inside:avoid;margin-top:12px">
  <div style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;margin-bottom:10px">
    <div style="font-weight:700;margin-bottom:6px;color:#374151;font-size:10px">${useArabic?'ملاحظات:':'NOTES:'}</div>
    <div><div style="border-bottom:1px solid #d1d5db;height:16px"></div><div style="border-bottom:1px solid #d1d5db;height:16px"></div></div>
  </div>
  <div style="padding-top:10px;border-top:1.5px solid #e5e7eb">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:10px">
      <div style="text-align:center"><div style="border-bottom:1.5px solid #374151;height:40px;margin-bottom:6px"></div><div style="font-size:10px;font-weight:600;color:#374151">${useArabic?'التوقيع':'SIGNATURE'}</div></div>
      <div style="text-align:center"><div style="border-bottom:1.5px solid #374151;height:40px;margin-bottom:6px"></div><div style="font-size:10px;font-weight:600;color:#374151">${useArabic?'توقيع الشاهد':'WITNESS'}</div></div>
    </div>
  </div>
</div>
</div></body></html>`;
  };

  // Open PDF preview
  const openPdfPreview = (template) => {
    setPdfPreviewTemplate(template);
    setShowPdfPreview(true);
  };

  // Download PDF - Same as print, select "Save as PDF" in print dialog
  const downloadPdf = (template) => {
    // Just use the print function - user selects "Save as PDF" as printer
    printPdf(template);
  };

  // Print PDF (opens print dialog using iframe to avoid about:blank)
  const printPdf = (template) => {
    const templateLang = template._lang || getTemplateLanguage(template.id);
    const html = generateFormPdfHtml(template, true, templateLang);

    // Create hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    };
  };

  // Generate link code for external form links
  const generateLinkCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  // Create external shareable link for a template with language preference
  const createExternalLink = async (template, formLang = null) => {
    try {
      const linkCode = generateLinkCode();
      // Use specified language or default to template's selected language
      const selectedLang = formLang || getTemplateLanguage(template.id);

      const { data, error } = await supabase.from('public_form_links').insert({
        nutritionist_id: user.id,
        form_template_id: template.id,
        link_code: linkCode,
        title: template.name,
        title_ar: template.name_ar,
        is_active: true,
        form_language: selectedLang // Store the selected language
      }).select().single();

      if (error) throw error;

      // Use /form/ route to show the specific template chosen
      const link = `${window.location.origin}/form/${linkCode}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(link);

      toast({
        title: isRTL ? 'تم إنشاء الرابط!' : 'Link Created!',
        description: isRTL
          ? `تم نسخ الرابط إلى الحافظة (${selectedLang === 'ar' ? 'عربي' : 'إنجليزي'})`
          : `Link copied to clipboard (${selectedLang === 'ar' ? 'Arabic' : 'English'})`,
      });

      return link;
    } catch (error) {
      console.error('Error creating link:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  // Toggle client accordion
  const toggleClient = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // Expand/collapse all
  const expandAll = () => {
    const allExpanded = {};
    groupedByClient.forEach(g => {
      allExpanded[g.client.id] = true;
    });
    setExpandedClients(allExpanded);
  };

  const collapseAll = () => {
    setExpandedClients({});
  };

  const handleSendForm = async () => {
    if (!selectedTemplate || selectedClients.length === 0) return;

    setSendingForm(true);
    try {
      // Get the selected language for this template
      const selectedLang = getTemplateLanguage(selectedTemplate.id);
      const useArabicNotification = selectedLang === 'ar';

      const assignmentsData = selectedClients.map(clientId => ({
        form_template_id: selectedTemplate.id,
        client_id: clientId,
        nutritionist_id: user.id,
        is_required: true,
        due_date: dueDate || null,
        status: 'pending',
        form_language: selectedLang // Store the selected language for the form
      }));

      const { error: assignmentError } = await supabase.from('form_assignments').insert(assignmentsData);
      if (assignmentError) throw assignmentError;

      for (const clientId of selectedClients) {
        await supabase.from('notifications').insert({
          user_id: clientId,
          type: 'form_assigned',
          title: useArabicNotification ? 'نموذج جديد' : 'New Form Assigned',
          message: useArabicNotification
            ? `تم إرسال نموذج جديد لك: ${selectedTemplate.name_ar || selectedTemplate.name}`
            : `You have a new form to complete: ${selectedTemplate.name}`,
          is_read: false
        });

        try {
          await sendPushToUser(clientId, useArabicNotification ? 'نموذج جديد' : 'New Form Assigned',
            useArabicNotification ? `تم إرسال نموذج جديد لك: ${selectedTemplate.name_ar || selectedTemplate.name}` : `You have a new form to complete: ${selectedTemplate.name}`,
            { tag: 'form-assigned', data: { type: 'form_assigned', url: '/app/forms' } });
        } catch (e) { console.error('Push failed:', e); }
      }

      toast({
        title: isRTL ? 'تم الإرسال بنجاح' : 'Form Sent Successfully',
        description: isRTL
          ? `تم إرسال النموذج إلى ${selectedClients.length} عميل (${selectedLang === 'ar' ? 'عربي' : 'إنجليزي'})`
          : `Form sent to ${selectedClients.length} client(s) (${selectedLang === 'ar' ? 'Arabic' : 'English'})`
      });

      resetSendModal();
      fetchData();
    } catch (error) {
      console.error('Error sending form:', error);
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'فشل إرسال النموذج' : 'Failed to send form', variant: 'destructive' });
    } finally {
      setSendingForm(false);
    }
  };

  const resetSendModal = () => {
    setShowSendModal(false);
    setSelectedTemplate(null);
    setSelectedClients([]);
    setDueDate('');
    setIsResend(false);
  };

  const handleResendForm = (assignment) => {
    setSelectedTemplate(assignment.form_template);
    setSelectedClients([assignment.client_id]);
    setIsResend(true);
    setShowSendModal(true);
  };

  const handleAdjustDueDate = async () => {
    if (!adjustingDueDate || !newDueDate) return;

    try {
      await supabase.from('form_assignments').update({ due_date: newDueDate, updated_at: new Date().toISOString() }).eq('id', adjustingDueDate.id);
      await supabase.from('notifications').insert({
        user_id: adjustingDueDate.client_id, type: 'form_assigned',
        title: isRTL ? 'تم تحديث موعد النموذج' : 'Form Due Date Updated',
        message: isRTL ? `تم تحديث موعد استحقاق النموذج: ${adjustingDueDate.form_template?.name_ar || adjustingDueDate.form_template?.name}` : `Due date updated for: ${adjustingDueDate.form_template?.name}`,
        is_read: false
      });
      toast({ title: isRTL ? 'تم التحديث' : 'Due Date Updated', description: isRTL ? 'تم تحديث موعد الاستحقاق بنجاح' : 'Due date has been updated' });
      setAdjustingDueDate(null);
      setNewDueDate('');
      fetchData();
    } catch (error) { console.error('Error adjusting due date:', error); }
  };

  const handleSendReminder = async () => {
    if (!sendingReminder) return;

    try {
      const message = reminderMessage.trim() || (isRTL ? `تذكير: يرجى إكمال النموذج "${sendingReminder.form_template?.name_ar || sendingReminder.form_template?.name}"` : `Reminder: Please complete the form "${sendingReminder.form_template?.name}"`);
      await supabase.from('notifications').insert({ user_id: sendingReminder.client_id, type: 'form_reminder', title: isRTL ? 'تذكير بالنموذج' : 'Form Reminder', message, is_read: false });
      try { await sendPushToUser(sendingReminder.client_id, isRTL ? 'تذكير بالنموذج' : 'Form Reminder', message, { tag: 'form-reminder', data: { type: 'form_reminder', url: '/app/forms' } }); } catch (e) { console.error('Push failed:', e); }
      toast({ title: isRTL ? 'تم الإرسال' : 'Reminder Sent', description: isRTL ? 'تم إرسال التذكير بنجاح' : 'Reminder has been sent' });
      setSendingReminder(null);
      setReminderMessage('');
    } catch (error) { console.error('Error sending reminder:', error); }
  };

  const handleApproveEditRequest = async (requestId, approve) => {
    try {
      const request = editRequests.find(r => r.id === requestId);
      if (!request) return;
      await supabase.from('form_edit_requests').update({ status: approve ? 'approved' : 'denied', responded_by: user.id, responded_at: new Date().toISOString() }).eq('id', requestId);
      await supabase.from('form_assignments').update({ status: approve ? 'in_progress' : 'submitted' }).eq('id', request.assignment_id);
      await supabase.from('notifications').insert({ user_id: request.client_id, type: 'edit_request_response', title: approve ? (isRTL ? 'تم قبول طلب التعديل' : 'Edit Request Approved') : (isRTL ? 'تم رفض طلب التعديل' : 'Edit Request Denied'), message: approve ? (isRTL ? 'يمكنك الآن تعديل النموذج' : 'You can now edit your form') : (isRTL ? 'لم يتم الموافقة على طلب التعديل' : 'Your edit request was not approved') });
      fetchData();
    } catch (error) { console.error('Error handling edit request:', error); }
  };

  const handleApproveForm = async (assignmentId) => {
    try {
      await supabase.from('form_assignments').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', assignmentId);
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        await supabase.from('notifications').insert({ user_id: assignment.client_id, type: 'form_approved', title: isRTL ? 'تمت الموافقة على النموذج' : 'Form Approved', message: isRTL ? 'تمت مراجعة النموذج الخاص بك والموافقة عليه' : 'Your form has been reviewed and approved' });
      }
      fetchData();
    } catch (error) { console.error('Error approving form:', error); }
  };

  const handleDeleteForm = async (assignmentId) => {
    try {
      const assignment = assignments.find(a => a.id === assignmentId);
      const clientId = assignment?.client_id;
      const formName = assignment?.form_template?.name || 'Form';
      const formNameAr = assignment?.form_template?.name_ar || formName;

      // Delete all related data from database completely
      // First delete responses
      const { error: respError } = await supabase
        .from('form_responses')
        .delete()
        .eq('assignment_id', assignmentId);
      if (respError) console.error('Error deleting responses:', respError);

      // Delete edit requests
      const { error: editError } = await supabase
        .from('form_edit_requests')
        .delete()
        .eq('assignment_id', assignmentId);
      if (editError) console.error('Error deleting edit requests:', editError);

      // Delete the main assignment
      const { error: assignError } = await supabase
        .from('form_assignments')
        .delete()
        .eq('id', assignmentId);

      if (assignError) {
        console.error('Error deleting assignment:', assignError);
        throw assignError;
      }

      // Remove from local state immediately for instant UI update
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));

      // Notify the client that the form has been removed (in-app notification)
      if (clientId) {
        await supabase.from('notifications').insert({
          user_id: clientId,
          type: 'form_removed',
          title: isRTL ? 'تم حذف النموذج' : 'Form Removed',
          message: isRTL
            ? `تم حذف النموذج: ${formNameAr}`
            : `The form "${formName}" has been removed by your nutritionist`,
          is_read: false
        });

        // Send push notification to client
        try {
          await sendPushToUser(clientId, {
            title: isRTL ? 'تم حذف النموذج' : 'Form Removed',
            body: isRTL
              ? `تم حذف النموذج: ${formNameAr}`
              : `The form "${formName}" has been removed by your nutritionist`,
            data: { type: 'form_removed' }
          });
        } catch (pushError) {
          console.error('Push notification error:', pushError);
        }
      }

      toast({
        title: isRTL ? 'تم الحذف' : 'Form Deleted',
        description: isRTL ? 'تم حذف النموذج نهائياً' : 'Form has been permanently deleted'
      });

      // Refresh data from server to ensure sync
      fetchData();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل حذف النموذج' : 'Failed to delete form',
        variant: 'destructive'
      });
      // Refresh to get accurate state
      fetchData();
    }
  };

  const handleViewHistory = async (clientId) => {
    try {
      const { data } = await supabase.from('form_assignments').select(`*, form_template:form_templates(*), responses:form_responses(*)`).eq('client_id', clientId).order('created_at', { ascending: false });
      setFormHistory(data || []);
      setViewingHistory(clients.find(c => c.id === clientId) || { id: clientId });
    } catch (error) { console.error('Error fetching history:', error); }
  };

  // Template CRUD
  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ name: '', name_ar: '', description: '', description_ar: '', form_type: 'custom', sections: [{ title: '', title_ar: '', questions: [] }] });
    setShowTemplateModal(true);
  };

  const openEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name || '',
      name_ar: template.name_ar || '',
      description: template.description || '',
      description_ar: template.description_ar || '',
      form_type: template.form_type || 'custom',
      sections: template.sections || [{ title: '', title_ar: '', questions: [] }]
    });
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'يرجى إدخال اسم النموذج' : 'Please enter form name', variant: 'destructive' });
      return;
    }

    setSavingTemplate(true);
    try {
      const templateData = {
        name: templateForm.name,
        name_ar: templateForm.name_ar || null,
        description: templateForm.description || null,
        description_ar: templateForm.description_ar || null,
        form_type: templateForm.form_type,
        sections: templateForm.sections,
        is_default: false,
        is_active: true,
        created_by: user.id
      };

      if (editingTemplate) {
        await supabase.from('form_templates').update({ ...templateData, updated_at: new Date().toISOString() }).eq('id', editingTemplate.id);
        toast({ title: isRTL ? 'تم التحديث' : 'Template Updated', description: isRTL ? 'تم تحديث قالب النموذج بنجاح' : 'Form template has been updated' });
      } else {
        await supabase.from('form_templates').insert(templateData);
        toast({ title: isRTL ? 'تم الإنشاء' : 'Template Created', description: isRTL ? 'تم إنشاء قالب النموذج بنجاح' : 'Form template has been created' });
      }

      setShowTemplateModal(false);
      setEditingTemplate(null);
      fetchData();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ title: isRTL ? 'خطأ' : 'Error', description: isRTL ? 'فشل حفظ القالب' : 'Failed to save template', variant: 'destructive' });
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm(isRTL ? 'هل تريد حذف هذا القالب نهائياً؟' : 'Permanently delete this template?')) return;
    try {
      // Actually delete the template from database (not just soft delete)
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId)
        .eq('is_system_template', false); // Only allow deleting non-system templates

      if (error) {
        console.error('Delete error:', error);
        // If delete fails due to RLS, try soft delete as fallback
        await supabase.from('form_templates').update({ is_active: false }).eq('id', templateId);
      }

      // Remove from local state immediately for instant UI update
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setSystemTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({ title: isRTL ? 'تم الحذف' : 'Template Deleted', description: isRTL ? 'تم حذف القالب نهائياً' : 'Template has been permanently deleted' });

      // Refresh data from server
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل حذف القالب' : 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSystemTemplate = async (templateId) => {
    if (!window.confirm(isRTL ? 'هل تريد حذف هذا القالب نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Permanently delete this template? This action cannot be undone.')) return;
    try {
      // Delete system template from database
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      // Remove from local state immediately for instant UI update
      setSystemTemplates(prev => prev.filter(t => t.id !== templateId));

      toast({ title: isRTL ? 'تم الحذف' : 'Template Deleted', description: isRTL ? 'تم حذف القالب نهائياً' : 'Template has been permanently deleted' });

      // Refresh data from server
      fetchData();
    } catch (error) {
      console.error('Error deleting system template:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'فشل حذف القالب' : 'Failed to delete template',
        variant: 'destructive'
      });
    }
  };

  // Section management
  const addSection = () => {
    setTemplateForm(prev => ({ ...prev, sections: [...prev.sections, { title: '', title_ar: '', questions: [] }] }));
  };

  const removeSection = (idx) => {
    setTemplateForm(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== idx) }));
  };

  const updateSection = (idx, field, value) => {
    setTemplateForm(prev => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], [field]: value };
      return { ...prev, sections };
    });
  };

  // Question management
  const addQuestion = (sectionIdx) => {
    setTemplateForm(prev => {
      const sections = [...prev.sections];
      sections[sectionIdx].questions = [...(sections[sectionIdx].questions || []), { id: `q_${Date.now()}`, label: '', label_ar: '', type: 'text', required: false, options: [] }];
      return { ...prev, sections };
    });
  };

  const removeQuestion = (sectionIdx, questionIdx) => {
    setTemplateForm(prev => {
      const sections = [...prev.sections];
      sections[sectionIdx].questions = sections[sectionIdx].questions.filter((_, i) => i !== questionIdx);
      return { ...prev, sections };
    });
  };

  const updateQuestion = (sectionIdx, questionIdx, field, value) => {
    setTemplateForm(prev => {
      const sections = [...prev.sections];
      sections[sectionIdx].questions[questionIdx] = { ...sections[sectionIdx].questions[questionIdx], [field]: value };
      return { ...prev, sections };
    });
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.form_template?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group assignments by client
  const clientGroups = {};
  filteredAssignments.forEach(a => {
    const clientId = a.client?.id || a.client_id;
    if (!clientId) return;
    if (!clientGroups[clientId]) {
      clientGroups[clientId] = { client: a.client || { id: clientId, full_name: 'Unknown', email: '' }, forms: [] };
    }
    clientGroups[clientId].forms.push(a);
  });
  const groupedByClient = Object.values(clientGroups);

  // Stats
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    approved: assignments.filter(a => a.status === 'approved').length,
    editRequests: editRequests.length,
    completionRate: assignments.length > 0 ? Math.round(((assignments.filter(a => ['submitted', 'approved'].includes(a.status)).length) / assignments.length) * 100) : 0
  };

  const overdueAssignments = assignments.filter(a => a.due_date && new Date(a.due_date) < new Date() && !['submitted', 'approved'].includes(a.status));

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (viewingResponse) {
    return (
      <div className="p-4">
        <Button variant="outline" onClick={() => setViewingResponse(null)} className="mb-4">{isRTL ? '← العودة' : '← Back'}</Button>
        <ClientIntakeForm assignmentId={viewingResponse.id} formTemplate={viewingResponse.form_template} existingResponses={viewingResponse.responses?.[0]?.responses} readOnly={true} onClose={() => setViewingResponse(null)} />
      </div>
    );
  }

  return (
    <div className={`p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10"><ClipboardList className="w-7 h-7 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isRTL ? 'إدارة النماذج' : 'Form Management'}</h1>
            <p className="text-text-secondary mt-1">{isRTL ? 'إرسال وتتبع نماذج استقبال العملاء' : 'Send and track client intake forms'}</p>
          </div>
        </div>
        <Button onClick={() => { setIsResend(false); setShowSendModal(true); }} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />{isRTL ? 'إرسال نموذج جديد' : 'Send New Form'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { icon: FileText, value: stats.total, label: isRTL ? 'إجمالي' : 'Total', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-600' },
          { icon: Clock, value: stats.pending, label: isRTL ? 'انتظار' : 'Pending', bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-600' },
          { icon: RefreshCw, value: stats.inProgress, label: isRTL ? 'قيد التقدم' : 'In Progress', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-600' },
          { icon: CheckCircle, value: stats.submitted, label: isRTL ? 'مُرسل' : 'Submitted', bgColor: 'bg-primary/10', iconColor: 'text-primary' },
          { icon: CheckSquare, value: stats.approved, label: isRTL ? 'موافق' : 'Approved', bgColor: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
          { icon: TrendingUp, value: `${stats.completionRate}%`, label: isRTL ? 'الإكمال' : 'Complete', bgColor: 'bg-purple-500/10', iconColor: 'text-purple-600' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-effect rounded-xl p-3 border border-border/30">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 ${stat.bgColor} rounded-lg`}><stat.icon className={`w-4 h-4 ${stat.iconColor}`} /></div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-text-secondary">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue Alert */}
      {overdueAssignments.length > 0 && (
        <div className="glass-effect rounded-xl mb-4 border border-red-500/30 bg-red-500/5 p-3">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">{isRTL ? `${overdueAssignments.length} نموذج متأخر` : `${overdueAssignments.length} Overdue Form(s)`}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overdueAssignments.slice(0, 3).map(a => (
              <Badge key={a.id} variant="outline" className="text-red-600 border-red-500/30 text-xs">{a.client?.full_name} - {a.form_template?.name}</Badge>
            ))}
            {overdueAssignments.length > 3 && <Badge variant="outline" className="text-red-600 border-red-500/30 text-xs">+{overdueAssignments.length - 3} {isRTL ? 'أخرى' : 'more'}</Badge>}
          </div>
        </div>
      )}

      {/* Edit Requests Alert */}
      {editRequests.length > 0 && (
        <div className="glass-effect rounded-xl mb-4 border border-orange-500/30 bg-orange-500/5">
          <div className="p-3 border-b border-orange-500/20">
            <h3 className="font-semibold flex items-center gap-2 text-orange-600 text-sm"><AlertCircle className="w-4 h-4" />{isRTL ? 'طلبات تعديل تحتاج مراجعة' : 'Edit Requests Pending'} ({editRequests.length})</h3>
          </div>
          <div className="p-3 space-y-2">
            {editRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between glass-effect p-2 rounded-lg border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{request.client?.full_name}</p>
                  <p className="text-xs text-text-secondary truncate">{isRTL ? (request.assignment?.form_template?.name_ar || request.assignment?.form_template?.name) : request.assignment?.form_template?.name}</p>
                  <p className="text-[10px] text-text-secondary mt-0.5 truncate">{isRTL ? 'السبب:' : 'Reason:'} {request.reason}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => handleApproveEditRequest(request.id, false)} className="h-7 px-2"><XCircle className="w-3 h-3" /></Button>
                  <Button size="sm" className="h-7 px-2 bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground" onClick={() => handleApproveEditRequest(request.id, true)}><CheckSquare className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          <TabsTrigger value="sent" className="flex items-center gap-1.5 text-sm"><Send className="w-3.5 h-3.5" />{isRTL ? 'المرسلة' : 'Sent'}<Badge variant="secondary" className="text-[10px] px-1">{stats.total}</Badge></TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-1.5 text-sm"><CheckCircle className="w-3.5 h-3.5" />{isRTL ? 'المستلمة' : 'Received'}{stats.submitted > 0 && <Badge variant="destructive" className="text-[10px] px-1">{stats.submitted}</Badge>}</TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1.5 text-sm"><FileText className="w-3.5 h-3.5" />{isRTL ? 'القوالب' : 'Templates'}</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1.5 text-sm"><BarChart3 className="w-3.5 h-3.5" />{isRTL ? 'إحصائيات' : 'Analytics'}</TabsTrigger>
        </TabsList>

        {/* Sent Forms Tab - Accordion Style */}
        <TabsContent value="sent">
          {/* Search & Filter */}
          <div className="flex gap-3 mb-4 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary`} />
                <Input placeholder={isRTL ? 'البحث بالاسم أو الإيميل...' : 'Search by name or email...'} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${isRTL ? 'pr-10' : 'pl-10'} bg-card/50 border-border/30 h-9`} />
              </div>
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 border border-primary/30 rounded-lg bg-primary/5 text-foreground text-sm h-9 focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="all">{isRTL ? 'كل الحالات' : 'All Status'}</option>
              <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="in_progress">{isRTL ? 'قيد التقدم' : 'In Progress'}</option>
              <option value="submitted">{isRTL ? 'تم الإرسال' : 'Submitted'}</option>
              <option value="approved">{isRTL ? 'موافق عليه' : 'Approved'}</option>
            </select>
            {groupedByClient.length > 0 && (
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-9 px-2 text-xs" onClick={expandAll}>{isRTL ? 'توسيع الكل' : 'Expand All'}</Button>
                <Button variant="outline" size="sm" className="h-9 px-2 text-xs" onClick={collapseAll}>{isRTL ? 'طي الكل' : 'Collapse All'}</Button>
              </div>
            )}
          </div>

          {/* Client Accordion List */}
          <div className="space-y-2">
            {groupedByClient.length === 0 ? (
              <div className="glass-effect rounded-xl text-center py-8 border border-border/30">
                <Send className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-text-secondary text-sm">{isRTL ? 'لم يتم إرسال نماذج بعد' : 'No forms sent yet'}</p>
                <Button size="sm" className="mt-3 bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground" onClick={() => setShowSendModal(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" />{isRTL ? 'إرسال أول نموذج' : 'Send First Form'}
                </Button>
              </div>
            ) : (
              groupedByClient.map((group) => {
                const isExpanded = expandedClients[group.client.id];
                const pendingCount = group.forms.filter(f => f.status === 'pending').length;
                const submittedCount = group.forms.filter(f => f.status === 'submitted').length;

                return (
                  <div key={group.client.id} className="glass-effect rounded-xl border border-border/30 overflow-hidden">
                    {/* Client Header - Clickable Accordion */}
                    <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => toggleClient(group.client.id)}>
                      <div className="flex items-center justify-center w-6 flex-shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {group.client.profile_picture_url ? (
                          <img src={group.client.profile_picture_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-medium text-text-secondary">{group.client.full_name?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{group.client.full_name}</p>
                        <p className="text-xs text-text-secondary truncate">{group.client.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {submittedCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{submittedCount} {isRTL ? 'جديد' : 'new'}</Badge>}
                        {pendingCount > 0 && <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-[10px] px-1.5">{pendingCount} {isRTL ? 'انتظار' : 'pending'}</Badge>}
                        <Badge variant="secondary" className="text-xs">{group.forms.length} {isRTL ? 'نموذج' : 'form(s)'}</Badge>
                      </div>
                    </div>

                    {/* Expanded Forms List */}
                    {isExpanded && (
                      <div className="border-t border-border/20 divide-y divide-border/20">
                        {group.forms.map((form) => {
                          const status = statusConfig[form.status];
                          const StatusIcon = status.icon;
                          const isOverdue = form.due_date && new Date(form.due_date) < new Date() && !['submitted', 'approved'].includes(form.status);

                          return (
                            <div key={form.id} className={`flex items-center justify-between p-2.5 hover:bg-muted/20 transition-colors ${isOverdue ? 'bg-red-500/5' : ''}`}>
                              <div className="flex items-center gap-2 flex-1 min-w-0 ml-6">
                                <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0"><FileText className="w-3 h-3 text-primary" /></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{isRTL ? (form.form_template?.name_ar || form.form_template?.name) : form.form_template?.name}</p>
                                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                    <Badge className={`${status.color} border text-[9px] px-1 py-0`}><StatusIcon className="w-2 h-2 mr-0.5" />{isRTL ? status.label_ar : status.label}</Badge>
                                    <span className="text-[10px] text-text-secondary">{new Date(form.created_at).toLocaleDateString(language)}</span>
                                    {form.due_date && <span className={`text-[10px] ${isOverdue ? 'text-red-500 font-medium' : 'text-text-secondary'}`}>{isRTL ? 'موعد:' : 'Due:'} {new Date(form.due_date).toLocaleDateString(language)}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {form.responses?.length > 0 && <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setViewingResponse(form); }}><Eye className="w-3 h-3" /></Button>}
                                {['pending', 'in_progress'].includes(form.status) && (
                                  <>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setSendingReminder(form); }}><Bell className="w-3 h-3" /></Button>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setAdjustingDueDate(form); setNewDueDate(form.due_date?.split('T')[0] || ''); }}><CalendarClock className="w-3 h-3" /></Button>
                                  </>
                                )}
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleResendForm(form); }}><Copy className="w-3 h-3" /></Button>
                                {form.status === 'submitted' && (
                                  <Button size="sm" className="h-6 px-2 bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground text-[10px]" onClick={(e) => { e.stopPropagation(); handleApproveForm(form.id); }}><CheckSquare className="w-3 h-3 mr-0.5" />{isRTL ? 'موافقة' : 'Approve'}</Button>
                                )}
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); if (window.confirm(isRTL ? 'هل تريد حذف هذا النموذج نهائياً؟ سيتم إزالته من العميل أيضاً.' : 'Delete this form permanently? It will be removed from the client as well.')) handleDeleteForm(form.id); }}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions">
          <div className="space-y-3">
            {assignments.filter(a => a.status === 'submitted').length === 0 ? (
              <div className="glass-effect rounded-xl text-center py-8 border border-border/30">
                <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-text-secondary text-sm">{isRTL ? 'لا توجد نماذج بحاجة للمراجعة' : 'No forms pending review'}</p>
              </div>
            ) : (
              assignments.filter(a => a.status === 'submitted').map((assignment) => (
                <div key={assignment.id} className="glass-effect rounded-xl p-3 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {assignment.client?.profile_picture_url ? <img src={assignment.client.profile_picture_url} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-medium text-text-secondary">{assignment.client?.full_name?.charAt(0) || '?'}</span>}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{assignment.client?.full_name}</p>
                        <p className="text-xs text-text-secondary">{isRTL ? (assignment.form_template?.name_ar || assignment.form_template?.name) : assignment.form_template?.name}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{isRTL ? 'تم الإرسال:' : 'Submitted:'} {new Date(assignment.submitted_at).toLocaleDateString(language)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingResponse(assignment)} className="h-8"><Eye className="w-3.5 h-3.5 mr-1" />{isRTL ? 'عرض' : 'View'}</Button>
                      <Button size="sm" className="h-8 bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground" onClick={() => handleApproveForm(assignment.id)}><CheckSquare className="w-3.5 h-3.5 mr-1" />{isRTL ? 'موافقة' : 'Approve'}</Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Templates Tab - With Create/Edit */}
        <TabsContent value="templates">
          {/* GreenoFig Professional Templates Section */}
          {systemTemplates.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-primary to-green-400 rounded-xl">
                  <img src="/logo.png" alt="GreenoFig" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{isRTL ? 'قوالب GreenoFig المهنية' : 'GreenoFig Professional Templates'}</h3>
                  <p className="text-xs text-text-secondary">{isRTL ? 'نماذج استقبال صحية ولياقة بدنية جاهزة للاستخدام' : 'Ready-to-use health & fitness intake forms'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {systemTemplates.map((template) => {
                  const templateLang = getTemplateLanguage(template.id);
                  const isTemplateArabic = templateLang === 'ar';

                  return (
                    <div key={template.id} className="glass-effect rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all p-3 sm:p-4 bg-gradient-to-br from-primary/5 to-transparent">
                      {/* Top Row: Language Toggle + Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-primary/10 text-primary border border-primary/30">
                          GreenoFig
                        </Badge>
                        <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5">
                          <button
                            onClick={() => setTemplateLanguages(prev => ({ ...prev, [template.id]: 'en' }))}
                            className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition-all ${
                              templateLang === 'en'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-text-secondary hover:text-foreground'
                            }`}
                          >
                            EN
                          </button>
                          <button
                            onClick={() => setTemplateLanguages(prev => ({ ...prev, [template.id]: 'ar' }))}
                            className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition-all ${
                              templateLang === 'ar'
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-text-secondary hover:text-foreground'
                            }`}
                          >
                            عربي
                          </button>
                        </div>
                      </div>

                      {/* Title and Description */}
                      <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-1">
                        {isTemplateArabic ? (template.name_ar || template.name) : template.name}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-text-secondary line-clamp-2 mb-3">
                        {isTemplateArabic ? (template.description_ar || template.description) : template.description}
                      </p>

                      {/* Stats Row */}
                      <div className="flex items-center gap-3 text-[10px] sm:text-xs text-text-secondary mb-3 pb-3 border-b border-border/30">
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3 h-3 text-primary/70" />
                          <span className="font-medium">{template.sections?.length || 0}</span> {isTemplateArabic ? 'أقسام' : 'sections'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-primary/70" />
                          <span className="font-medium">{template.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0}</span> {isTemplateArabic ? 'سؤال' : 'questions'}
                        </span>
                      </div>

                      {/* Action Buttons - Two rows for better layout */}
                      <div className="space-y-2">
                        {/* First row: Preview, Download, Print */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] sm:text-xs border-primary/30 hover:bg-primary/10 px-1.5 sm:px-2" onClick={() => {
                            setPdfPreviewTemplate({ ...template, _previewLang: templateLang });
                            setShowPdfPreview(true);
                          }}>
                            <Eye className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{isRTL ? 'معاينة' : 'Preview'}</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] sm:text-xs border-primary/30 hover:bg-primary/10 px-1.5 sm:px-2" onClick={() => downloadPdf({ ...template, _lang: templateLang })}>
                            <Download className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{isRTL ? 'تحميل PDF' : 'PDF'}</span>
                          </Button>
                        </div>
                        {/* Second row: Link, Send */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] sm:text-xs border-primary/30 hover:bg-primary/10 px-1.5 sm:px-2" onClick={() => createExternalLink(template, templateLang)}>
                            <Link2 className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{isRTL ? 'رابط' : 'Link'}</span>
                          </Button>
                          <Button size="sm" className="flex-1 h-8 text-[10px] sm:text-xs bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground px-1.5 sm:px-2" onClick={() => {
                            setTemplateLanguages(prev => ({ ...prev, [template.id]: templateLang }));
                            setSelectedTemplate(template);
                            setShowSendModal(true);
                          }}>
                            <Send className="w-3 h-3 sm:mr-1" />
                            <span className="hidden sm:inline">{isRTL ? 'إرسال' : 'Send'}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Custom Templates Section */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-green-400 rounded-xl">
                <img src="/logo.png" alt="GreenoFig" className="w-5 h-5 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{isRTL ? 'قوالبي المخصصة' : 'My Custom Templates'}</h3>
                <p className="text-xs text-text-secondary">{isRTL ? 'نماذجك الخاصة مع علامة GreenoFig' : 'Your forms with GreenoFig branding'}</p>
              </div>
            </div>
            <Button onClick={openCreateTemplate} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /><span className="hidden sm:inline">{isRTL ? 'إنشاء قالب جديد' : 'Create Template'}</span><span className="sm:hidden">{isRTL ? 'جديد' : 'New'}</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-text-secondary col-span-full">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{isRTL ? 'لا توجد قوالب مخصصة بعد' : 'No custom templates yet'}</p>
                <p className="text-xs mt-1">{isRTL ? 'أنشئ قالبك الخاص أو استخدم قوالب GreenoFig الجاهزة' : 'Create your own or use GreenoFig templates above'}</p>
              </div>
            ) : (
              templates.map((template) => {
                const templateLang = getTemplateLanguage(template.id);
                const isTemplateArabic = templateLang === 'ar';

                return (
                  <div key={template.id} className="glass-effect rounded-xl border-2 border-border/30 hover:border-primary/40 transition-all p-3 sm:p-4 bg-gradient-to-br from-muted/30 to-transparent">
                    {/* Top Row: GreenoFig Badge + Language Toggle */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 bg-primary/10 text-primary border border-primary/30">
                        GreenoFig
                      </Badge>
                      <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5">
                        <button
                          onClick={() => setTemplateLanguages(prev => ({ ...prev, [template.id]: 'en' }))}
                          className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition-all ${
                            templateLang === 'en'
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-text-secondary hover:text-foreground'
                          }`}
                        >
                          EN
                        </button>
                        <button
                          onClick={() => setTemplateLanguages(prev => ({ ...prev, [template.id]: 'ar' }))}
                          className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition-all ${
                            templateLang === 'ar'
                              ? 'bg-primary text-white shadow-sm'
                              : 'text-text-secondary hover:text-foreground'
                          }`}
                        >
                          عربي
                        </button>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 line-clamp-1">
                      {isTemplateArabic ? (template.name_ar || template.name) : template.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-text-secondary line-clamp-2 mb-3">
                      {isTemplateArabic ? (template.description_ar || template.description) : template.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-[10px] sm:text-xs text-text-secondary mb-3 pb-3 border-b border-border/30">
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3 h-3 text-primary/70" />
                        <span className="font-medium">{template.sections?.length || 0}</span> {isTemplateArabic ? 'أقسام' : 'sections'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckSquare className="w-3 h-3 text-primary/70" />
                        <span className="font-medium">{template.sections?.reduce((acc, s) => acc + (s.questions?.length || 0), 0) || 0}</span> {isTemplateArabic ? 'سؤال' : 'questions'}
                      </span>
                      {template.is_default && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0 bg-primary/10 text-primary border-primary/30">{isTemplateArabic ? 'افتراضي' : 'Default'}</Badge>
                      )}
                    </div>

                    {/* Action Buttons - Clean row layout */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] sm:text-xs border-border/50 hover:bg-muted/50 px-1.5 sm:px-2" onClick={() => setPreviewingTemplate(template)}>
                        <Eye className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">{isRTL ? 'معاينة' : 'Preview'}</span>
                      </Button>
                      {!template.is_default && (
                        <Button variant="outline" size="sm" className="h-8 text-[10px] sm:text-xs border-border/50 hover:bg-muted/50 px-1.5 sm:px-2" onClick={() => openEditTemplate(template)}>
                          <Edit3 className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">{isRTL ? 'تعديل' : 'Edit'}</span>
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px] sm:text-xs border-primary/30 hover:bg-primary/10 px-1.5 sm:px-2" onClick={() => createExternalLink(template, templateLang)}>
                        <Link2 className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">{isRTL ? 'رابط' : 'Link'}</span>
                      </Button>
                      <Button size="sm" className="flex-1 h-8 text-[10px] sm:text-xs bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground px-1.5 sm:px-2" onClick={() => {
                        setTemplateLanguages(prev => ({ ...prev, [template.id]: templateLang }));
                        setSelectedTemplate(template);
                        setShowSendModal(true);
                      }}>
                        <Send className="w-3 h-3 sm:mr-1" />
                        <span className="hidden sm:inline">{isRTL ? 'إرسال' : 'Send'}</span>
                      </Button>
                      {!template.is_default && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-effect rounded-xl p-4 border border-border/30">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><PieChart className="w-4 h-4 text-primary" />{isRTL ? 'معدل الإكمال' : 'Completion Rate'}</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${stats.completionRate} 100`} className="text-primary" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">{stats.completionRate}%</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-sm text-text-secondary">{isRTL ? 'مكتمل' : 'Completed'}: {stats.submitted + stats.approved}</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-500" /><span className="text-sm text-text-secondary">{isRTL ? 'انتظار' : 'Pending'}: {stats.pending + stats.inProgress}</span></div>
                </div>
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-border/30">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />{isRTL ? 'النماذج حسب الحالة' : 'Forms by Status'}</h3>
              <div className="space-y-2">
                {[{ label: isRTL ? 'انتظار' : 'Pending', count: stats.pending, color: 'bg-yellow-500' }, { label: isRTL ? 'قيد التقدم' : 'In Progress', count: stats.inProgress, color: 'bg-blue-500' }, { label: isRTL ? 'مُرسل' : 'Submitted', count: stats.submitted, color: 'bg-primary' }, { label: isRTL ? 'موافق عليه' : 'Approved', count: stats.approved, color: 'bg-emerald-500' }].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-20">{item.label}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden"><div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }} /></div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-effect rounded-xl p-4 border border-border/30 md:col-span-2">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{isRTL ? 'العملاء الأكثر نشاطاً' : 'Most Active Clients'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {groupedByClient.slice(0, 4).map(group => (
                  <div key={group.client.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {group.client.profile_picture_url ? <img src={group.client.profile_picture_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-medium text-text-secondary">{group.client.full_name?.charAt(0) || '?'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{group.client.full_name}</p>
                      <p className="text-[10px] text-text-secondary">{group.forms.length} {isRTL ? 'نموذج' : 'forms'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

      </Tabs>

      {/* External Forms Section - Prominent Card - Mobile Optimized */}
      <div className="mt-8">
        <div className="glass-effect rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
          {/* Header - Always Visible - Mobile Responsive */}
          <div
            className="p-4 sm:p-5 cursor-pointer hover:bg-primary/5 transition-all"
            onClick={() => setExpandedClients(prev => ({ ...prev, 'external-forms': !prev['external-forms'] }))}
          >
            {/* Mobile Layout: Stack vertically */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* Title Section */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary to-green-400 rounded-xl shadow-lg flex-shrink-0">
                  <Link2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-xl font-bold text-foreground">
                      {isRTL ? 'روابط النماذج الخارجية' : 'External Form Links'}
                    </h3>
                    <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px] sm:text-xs px-1.5 sm:px-2">
                      {isRTL ? 'للمرضى الجدد' : 'New Patients'}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-2 sm:line-clamp-1">
                    {isRTL
                      ? 'أنشئ روابط قابلة للمشاركة لجمع معلومات المرضى الجدد قبل الموعد'
                      : 'Create shareable intake forms for new patients before their first appointment'}
                  </p>
                </div>
              </div>

              {/* Action Section - Stack on mobile */}
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 ml-0 sm:ml-auto pl-10 sm:pl-0">
                <Button
                  size="sm"
                  className="flex-1 sm:flex-initial h-9 sm:h-8 bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground shadow-md text-xs sm:text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedClients(prev => ({ ...prev, 'external-forms': true }));
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  {isRTL ? 'إدارة الروابط' : 'Manage Links'}
                </Button>
                <div className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${expandedClients['external-forms'] ? 'bg-primary/10' : 'bg-muted/50'}`}>
                  {expandedClients['external-forms'] ? (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-text-secondary" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expanded Content */}
          {expandedClients['external-forms'] && (
            <div className="border-t border-primary/20 p-4 sm:p-5 bg-card/30">
              <ExternalFormsManager />
            </div>
          )}
        </div>
      </div>

      {/* Send Form Modal */}
      <Dialog open={showSendModal} onOpenChange={(open) => !open && resetSendModal()}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base"><Send className="w-4 h-4 text-primary" />{isResend ? (isRTL ? 'إعادة إرسال نموذج' : 'Resend Form') : (isRTL ? 'إرسال نموذج' : 'Send Form')}</DialogTitle>
            {selectedTemplate && <DialogDescription className="text-xs">{isRTL ? selectedTemplate.name_ar || selectedTemplate.name : selectedTemplate.name}</DialogDescription>}
          </DialogHeader>
          <div className="space-y-3 py-2">
            {!selectedTemplate && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'اختر القالب' : 'Select Template'}</label>
                <select className="w-full p-2 border border-primary/30 rounded-lg bg-primary/5 text-foreground text-sm focus:ring-2 focus:ring-primary/20" onChange={(e) => setSelectedTemplate(templates.find(t => t.id === e.target.value))}>
                  <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{isRTL ? (t.name_ar || t.name) : t.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'تاريخ الاستحقاق (اختياري)' : 'Due Date (Optional)'}</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="bg-card/50 border-border/30 h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'اختر العملاء' : 'Select Clients'} ({selectedClients.length})</label>
              <div className="border border-border/30 rounded-lg max-h-40 overflow-auto">
                {clients.map((client) => (
                  <label key={client.id} className={`flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer border-b border-border/20 last:border-b-0 ${selectedClients.includes(client.id) ? 'bg-primary/5' : ''}`}>
                    <input type="checkbox" checked={selectedClients.includes(client.id)} onChange={(e) => { if (e.target.checked) { setSelectedClients([...selectedClients, client.id]); } else { setSelectedClients(selectedClients.filter(id => id !== client.id)); } }} className="w-3.5 h-3.5 accent-primary" />
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {client.profile_picture_url ? <img src={client.profile_picture_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-medium text-text-secondary">{client.full_name?.charAt(0) || '?'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-foreground truncate block">{client.full_name}</span>
                      <span className="text-[10px] text-text-secondary truncate block">{client.email}</span>
                    </div>
                  </label>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs px-2" onClick={() => { if (selectedClients.length === clients.length) { setSelectedClients([]); } else { setSelectedClients(clients.map(c => c.id)); } }}>{selectedClients.length === clients.length ? (isRTL ? 'إلغاء الكل' : 'Deselect All') : (isRTL ? 'تحديد الكل' : 'Select All')}</Button>
            </div>
          </div>
          <DialogFooter className="pt-2 gap-2">
            <Button variant="outline" size="sm" className="h-9" onClick={resetSendModal}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button size="sm" className="h-9 bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground" onClick={handleSendForm} disabled={!selectedTemplate || selectedClients.length === 0 || sendingForm}>
              {sendingForm ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />}{isRTL ? 'إرسال' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={(open) => { if (!open) { setShowTemplateModal(false); setEditingTemplate(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />{editingTemplate ? (isRTL ? 'تعديل القالب' : 'Edit Template') : (isRTL ? 'إنشاء قالب جديد' : 'Create New Template')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'اسم النموذج (إنجليزي)' : 'Form Name (English)'} *</label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Health Assessment" className="bg-card/50 border-border/30" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'اسم النموذج (عربي)' : 'Form Name (Arabic)'}</label>
                <Input value={templateForm.name_ar} onChange={(e) => setTemplateForm(p => ({ ...p, name_ar: e.target.value }))} placeholder="مثال: تقييم صحي" className="bg-card/50 border-border/30" dir="rtl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</label>
                <Textarea value={templateForm.description} onChange={(e) => setTemplateForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." className="bg-card/50 border-border/30 min-h-[60px]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</label>
                <Textarea value={templateForm.description_ar} onChange={(e) => setTemplateForm(p => ({ ...p, description_ar: e.target.value }))} placeholder="وصف مختصر..." className="bg-card/50 border-border/30 min-h-[60px]" dir="rtl" />
              </div>
            </div>

            {/* Sections */}
            <div className="border-t border-border/30 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">{isRTL ? 'الأقسام والأسئلة' : 'Sections & Questions'}</h4>
                <Button size="sm" variant="outline" onClick={addSection}><Plus className="w-3 h-3 mr-1" />{isRTL ? 'إضافة قسم' : 'Add Section'}</Button>
              </div>
              <div className="space-y-4">
                {templateForm.sections.map((section, sIdx) => (
                  <div key={sIdx} className="glass-effect rounded-lg p-3 border border-border/30">
                    <div className="flex items-center gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-text-secondary cursor-move" />
                      <Input value={section.title} onChange={(e) => updateSection(sIdx, 'title', e.target.value)} placeholder={isRTL ? 'عنوان القسم (إنجليزي)' : 'Section Title (English)'} className="flex-1 h-8 text-sm bg-card/50 border-border/30" />
                      <Input value={section.title_ar || ''} onChange={(e) => updateSection(sIdx, 'title_ar', e.target.value)} placeholder={isRTL ? 'عنوان القسم (عربي)' : 'Section Title (Arabic)'} className="flex-1 h-8 text-sm bg-card/50 border-border/30" dir="rtl" />
                      {templateForm.sections.length > 1 && <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={() => removeSection(sIdx)}><Trash2 className="w-3 h-3" /></Button>}
                    </div>

                    {/* Questions */}
                    <div className="space-y-2 ml-6">
                      {(section.questions || []).map((q, qIdx) => (
                        <div key={qIdx} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                          <div className="flex-1 space-y-2">
                            <div className="flex gap-2">
                              <Input value={q.label} onChange={(e) => updateQuestion(sIdx, qIdx, 'label', e.target.value)} placeholder={isRTL ? 'السؤال (إنجليزي)' : 'Question (English)'} className="flex-1 h-7 text-xs bg-card/50 border-border/30" />
                              <Input value={q.label_ar || ''} onChange={(e) => updateQuestion(sIdx, qIdx, 'label_ar', e.target.value)} placeholder={isRTL ? 'السؤال (عربي)' : 'Question (Arabic)'} className="flex-1 h-7 text-xs bg-card/50 border-border/30" dir="rtl" />
                            </div>
                            <div className="flex gap-2 items-center">
                              <select value={q.type} onChange={(e) => updateQuestion(sIdx, qIdx, 'type', e.target.value)} className="h-7 text-xs px-2 border border-border/30 rounded bg-card/50 text-foreground">
                                {questionTypes.map(t => <option key={t.value} value={t.value}>{isRTL ? t.label_ar : t.label}</option>)}
                              </select>
                              <label className="flex items-center gap-1 text-xs text-text-secondary">
                                <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(sIdx, qIdx, 'required', e.target.checked)} className="w-3 h-3 accent-primary" />
                                {isRTL ? 'مطلوب' : 'Required'}
                              </label>
                              {['select', 'multiselect'].includes(q.type) && (
                                <Input value={(q.options || []).join(', ')} onChange={(e) => updateQuestion(sIdx, qIdx, 'options', e.target.value.split(',').map(o => o.trim()))} placeholder={isRTL ? 'الخيارات (مفصولة بفاصلة)' : 'Options (comma separated)'} className="flex-1 h-7 text-xs bg-card/50 border-border/30" />
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => removeQuestion(sIdx, qIdx)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => addQuestion(sIdx)}><Plus className="w-3 h-3 mr-1" />{isRTL ? 'إضافة سؤال' : 'Add Question'}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTemplateModal(false); setEditingTemplate(null); }}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleSaveTemplate} disabled={savingTemplate} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">
              {savingTemplate ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}{editingTemplate ? (isRTL ? 'تحديث' : 'Update') : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Other Modals (Adjust Due Date, Send Reminder, Preview, History) */}
      <Dialog open={!!adjustingDueDate} onOpenChange={(open) => !open && setAdjustingDueDate(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-base"><CalendarClock className="w-4 h-4 text-primary" />{isRTL ? 'تعديل الموعد' : 'Adjust Due Date'}</DialogTitle></DialogHeader>
          <div className="py-3"><Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="bg-card/50 border-border/30" /></div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setAdjustingDueDate(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button><Button size="sm" onClick={handleAdjustDueDate} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">{isRTL ? 'حفظ' : 'Save'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sendingReminder} onOpenChange={(open) => !open && setSendingReminder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4 text-primary" />{isRTL ? 'إرسال تذكير' : 'Send Reminder'}</DialogTitle></DialogHeader>
          <div className="py-3"><Textarea value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} placeholder={isRTL ? 'رسالة التذكير (اختياري)...' : 'Reminder message (optional)...'} className="bg-card/50 border-border/30 min-h-[80px]" /></div>
          <DialogFooter><Button variant="outline" size="sm" onClick={() => setSendingReminder(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button><Button size="sm" onClick={handleSendReminder} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground"><Send className="w-3.5 h-3.5 mr-1" />{isRTL ? 'إرسال' : 'Send'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewingTemplate} onOpenChange={(open) => !open && setPreviewingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Eye className="w-4 h-4 text-primary" />{isRTL ? 'معاينة النموذج' : 'Form Preview'}</DialogTitle><DialogDescription>{previewingTemplate && (isRTL ? (previewingTemplate.name_ar || previewingTemplate.name) : previewingTemplate.name)}</DialogDescription></DialogHeader>
          {previewingTemplate && (
            <div className="space-y-4 py-3">
              {previewingTemplate.sections?.map((section, idx) => (
                <div key={idx} className="glass-effect rounded-lg p-3 border border-border/30">
                  <h4 className="font-medium text-foreground mb-2">{isRTL ? (section.title_ar || section.title) : section.title}</h4>
                  <div className="space-y-2">{section.questions?.map((q, qIdx) => (<div key={qIdx} className="text-sm text-text-secondary">• {isRTL ? (q.label_ar || q.label) : q.label}{q.required && <span className="text-red-500">*</span>}<span className="text-xs text-muted-foreground ml-2">({q.type})</span></div>))}</div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewingTemplate(null)}>{isRTL ? 'إغلاق' : 'Close'}</Button><Button onClick={() => { setSelectedTemplate(previewingTemplate); setPreviewingTemplate(null); setShowSendModal(true); }} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground"><Send className="w-3.5 h-3.5 mr-1" />{isRTL ? 'إرسال هذا النموذج' : 'Send This Form'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Preview Modal - Full form layout like original PDFs */}
      <Dialog open={showPdfPreview} onOpenChange={(open) => { if (!open) { setShowPdfPreview(false); setPdfPreviewTemplate(null); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {isRTL ? 'معاينة PDF' : 'PDF Preview'}
            </DialogTitle>
            <DialogDescription>
              {pdfPreviewTemplate && (isRTL ? (pdfPreviewTemplate.name_ar || pdfPreviewTemplate.name) : pdfPreviewTemplate.name)}
            </DialogDescription>
          </DialogHeader>
          {pdfPreviewTemplate && (
            <div className="flex-1 overflow-auto border rounded-lg bg-gray-100">
              <iframe
                srcDoc={generateFormPdfHtml(pdfPreviewTemplate, false, pdfPreviewTemplate._previewLang || getTemplateLanguage(pdfPreviewTemplate.id))}
                className="w-full h-full min-h-[500px]"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            </div>
          )}
          <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => { setShowPdfPreview(false); setPdfPreviewTemplate(null); }}>
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
            <Button variant="outline" onClick={() => downloadPdf(pdfPreviewTemplate)}>
              <Download className="w-4 h-4 mr-2" />
              {isRTL ? 'تحميل PDF' : 'Download PDF'}
            </Button>
            <Button
              onClick={() => {
                setSelectedTemplate(pdfPreviewTemplate);
                setShowPdfPreview(false);
                setPdfPreviewTemplate(null);
                setShowSendModal(true);
              }}
              className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              {isRTL ? 'إرسال للعميل' : 'Send to Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingHistory} onOpenChange={(open) => !open && setViewingHistory(null)}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="w-4 h-4 text-primary" />{isRTL ? 'سجل النماذج' : 'Form History'}</DialogTitle><DialogDescription>{viewingHistory?.full_name}</DialogDescription></DialogHeader>
          <div className="space-y-2 py-3">
            {formHistory.length === 0 ? <p className="text-center text-text-secondary text-sm py-4">{isRTL ? 'لا يوجد سجل' : 'No history found'}</p> : formHistory.map(form => {
              const status = statusConfig[form.status];
              const StatusIcon = status.icon;
              return (
                <div key={form.id} className="glass-effect rounded-lg p-2.5 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{isRTL ? (form.form_template?.name_ar || form.form_template?.name) : form.form_template?.name}</p>
                      <div className="flex items-center gap-2 mt-1"><Badge className={`${status.color} border text-[9px] px-1 py-0`}><StatusIcon className="w-2 h-2 mr-0.5" />{isRTL ? status.label_ar : status.label}</Badge><span className="text-[10px] text-text-secondary">{new Date(form.created_at).toLocaleDateString(language)}</span></div>
                    </div>
                    {form.responses?.length > 0 && <Button variant="ghost" size="sm" className="h-6" onClick={() => { setViewingHistory(null); setViewingResponse(form); }}><Eye className="w-3 h-3" /></Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
