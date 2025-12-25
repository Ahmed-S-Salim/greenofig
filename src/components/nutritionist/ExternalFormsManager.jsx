import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Link2,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Eye,
  Users,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  Calendar,
  Activity,
  Heart,
  Stethoscope,
  ClipboardList,
  Sparkles,
  Search,
  UserPlus,
  LinkIcon,
  Download,
  FileSpreadsheet,
  Languages
} from 'lucide-react';

const formIcons = {
  'Exercise': Activity,
  'Health': Heart,
  'Medical': Stethoscope,
  'Client': ClipboardList
};

export default function ExternalFormsManager() {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const language = i18n.language;
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [formLinks, setFormLinks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [expandedLinks, setExpandedLinks] = useState({});
  const [expandedPatients, setExpandedPatients] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', title_ar: '', expires_days: '', max_submissions: '', formLanguage: 'en' });
  const [activeTab, setActiveTab] = useState('patients');
  const [templateLanguages, setTemplateLanguages] = useState({});

  // Patient Intake Form Templates (same as PatientIntakePage sections)
  const patientIntakeTemplates = [
    {
      id: 'patient-info',
      name: 'Patient Information',
      name_ar: 'معلومات المريض',
      description: 'Basic personal and contact information',
      description_ar: 'المعلومات الشخصية والاتصال الأساسية',
      icon: User,
      sections: [
        {
          title: 'Personal Information',
          title_ar: 'المعلومات الشخصية',
          questions: [
            { id: 'full_name', label: 'Full Name', label_ar: 'الاسم الكامل', type: 'text', required: true },
            { id: 'email', label: 'Email Address', label_ar: 'البريد الإلكتروني', type: 'email', required: true },
            { id: 'phone', label: 'Phone Number', label_ar: 'رقم الهاتف', type: 'tel', required: true },
            { id: 'age', label: 'Age', label_ar: 'العمر', type: 'number', required: true },
            { id: 'gender', label: 'Gender', label_ar: 'الجنس', type: 'select', options: ['Male', 'Female'], options_ar: ['ذكر', 'أنثى'], required: true },
            { id: 'address', label: 'Address', label_ar: 'العنوان', type: 'textarea', required: false }
          ]
        }
      ]
    },
    {
      id: 'exercise-history',
      name: 'Exercise History',
      name_ar: 'تاريخ التمارين',
      description: 'Physical activity and exercise habits',
      description_ar: 'النشاط البدني وعادات التمارين',
      icon: Activity,
      sections: [
        {
          title: 'Exercise Habits',
          title_ar: 'عادات التمارين',
          questions: [
            { id: 'exercise_frequency', label: 'How often do you exercise?', label_ar: 'كم مرة تمارس الرياضة؟', type: 'select', options: ['Never', '1-2 times/week', '3-4 times/week', '5+ times/week'], options_ar: ['أبداً', '1-2 مرات/أسبوع', '3-4 مرات/أسبوع', '5+ مرات/أسبوع'], required: true },
            { id: 'exercise_types', label: 'Types of exercise you do', label_ar: 'أنواع التمارين التي تمارسها', type: 'textarea', required: false },
            { id: 'exercise_duration', label: 'Average workout duration (minutes)', label_ar: 'متوسط مدة التمرين (بالدقائق)', type: 'number', required: false },
            { id: 'fitness_goals', label: 'What are your fitness goals?', label_ar: 'ما هي أهدافك الرياضية؟', type: 'textarea', required: true },
            { id: 'gym_membership', label: 'Do you have a gym membership?', label_ar: 'هل لديك عضوية صالة رياضية؟', type: 'yes_no', required: false }
          ]
        }
      ]
    },
    {
      id: 'health-history',
      name: 'Health History',
      name_ar: 'التاريخ الصحي',
      description: 'General health and lifestyle information',
      description_ar: 'معلومات الصحة العامة ونمط الحياة',
      icon: Heart,
      sections: [
        {
          title: 'Health & Lifestyle',
          title_ar: 'الصحة ونمط الحياة',
          questions: [
            { id: 'current_weight', label: 'Current Weight (kg)', label_ar: 'الوزن الحالي (كجم)', type: 'number', required: true },
            { id: 'target_weight', label: 'Target Weight (kg)', label_ar: 'الوزن المستهدف (كجم)', type: 'number', required: false },
            { id: 'height', label: 'Height (cm)', label_ar: 'الطول (سم)', type: 'number', required: true },
            { id: 'sleep_hours', label: 'Average sleep hours per night', label_ar: 'متوسط ساعات النوم في الليلة', type: 'number', required: false },
            { id: 'water_intake', label: 'Daily water intake (glasses)', label_ar: 'كمية الماء اليومية (أكواب)', type: 'number', required: false },
            { id: 'smoking', label: 'Do you smoke?', label_ar: 'هل تدخن؟', type: 'yes_no', required: true },
            { id: 'alcohol', label: 'Do you drink alcohol?', label_ar: 'هل تشرب الكحول؟', type: 'yes_no', required: true },
            { id: 'dietary_restrictions', label: 'Any dietary restrictions or allergies?', label_ar: 'هل لديك قيود غذائية أو حساسية؟', type: 'textarea', required: false }
          ]
        }
      ]
    },
    {
      id: 'medical-history',
      name: 'Medical History',
      name_ar: 'التاريخ الطبي',
      description: 'Medical conditions and medications',
      description_ar: 'الحالات الطبية والأدوية',
      icon: Stethoscope,
      sections: [
        {
          title: 'Medical Information',
          title_ar: 'المعلومات الطبية',
          questions: [
            { id: 'chronic_conditions', label: 'Do you have any chronic conditions?', label_ar: 'هل لديك أي أمراض مزمنة؟', type: 'textarea', required: false },
            { id: 'diabetes', label: 'Do you have diabetes?', label_ar: 'هل لديك مرض السكري؟', type: 'yes_no', required: true },
            { id: 'heart_disease', label: 'Any heart conditions?', label_ar: 'هل لديك أمراض قلبية؟', type: 'yes_no', required: true },
            { id: 'blood_pressure', label: 'High blood pressure?', label_ar: 'ضغط دم مرتفع؟', type: 'yes_no', required: true },
            { id: 'current_medications', label: 'Current medications', label_ar: 'الأدوية الحالية', type: 'textarea', required: false },
            { id: 'supplements', label: 'Supplements you take', label_ar: 'المكملات التي تتناولها', type: 'textarea', required: false },
            { id: 'injuries', label: 'Any past injuries affecting exercise?', label_ar: 'أي إصابات سابقة تؤثر على التمارين؟', type: 'textarea', required: false },
            { id: 'doctor_clearance', label: 'Has your doctor cleared you for exercise?', label_ar: 'هل وافق طبيبك على ممارسة الرياضة؟', type: 'yes_no', required: true }
          ]
        }
      ]
    }
  ];

  const getTemplateLanguage = (templateId) => templateLanguages[templateId] || (isRTL ? 'ar' : 'en');

  // Generate PDF for intake template
  const generateTemplatePdf = (template, formLang) => {
    const useArabic = formLang === 'ar';
    const questionsHtml = template.sections.map(section => {
      const sectionQuestions = section.questions.map(q => {
        const label = useArabic ? (q.label_ar || q.label) : q.label;
        return `<div class="q-row"><span class="q-label">${label}</span><span class="q-answer">_______________</span></div>`;
      }).join('');
      return `
        <div class="section">
          <div class="section-head">${useArabic ? (section.title_ar || section.title) : section.title}</div>
          ${sectionQuestions}
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html dir="${useArabic ? 'rtl' : 'ltr'}">
        <head>
          <title>${useArabic ? (template.name_ar || template.name) : template.name} - GreenoFig</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; line-height: 1.6; direction: ${useArabic ? 'rtl' : 'ltr'}; }
            .header {
              background: #fff;
              padding: 30px 40px;
              border-bottom: 3px solid #6BD55C;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .logo-section { display: flex; align-items: center; gap: 15px; }
            .logo { width: 60px; height: 60px; border-radius: 12px; object-fit: contain; }
            .brand-text h1 { font-size: 26px; font-weight: 700; color: #6BD55C; margin: 0; }
            .brand-text p { font-size: 13px; color: #6b7280; margin: 0; }
            .doc-info { text-align: ${useArabic ? 'left' : 'right'}; }
            .doc-info h2 { font-size: 18px; color: #374151; margin: 0; }
            .doc-info p { font-size: 12px; color: #6b7280; }
            .content { padding: 30px 40px; }
            .section { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
            .section-head { background: #6BD55C; color: white; padding: 12px 20px; font-size: 14px; font-weight: 600; }
            .q-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            .q-row:last-child { border-bottom: none; }
            .q-label { color: #4b5563; flex: 1; }
            .q-answer { color: #9ca3af; font-style: italic; }
            .footer { margin-top: 40px; padding: 20px 40px; background: #f9fafb; border-top: 2px solid #6BD55C; display: flex; justify-content: space-between; align-items: center; }
            .footer-logo { display: flex; align-items: center; gap: 10px; color: #6BD55C; font-weight: 600; }
            .footer-text { font-size: 11px; color: #6b7280; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <img class="logo" src="https://greenofig.com/logo.png" alt="GreenoFig" onerror="this.style.display='none'" />
              <div class="brand-text">
                <h1>GreenoFig</h1>
                <p>${useArabic ? 'شريكك الغذائي الشخصي' : 'Your Personal Nutrition Partner'}</p>
              </div>
            </div>
            <div class="doc-info">
              <h2>${useArabic ? (template.name_ar || template.name) : template.name}</h2>
              <p>${useArabic ? 'نموذج استقبال المرضى' : 'Patient Intake Form'}</p>
            </div>
          </div>
          <div class="content">${questionsHtml}</div>
          <div class="footer">
            <div class="footer-logo">
              <img src="https://greenofig.com/logo.png" alt="GreenoFig" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.style.display='none'" />
              <span>GreenoFig</span>
            </div>
            <div class="footer-text">greenofig.com | ${useArabic ? 'نموذج احترافي' : 'Professional Form'}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => setTimeout(() => printWindow.print(), 500);
  };

  // Create link for a specific template
  const createTemplateLink = async (template, formLang) => {
    try {
      const linkCode = generateLinkCode();
      const useArabic = formLang === 'ar';
      const { error } = await supabase.from('public_form_links').insert({
        nutritionist_id: user.id,
        link_code: linkCode,
        title: useArabic ? (template.name_ar || template.name) : template.name,
        title_ar: template.name_ar,
        description: useArabic ? 'نموذج باللغة العربية' : 'Form in English',
        description_ar: 'نموذج باللغة العربية',
        form_language: formLang
      });
      if (error) throw error;

      const linkUrl = `${window.location.origin}/patientinfo/${linkCode}?lang=${formLang}`;
      navigator.clipboard.writeText(linkUrl);
      toast({
        title: useArabic ? 'تم إنشاء الرابط!' : 'Link Created!',
        description: useArabic ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard'
      });
      fetchData();
    } catch (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    }
  };

  // Preview template form - generates HTML preview
  const previewTemplate = (template, formLang) => {
    const useArabic = formLang === 'ar';
    const questionsHtml = template.sections.map(section => {
      const sectionQuestions = section.questions.map(q => {
        const label = useArabic ? (q.label_ar || q.label) : q.label;
        let inputHtml = '';
        if (q.type === 'textarea') {
          inputHtml = `<textarea disabled placeholder="${useArabic ? 'أدخل إجابتك...' : 'Enter your answer...'}" class="form-input textarea"></textarea>`;
        } else if (q.type === 'yes_no') {
          inputHtml = `<div class="yes-no-btns"><button class="yes-btn">${useArabic ? 'نعم' : 'Yes'}</button><button class="no-btn">${useArabic ? 'لا' : 'No'}</button></div>`;
        } else if (q.type === 'select' && q.options) {
          const opts = q.options.map(o => `<option value="${o.value || o}">${useArabic ? (o.label_ar || o.label || o) : (o.label || o)}</option>`).join('');
          inputHtml = `<select class="form-input" disabled><option value="">${useArabic ? 'اختر...' : 'Select...'}</option>${opts}</select>`;
        } else {
          inputHtml = `<input type="${q.type || 'text'}" disabled placeholder="${useArabic ? 'أدخل إجابتك...' : 'Enter your answer...'}" class="form-input" />`;
        }
        return `<div class="question"><label>${label}${q.required ? ' <span class="req">*</span>' : ''}</label>${inputHtml}</div>`;
      }).join('');
      return `<div class="section"><div class="section-head">${useArabic ? (section.title_ar || section.title) : section.title}</div><div class="section-body">${sectionQuestions}</div></div>`;
    }).join('');

    const html = `<!DOCTYPE html><html dir="${useArabic ? 'rtl' : 'ltr'}"><head><title>${useArabic ? (template.name_ar || template.name) : template.name} - GreenoFig</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#0f0f0f;color:#fff;line-height:1.6;direction:${useArabic ? 'rtl' : 'ltr'}}
    .header{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:20px 30px;border-bottom:3px solid #6BD55C;display:flex;align-items:center;gap:15px}
    .header img{width:50px;height:50px;border-radius:12px}.header h1{font-size:22px;color:#6BD55C}.header p{font-size:12px;color:#9ca3af}
    .container{max-width:800px;margin:30px auto;padding:0 20px}
    .form-title{text-align:center;margin-bottom:30px}.form-title h2{font-size:24px;color:#fff;margin-bottom:5px}.form-title p{color:#9ca3af;font-size:14px}
    .section{background:#1a1a2e;border-radius:16px;margin-bottom:20px;overflow:hidden;border:1px solid #374151}
    .section-head{background:#6BD55C;color:#fff;padding:15px 20px;font-weight:600;font-size:15px}
    .section-body{padding:20px}
    .question{margin-bottom:20px}.question:last-child{margin-bottom:0}
    .question label{display:block;font-size:14px;font-weight:500;margin-bottom:8px;color:#e5e7eb}
    .req{color:#ef4444}
    .form-input{width:100%;padding:12px 15px;background:#0f0f0f;border:1px solid #374151;border-radius:10px;color:#fff;font-size:14px}
    .form-input:focus{border-color:#6BD55C;outline:none}
    .textarea{min-height:80px;resize:vertical}
    .yes-no-btns{display:flex;gap:10px}.yes-no-btns button{flex:1;padding:12px;border:none;border-radius:10px;font-weight:500;cursor:not-allowed}
    .yes-btn{background:#22c55e20;color:#22c55e;border:1px solid #22c55e40}.no-btn{background:#ef444420;color:#ef4444;border:1px solid #ef444440}
    .footer{text-align:center;padding:30px;color:#6b7280;font-size:12px}.footer span{color:#6BD55C;font-weight:600}
    .preview-badge{position:fixed;top:20px;right:20px;background:#6BD55C;color:#000;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600}
    </style></head><body>
    <div class="preview-badge">${useArabic ? 'معاينة' : 'PREVIEW'}</div>
    <div class="header"><img src="https://greenofig.com/logo.png" alt="GreenoFig" onerror="this.style.display='none'"/><div><h1>GreenoFig</h1><p>${useArabic ? 'شريكك الغذائي الشخصي' : 'Your Personal Nutrition Partner'}</p></div></div>
    <div class="container"><div class="form-title"><h2>${useArabic ? (template.name_ar || template.name) : template.name}</h2><p>${useArabic ? 'نموذج استقبال المرضى' : 'Patient Intake Form'}</p></div>${questionsHtml}</div>
    <div class="footer"><span>GreenoFig</span> | greenofig.com</div></body></html>`;

    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(html);
    previewWindow.document.close();
  };

  // Preview all templates combined
  const previewAllTemplates = (formLang) => {
    const allTemplate = {
      name: 'Complete Patient Intake',
      name_ar: 'نموذج استقبال المرضى الشامل',
      sections: patientIntakeTemplates.flatMap(t => t.sections)
    };
    previewTemplate(allTemplate, formLang);
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    try {
      const { data: linkData } = await supabase
        .from('public_form_links')
        .select('*, form_template:form_templates(*)')
        .eq('nutritionist_id', user?.id)
        .order('created_at', { ascending: false });
      setFormLinks(linkData || []);

      const { data: subData } = await supabase
        .from('external_form_submissions')
        .select('*, form_template:form_templates(*), link:public_form_links(*)')
        .eq('nutritionist_id', user?.id)
        .neq('status', 'draft')
        .order('created_at', { ascending: false });
      setSubmissions(subData || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientGroups = () => {
    const groups = {};
    submissions.forEach(sub => {
      const key = sub.submitter_email;
      if (!groups[key]) {
        groups[key] = { name: sub.submitter_name, email: sub.submitter_email, phone: sub.submitter_phone, age: sub.submitter_age, address: sub.submitter_address, submissions: [], latestSubmission: sub.created_at, hasNewSubmissions: false };
      }
      groups[key].submissions.push(sub);
      if (sub.status === 'submitted') groups[key].hasNewSubmissions = true;
      if (new Date(sub.created_at) > new Date(groups[key].latestSubmission)) groups[key].latestSubmission = sub.created_at;
    });
    return Object.entries(groups).map(([email, data]) => ({ email, ...data })).sort((a, b) => new Date(b.latestSubmission) - new Date(a.latestSubmission));
  };

  const filteredPatients = getPatientGroups().filter(patient => {
    const matchesSearch = !searchQuery || patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.email.toLowerCase().includes(searchQuery.toLowerCase()) || patient.phone?.includes(searchQuery);
    const matchesFilter = filterStatus === 'all' || (filterStatus === 'new' && patient.hasNewSubmissions) || (filterStatus === 'reviewed' && !patient.hasNewSubmissions);
    return matchesSearch && matchesFilter;
  });

  const generateLinkCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleCreateLink = async () => {
    setCreating(true);
    try {
      const linkCode = generateLinkCode();
      const expiresAt = newLink.expires_days ? new Date(Date.now() + parseInt(newLink.expires_days) * 86400000).toISOString() : null;
      const isArabic = newLink.formLanguage === 'ar';
      const { error } = await supabase.from('public_form_links').insert({
        nutritionist_id: user.id,
        link_code: linkCode,
        title: isArabic ? (newLink.title_ar || 'نماذج القبول') : (newLink.title || 'Patient Intake Forms'),
        title_ar: newLink.title_ar || 'نماذج القبول',
        description: isArabic ? 'نماذج استقبال المرضى باللغة العربية' : 'Patient intake forms in English',
        description_ar: 'نماذج استقبال المرضى باللغة العربية',
        form_language: newLink.formLanguage || 'en',
        expires_at: expiresAt,
        max_submissions: newLink.max_submissions ? parseInt(newLink.max_submissions) : null
      });
      if (error) throw error;
      toast({ title: isRTL ? 'تم الإنشاء بنجاح' : 'Link Created', description: isArabic ? 'سيظهر النموذج باللغة العربية' : 'Form will appear in English' });
      setShowCreateModal(false);
      setNewLink({ title: '', title_ar: '', expires_days: '', max_submissions: '', formLanguage: 'en' });
      fetchData();
    } catch (error) {
      toast({ title: isRTL ? 'خطأ' : 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    if (!window.confirm(isRTL ? 'هل تريد حذف هذا الرابط؟' : 'Delete this link?')) return;
    try {
      await supabase.from('public_form_links').delete().eq('id', linkId);
      toast({ title: isRTL ? 'تم الحذف' : 'Deleted' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (link) => {
    try {
      await supabase.from('public_form_links').update({ is_active: !link.is_active }).eq('id', link.id);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (link) => {
    const isArabicForm = link.description?.includes('العربية') || link.title_ar === link.title;
    const langParam = isArabicForm ? '?lang=ar' : '?lang=en';
    navigator.clipboard.writeText(`${window.location.origin}/patientinfo/${link.link_code}${langParam}`);
    toast({ title: isRTL ? 'تم النسخ!' : 'Copied!' });
  };

  const handleMarkReviewed = async (submissionId) => {
    try {
      await supabase.from('external_form_submissions').update({ status: 'reviewed', reviewed_at: new Date().toISOString(), reviewed_by: user.id }).eq('id', submissionId);
      fetchData();
      setShowSubmissionModal(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllReviewedForPatient = async (patientEmail) => {
    try {
      await supabase.from('external_form_submissions').update({ status: 'reviewed', reviewed_at: new Date().toISOString(), reviewed_by: user.id }).eq('nutritionist_id', user.id).eq('submitter_email', patientEmail).eq('status', 'submitted');
      toast({ title: isRTL ? 'تمت المراجعة' : 'Marked as Reviewed' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSubmission = async (submissionId) => {
    if (!window.confirm(isRTL ? 'هل تريد حذف هذا النموذج؟' : 'Delete this submission?')) return;
    try {
      await supabase.from('external_form_submissions').delete().eq('id', submissionId);
      toast({ title: isRTL ? 'تم الحذف' : 'Deleted' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Open submission modal when clicking on form row
  const handleFormRowClick = (sub, e) => {
    e.stopPropagation();
    setShowSubmissionModal(sub);
  };

  const newSubmissionsCount = submissions.filter(s => s.status === 'submitted').length;
  const totalPatients = getPatientGroups().length;
  const activeLinksCount = formLinks.filter(l => l.is_active).length;

  // Get all form sections from the submission's form templates (fetched from DB)
  const getAllFormSections = (submission) => {
    // Use the form_template sections if available (from database)
    if (submission?.form_template?.sections) {
      return [{
        name: submission.form_template.name,
        name_ar: submission.form_template.name_ar,
        icon: '📋',
        sections: submission.form_template.sections
      }];
    }
    return [];
  };

  // Export to PDF - GreenoFig Light Theme
  const exportToPDF = async (submission) => {
    try {
      const responses = submission.responses || {};
      const formData = getAllFormSections(submission);
      const pdfLang = submission.link?.description?.includes('العربية') ? 'ar' : 'en';
      const isPdfRTL = pdfLang === 'ar';

      // Build sections HTML from actual form template
      let sectionsHTML = '';
      formData.forEach(form => {
        form.sections?.forEach(section => {
          const questionsHTML = section.questions?.map(q => {
            const ans = responses[q.id];
            let display = ans === true ? (isPdfRTL ? 'نعم' : 'Yes') : ans === false ? (isPdfRTL ? 'لا' : 'No') : Array.isArray(ans) ? ans.join(', ') : (ans || '—');
            let bgColor = ans === true ? '#dcfce7' : ans === false ? '#fee2e2' : '#f9fafb';
            return `<div class="q-row" style="background: ${bgColor}"><span class="q-label">${isPdfRTL ? (q.label_ar || q.label) : q.label}</span><span class="q-answer">${display}</span></div>`;
          }).join('') || '';

          sectionsHTML += `
            <div class="section">
              <div class="section-head">${isPdfRTL ? (section.title_ar || section.title) : section.title}</div>
              ${questionsHTML}
            </div>
          `;
        });
      });

      // Also show raw responses that aren't in template
      const templateQuestionIds = new Set();
      formData.forEach(form => form.sections?.forEach(section => section.questions?.forEach(q => templateQuestionIds.add(q.id))));
      const extraResponses = Object.entries(responses).filter(([key]) => !templateQuestionIds.has(key) && key !== 'signature');

      if (extraResponses.length > 0) {
        sectionsHTML += `
          <div class="section">
            <div class="section-head">${isPdfRTL ? 'إجابات إضافية' : 'Additional Responses'}</div>
            ${extraResponses.map(([key, value]) => {
              let display = value === true ? (isPdfRTL ? 'نعم' : 'Yes') : value === false ? (isPdfRTL ? 'لا' : 'No') : Array.isArray(value) ? value.join(', ') : (value || '—');
              let bgColor = value === true ? '#dcfce7' : value === false ? '#fee2e2' : '#f9fafb';
              return `<div class="q-row" style="background: ${bgColor}"><span class="q-label">${key.replace(/_/g, ' ')}</span><span class="q-answer">${display}</span></div>`;
            }).join('')}
          </div>
        `;
      }

      const printContent = `
        <!DOCTYPE html>
        <html dir="${isPdfRTL ? 'rtl' : 'ltr'}">
          <head>
            <title>${submission.submitter_name} - GreenoFig</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body { font-family: 'Inter', sans-serif; background: #fff; color: #1f2937; line-height: 1.6; direction: ${isPdfRTL ? 'rtl' : 'ltr'}; }

              .header {
                background: #fff;
                padding: 30px 40px;
                border-bottom: 3px solid #6BD55C;
                display: flex;
                align-items: center;
                justify-content: space-between;
              }
              .logo-section { display: flex; align-items: center; gap: 15px; }
              .logo {
                width: 60px; height: 60px;
                border-radius: 12px;
                object-fit: contain;
              }
              .brand-text h1 {
                font-size: 26px;
                font-weight: 700;
                color: #6BD55C;
                margin: 0;
                letter-spacing: -0.5px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              }
              .brand-text p { font-size: 13px; color: #6b7280; margin: 0; font-weight: 500; }
              .doc-info { text-align: ${isPdfRTL ? 'left' : 'right'}; }
              .doc-info h2 { font-size: 16px; color: #374151; margin: 0; }
              .doc-info p { font-size: 12px; color: #6b7280; }

              .content { padding: 30px 40px; }

              .patient-card {
                background: #f0fdf4;
                border: 2px solid #6BD55C;
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 24px;
              }
              .patient-card h3 { font-size: 14px; color: #4CAF50; margin-bottom: 16px; font-weight: 600; }
              .patient-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
              .patient-item { background: #fff; padding: 12px; border-radius: 8px; }
              .patient-item label { font-size: 10px; color: #6b7280; text-transform: uppercase; font-weight: 600; display: block; }
              .patient-item span { font-size: 14px; color: #1f2937; font-weight: 500; }

              .section {
                margin-bottom: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                overflow: hidden;
                page-break-inside: avoid;
              }
              .section-head {
                background: #6BD55C;
                color: white;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: 600;
              }
              .q-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 20px;
                border-bottom: 1px solid #e5e7eb;
                font-size: 13px;
              }
              .q-row:last-child { border-bottom: none; }
              .q-label { color: #4b5563; flex: 1; ${isPdfRTL ? 'padding-left' : 'padding-right'}: 20px; }
              .q-answer { font-weight: 600; color: #1f2937; }

              .signature-section {
                margin-top: 24px;
                padding: 20px;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
              }
              .signature-section h4 { font-size: 14px; color: #374151; margin-bottom: 12px; }
              .signature-section img { max-width: 250px; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; background: #fff; }

              .footer {
                margin-top: 40px;
                padding: 20px 40px;
                background: #f9fafb;
                border-top: 2px solid #6BD55C;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .footer-logo { display: flex; align-items: center; gap: 10px; color: #6BD55C; font-weight: 600; }
              .footer-text { font-size: 11px; color: #6b7280; }

              @media print {
                body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                .section { break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo-section">
                <img class="logo" src="https://greenofig.com/logo.png" alt="GreenoFig" onerror="this.style.display='none'" />
                <div class="brand-text">
                  <h1>GreenoFig</h1>
                  <p>${isPdfRTL ? 'شريكك الغذائي الشخصي' : 'Your Personal Nutrition Partner'}</p>
                </div>
              </div>
              <div class="doc-info">
                <h2>${isPdfRTL ? 'نماذج القبول' : 'Patient Intake Forms'}</h2>
                <p>${new Date(submission.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div class="content">
              <div class="patient-card">
                <h3>${isPdfRTL ? 'معلومات المريض' : 'Patient Information'}</h3>
                <div class="patient-grid">
                  <div class="patient-item">
                    <label>${isPdfRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                    <span>${submission.submitter_name}</span>
                  </div>
                  <div class="patient-item">
                    <label>${isPdfRTL ? 'البريد الإلكتروني' : 'Email'}</label>
                    <span>${submission.submitter_email}</span>
                  </div>
                  <div class="patient-item">
                    <label>${isPdfRTL ? 'الهاتف' : 'Phone'}</label>
                    <span>${submission.submitter_phone || '-'}</span>
                  </div>
                  <div class="patient-item">
                    <label>${isPdfRTL ? 'العمر' : 'Age'}</label>
                    <span>${submission.submitter_age || '-'}</span>
                  </div>
                  <div class="patient-item">
                    <label>${isPdfRTL ? 'العنوان' : 'Address'}</label>
                    <span>${submission.submitter_address || '-'}</span>
                  </div>
                  <div class="patient-item">
                    <label>${isPdfRTL ? 'تاريخ الإرسال' : 'Submitted'}</label>
                    <span>${new Date(submission.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              ${sectionsHTML}

              ${submission.signature_data ? `
                <div class="signature-section">
                  <h4>${isPdfRTL ? 'التوقيع' : 'Signature'}</h4>
                  <img src="${submission.signature_data}" alt="Signature" />
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <div class="footer-logo">
                <img src="https://greenofig.com/logo.png" alt="GreenoFig" style="width: 24px; height: 24px; border-radius: 4px;" onerror="this.style.display='none'" />
                <span style="font-weight: 600; color: #6BD55C;">GreenoFig</span>
              </div>
              <div class="footer-text">
                ${isPdfRTL ? 'تم الإنشاء' : 'Generated'} ${new Date().toLocaleDateString()} | greenofig.com
              </div>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 400);

      toast({ title: isRTL ? 'جاري تحميل PDF...' : 'Generating PDF...' });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ title: isRTL ? 'خطأ في التحميل' : 'Export failed', variant: 'destructive' });
    }
  };

  // Export to Excel/CSV
  const exportToExcel = (submission) => {
    try {
      const responses = submission.responses || {};
      const formData = getAllFormSections(submission);
      const rows = [];

      rows.push(['GreenoFig - Patient Intake Form Export']);
      rows.push(['Generated', new Date().toLocaleString()]);
      rows.push([]);

      rows.push(['PATIENT INFORMATION']);
      rows.push(['Full Name', submission.submitter_name]);
      rows.push(['Email', submission.submitter_email]);
      rows.push(['Phone', submission.submitter_phone || '-']);
      rows.push(['Age', submission.submitter_age || '-']);
      rows.push(['Address', submission.submitter_address || '-']);
      rows.push(['Submitted', new Date(submission.created_at).toLocaleString()]);
      rows.push([]);

      formData.forEach(form => {
        form.sections?.forEach(section => {
          rows.push([`=== ${section.title} ===`]);
          section.questions?.forEach(q => {
            const answer = responses[q.id];
            const displayAnswer = answer === true ? 'Yes' : answer === false ? 'No' : Array.isArray(answer) ? answer.join(', ') : answer || '-';
            rows.push([q.label, displayAnswer]);
          });
          rows.push([]);
        });
      });

      const csvContent = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `patient-${submission.submitter_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: isRTL ? 'تم تحميل الملف' : 'File downloaded' });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({ title: isRTL ? 'خطأ في التحميل' : 'Export failed', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, value: totalPatients, label: isRTL ? 'المرضى' : 'Patients', bgColor: 'bg-blue-500/10', iconColor: 'text-blue-600' },
          { icon: UserPlus, value: newSubmissionsCount, label: isRTL ? 'جديد' : 'New', bgColor: 'bg-yellow-500/10', iconColor: 'text-yellow-600' },
          { icon: LinkIcon, value: formLinks.length, label: isRTL ? 'الروابط' : 'Links', bgColor: 'bg-purple-500/10', iconColor: 'text-purple-600' },
          { icon: CheckCircle, value: activeLinksCount, label: isRTL ? 'نشط' : 'Active', bgColor: 'bg-primary/10', iconColor: 'text-primary' },
        ].map((stat, idx) => (
          <div key={idx} className="glass-effect rounded-xl p-3 border border-border/30">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-text-secondary">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Create Button - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'patients'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-text-secondary hover:bg-muted/50'
            }`}
          >
            <Users className="w-4 h-4" />
            {isRTL ? 'المرضى' : 'Patients'}
            {newSubmissionsCount > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5">{newSubmissionsCount}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'links'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-text-secondary hover:bg-muted/50'
            }`}
          >
            <Link2 className="w-4 h-4" />
            {isRTL ? 'الروابط' : 'Links'}
            <Badge variant="secondary" className="text-[10px] px-1.5">{formLinks.length}</Badge>
          </button>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-1" />
          {isRTL ? 'إنشاء رابط جديد' : 'Create New Link'}
        </Button>
      </div>

      {/* Patients Tab */}
      {activeTab === 'patients' && (
        <div className="space-y-3">
          {/* Search & Filter */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary`} />
                <Input
                  placeholder={isRTL ? 'البحث بالاسم أو الإيميل...' : 'Search by name or email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} bg-card/50 border-border/30 h-9`}
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-primary/30 rounded-lg bg-primary/5 text-foreground text-sm h-9 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">{isRTL ? 'الكل' : 'All'}</option>
              <option value="new">{isRTL ? 'جديد' : 'New'}</option>
              <option value="reviewed">{isRTL ? 'تمت المراجعة' : 'Reviewed'}</option>
            </select>
          </div>

          {/* Patient List */}
          {filteredPatients.length === 0 ? (
            <div className="glass-effect rounded-xl text-center py-8 border border-border/30">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-text-secondary text-sm">{isRTL ? 'لا يوجد مرضى بعد' : 'No patients yet'}</p>
            </div>
          ) : (
            filteredPatients.map((patient) => {
              const isExpanded = expandedPatients[patient.email];
              const newCount = patient.submissions.filter(s => s.status === 'submitted').length;

              return (
                <div key={patient.email} className="glass-effect rounded-xl border border-border/30 overflow-hidden">
                  {/* Patient Header */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedPatients(p => ({ ...p, [patient.email]: !p[patient.email] }))}
                  >
                    <div className="flex items-center justify-center w-6">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      patient.hasNewSubmissions ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
                      <p className="text-xs text-text-secondary truncate">{patient.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {newCount > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{newCount} {isRTL ? 'جديد' : 'new'}</Badge>}
                      <Badge variant="secondary" className="text-xs">{patient.submissions.length} {isRTL ? 'نموذج' : 'form(s)'}</Badge>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border/20">
                      <div className="p-3 bg-muted/10 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                        {patient.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{patient.phone}</span>}
                        {patient.age && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{patient.age} {isRTL ? 'سنة' : 'years'}</span>}
                        <div className={`flex gap-2 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); window.open(`mailto:${patient.email}`); }} className="h-7 px-2">
                            <Mail className="w-3.5 h-3.5 mr-1" />{isRTL ? 'إيميل' : 'Email'}
                          </Button>
                          {patient.hasNewSubmissions && (
                            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleMarkAllReviewedForPatient(patient.email); }} className="h-7 px-2 bg-gradient-to-r from-primary to-green-400 text-white">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />{isRTL ? 'مراجعة الكل' : 'Review All'}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Submissions List - CLICKABLE ROWS */}
                      <div className="divide-y divide-border/20">
                        {patient.submissions.map((sub) => {
                          const template = sub.form_template;
                          const Icon = formIcons[template?.name?.split(' ')[0]] || FileText;
                          const isNew = sub.status === 'submitted';

                          return (
                            <div
                              key={sub.id}
                              className={`flex items-center justify-between p-2.5 hover:bg-muted/20 transition-colors cursor-pointer ${isNew ? 'bg-yellow-500/5' : ''}`}
                              onClick={(e) => handleFormRowClick(sub, e)}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0 ml-6">
                                <div className={`p-1.5 rounded-lg ${isNew ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
                                  <Icon className={`w-3.5 h-3.5 ${isNew ? 'text-yellow-600' : 'text-primary'}`} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {isRTL ? (template?.name_ar || template?.name) : template?.name || 'Forms'}
                                  </p>
                                  <p className="text-[10px] text-text-secondary">
                                    {new Date(sub.created_at).toLocaleDateString(language)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isNew && (
                                  <Button size="sm" className="h-7 w-7 p-0 bg-primary text-white" onClick={(e) => { e.stopPropagation(); handleMarkReviewed(sub.id); }}>
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteSubmission(sub.id); }}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Links Tab - Mobile Optimized */}
      {activeTab === 'links' && (
        <div className="space-y-3">
          {formLinks.length === 0 ? (
            <div className="glass-effect rounded-xl text-center py-8 border border-border/30">
              <Link2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-text-secondary text-sm mb-3">{isRTL ? 'لا توجد روابط بعد' : 'No links yet'}</p>
              <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" />{isRTL ? 'إنشاء رابط' : 'Create Link'}
              </Button>
            </div>
          ) : (
            formLinks.map((link) => {
              const isExpanded = expandedLinks[link.id];
              const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
              const isMaxed = link.max_submissions && link.current_submissions >= link.max_submissions;
              const isActive = link.is_active && !isExpired && !isMaxed;
              const isArabicForm = link.description?.includes('العربية');

              return (
                <div key={link.id} className="glass-effect rounded-xl border border-border/30 overflow-hidden">
                  {/* Mobile-friendly header */}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedLinks(p => ({ ...p, [link.id]: !p[link.id] }))}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-6 flex-shrink-0">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-primary" /> : <ChevronRight className="w-4 h-4 text-text-secondary" />}
                      </div>
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Globe className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate flex items-center gap-2 flex-wrap">
                          <span className="truncate">{isRTL ? (link.title_ar || link.title) : (link.title || 'Patient Intake')}</span>
                          <Badge variant="outline" className="text-[10px] px-1 flex-shrink-0">{isArabicForm ? 'AR' : 'EN'}</Badge>
                        </p>
                        <p className="text-xs text-text-secondary font-mono truncate">/{link.link_code}</p>
                      </div>
                    </div>
                    {/* Badges - stack on mobile */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-9 sm:ml-0">
                      <Badge className={`text-[10px] px-1.5 ${
                        !link.is_active ? 'bg-muted text-muted-foreground' :
                        isExpired ? 'bg-red-500/10 text-red-600 border-red-500/30' :
                        isMaxed ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' :
                        'bg-primary/10 text-primary border-primary/30'
                      }`}>
                        {!link.is_active ? (isRTL ? 'معطل' : 'Inactive') :
                         isExpired ? (isRTL ? 'منتهي' : 'Expired') :
                         isMaxed ? (isRTL ? 'ممتلئ' : 'Full') :
                         (isRTL ? 'نشط' : 'Active')}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">{link.current_submissions || 0}</Badge>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border/20 p-3 bg-muted/10">
                      {/* Info grid - responsive */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 text-sm">
                        <div className="flex justify-between sm:block">
                          <span className="text-text-secondary text-xs">{isRTL ? 'تاريخ الإنشاء:' : 'Created:'}</span>
                          <p className="font-medium text-xs sm:text-sm">{new Date(link.created_at).toLocaleDateString(language)}</p>
                        </div>
                        {link.expires_at && (
                          <div className="flex justify-between sm:block">
                            <span className="text-text-secondary text-xs">{isRTL ? 'ينتهي في:' : 'Expires:'}</span>
                            <p className={`font-medium text-xs sm:text-sm ${isExpired ? 'text-red-600' : ''}`}>{new Date(link.expires_at).toLocaleDateString(language)}</p>
                          </div>
                        )}
                        {link.max_submissions && (
                          <div className="flex justify-between sm:block">
                            <span className="text-text-secondary text-xs">{isRTL ? 'الحد الأقصى:' : 'Limit:'}</span>
                            <p className="font-medium text-xs sm:text-sm">{link.current_submissions || 0}/{link.max_submissions}</p>
                          </div>
                        )}
                      </div>
                      {/* Buttons - responsive grid for mobile */}
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyToClipboard(link); }} className="h-9 sm:h-8 border-primary/30 text-primary text-xs sm:text-sm">
                          <Copy className="w-3.5 h-3.5 mr-1" />{isRTL ? 'نسخ' : 'Copy'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); window.open(`/patientinfo/${link.link_code}?lang=${isArabicForm ? 'ar' : 'en'}`, '_blank'); }} className="h-9 sm:h-8 text-xs sm:text-sm">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" />{isRTL ? 'فتح' : 'Open'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleToggleActive(link); }} className="h-9 sm:h-8 text-xs sm:text-sm">
                          {link.is_active ? <><XCircle className="w-3.5 h-3.5 mr-1" />{isRTL ? 'تعطيل' : 'Off'}</> : <><CheckCircle className="w-3.5 h-3.5 mr-1" />{isRTL ? 'تفعيل' : 'On'}</>}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteLink(link.id); }} className="h-9 sm:h-8 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm">
                          <Trash2 className="w-3.5 h-3.5 mr-1" />{isRTL ? 'حذف' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Create Link Modal - WITH LANGUAGE SWITCH */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              {isRTL ? 'إنشاء رابط جديد' : 'Create New Link'}
            </DialogTitle>
            <DialogDescription>{isRTL ? 'رابط لنماذج استقبال المرضى' : 'Link for patient intake forms'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            {/* LANGUAGE SWITCH */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-green-400/10 rounded-xl border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">{isRTL ? 'لغة النموذج' : 'Form Language'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${newLink.formLanguage === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>English</span>
                  <Switch
                    checked={newLink.formLanguage === 'ar'}
                    onCheckedChange={(checked) => setNewLink({ ...newLink, formLanguage: checked ? 'ar' : 'en' })}
                  />
                  <span className={`text-sm font-medium ${newLink.formLanguage === 'ar' ? 'text-primary' : 'text-muted-foreground'}`}>عربي</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {newLink.formLanguage === 'ar'
                  ? 'سيظهر النموذج بالكامل باللغة العربية للمريض'
                  : 'The form will appear entirely in English for the patient'}
              </p>
            </div>

            {/* Title field based on language */}
            <div>
              <label className="block text-xs font-medium mb-1">
                {newLink.formLanguage === 'ar' ? 'عنوان الرابط (عربي)' : 'Link Title (English)'}
              </label>
              <Input
                value={newLink.formLanguage === 'ar' ? newLink.title_ar : newLink.title}
                onChange={(e) => setNewLink({
                  ...newLink,
                  [newLink.formLanguage === 'ar' ? 'title_ar' : 'title']: e.target.value
                })}
                placeholder={newLink.formLanguage === 'ar' ? 'نماذج القبول' : 'Patient Intake'}
                dir={newLink.formLanguage === 'ar' ? 'rtl' : 'ltr'}
                className="h-9 bg-card/50 border-border/30"
              />
            </div>

            {/* Features Box */}
            <div className="p-3 bg-muted/30 rounded-xl border border-border/20">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {newLink.formLanguage === 'ar' ? 'يتضمن النموذج:' : 'Form Includes:'}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-text-secondary">
                {(newLink.formLanguage === 'ar'
                  ? ['معلومات المريض', 'تاريخ التمارين', 'التاريخ الصحي', 'التاريخ الطبي']
                  : ['Patient Info', 'Exercise History', 'Health History', 'Medical History']
                ).map((item, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-primary" />{item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">{isRTL ? 'ينتهي بعد (أيام)' : 'Expires after (days)'}</label>
                <Input
                  type="number"
                  value={newLink.expires_days}
                  onChange={(e) => setNewLink({ ...newLink, expires_days: e.target.value })}
                  placeholder={isRTL ? 'بدون حد' : 'No limit'}
                  className="h-9 bg-card/50 border-border/30"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{isRTL ? 'الحد الأقصى للاستجابات' : 'Max submissions'}</label>
                <Input
                  type="number"
                  value={newLink.max_submissions}
                  onChange={(e) => setNewLink({ ...newLink, max_submissions: e.target.value })}
                  placeholder={isRTL ? 'بدون حد' : 'No limit'}
                  className="h-9 bg-card/50 border-border/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleCreateLink} disabled={creating} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
              {isRTL ? 'إنشاء الرابط' : 'Create Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Submission Modal - Full Screen - NO duplicate export buttons inside */}
      <Dialog open={!!showSubmissionModal} onOpenChange={() => setShowSubmissionModal(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[95vh] flex flex-col p-0 gap-0">
          {/* Fixed Header */}
          <div className="p-4 border-b border-border/30 bg-card flex-shrink-0">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                {isRTL ? 'جميع إجابات المريض' : 'All Patient Responses'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {showSubmissionModal?.submitter_name} - {new Date(showSubmissionModal?.created_at).toLocaleDateString(language)}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          {showSubmissionModal && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Patient Info Card */}
              <div className="glass-effect rounded-xl p-4 border border-primary/30 bg-primary/5">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {isRTL ? 'معلومات المريض' : 'Patient Information'}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-text-secondary text-xs block">{isRTL ? 'الاسم الكامل' : 'Full Name'}</span><p className="font-semibold text-foreground">{showSubmissionModal.submitter_name}</p></div>
                  <div><span className="text-text-secondary text-xs block">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span><p className="font-medium text-foreground truncate">{showSubmissionModal.submitter_email}</p></div>
                  <div><span className="text-text-secondary text-xs block">{isRTL ? 'رقم الهاتف' : 'Phone'}</span><p className="font-medium text-foreground">{showSubmissionModal.submitter_phone || '-'}</p></div>
                  <div><span className="text-text-secondary text-xs block">{isRTL ? 'العمر' : 'Age'}</span><p className="font-medium text-foreground">{showSubmissionModal.submitter_age ? `${showSubmissionModal.submitter_age} ${isRTL ? 'سنة' : 'years'}` : '-'}</p></div>
                  <div><span className="text-text-secondary text-xs block">{isRTL ? 'العنوان' : 'Address'}</span><p className="font-medium text-foreground">{showSubmissionModal.submitter_address || '-'}</p></div>
                  <div><span className="text-text-secondary text-xs block">{isRTL ? 'تاريخ الإرسال' : 'Submitted'}</span><p className="font-medium text-foreground">{new Date(showSubmissionModal.created_at).toLocaleString(language)}</p></div>
                </div>
              </div>

              {/* Form Responses from Database Template */}
              <div className="space-y-4">
                {getAllFormSections(showSubmissionModal).map((form, formIdx) => (
                  <div key={formIdx} className="space-y-3">
                    {form.sections?.map((section, sIdx) => {
                      const responses = showSubmissionModal.responses || {};
                      return (
                        <div key={sIdx} className="glass-effect rounded-xl border border-border/30 overflow-hidden">
                          <div className="p-3 bg-primary text-white">
                            <h5 className="font-semibold text-sm">
                              {isRTL ? (section.title_ar || section.title) : section.title}
                            </h5>
                          </div>
                          <div className="p-3 space-y-1">
                            {section.questions?.map((q, qIdx) => {
                              const answer = responses[q.id];
                              const displayAnswer = answer === true ? (isRTL ? 'نعم' : 'Yes') : answer === false ? (isRTL ? 'لا' : 'No') : Array.isArray(answer) ? answer.join(', ') : answer || '—';
                              return (
                                <div key={qIdx} className={`flex justify-between items-start py-2 px-3 rounded-lg ${answer === true ? 'bg-green-50' : answer === false ? 'bg-red-50' : 'bg-muted/30'}`}>
                                  <span className="text-xs text-text-secondary flex-1 pr-3">{isRTL ? (q.label_ar || q.label) : q.label}</span>
                                  <span className={`text-xs font-medium text-right max-w-[50%] break-words ${answer === true ? 'text-green-600' : answer === false ? 'text-red-500' : 'text-foreground'}`}>
                                    {displayAnswer}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Show any extra responses not in template */}
                {(() => {
                  const templateQuestionIds = new Set();
                  getAllFormSections(showSubmissionModal).forEach(form => form.sections?.forEach(section => section.questions?.forEach(q => templateQuestionIds.add(q.id))));
                  const extraResponses = Object.entries(showSubmissionModal.responses || {}).filter(([key]) => !templateQuestionIds.has(key) && key !== 'signature');

                  if (extraResponses.length > 0) {
                    return (
                      <div className="glass-effect rounded-xl border border-border/30 overflow-hidden">
                        <div className="p-3 bg-muted/50">
                          <h5 className="font-semibold text-sm">{isRTL ? 'إجابات إضافية' : 'Additional Responses'}</h5>
                        </div>
                        <div className="p-3 space-y-1">
                          {extraResponses.map(([key, value], idx) => {
                            const displayValue = value === true ? (isRTL ? 'نعم' : 'Yes') : value === false ? (isRTL ? 'لا' : 'No') : Array.isArray(value) ? value.join(', ') : value || '—';
                            return (
                              <div key={idx} className={`flex justify-between items-start py-2 px-3 rounded-lg ${value === true ? 'bg-green-50' : value === false ? 'bg-red-50' : 'bg-muted/30'}`}>
                                <span className="text-xs text-text-secondary flex-1 pr-3 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="text-xs font-medium text-foreground">{displayValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Signature */}
              {showSubmissionModal.signature_data && (
                <div className="glass-effect rounded-xl p-4 border border-border/30">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {isRTL ? 'التوقيع' : 'Signature'}
                  </h4>
                  <img src={showSubmissionModal.signature_data} alt="Signature" className="max-w-[250px] h-auto border-2 border-border/30 rounded-xl bg-white p-2" />
                </div>
              )}
            </div>
          )}

          {/* Fixed Footer - ONLY export buttons here */}
          <div className="p-4 border-t border-border/30 bg-card flex-shrink-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportToPDF(showSubmissionModal)} className="border-primary/30 text-primary hover:bg-primary/10">
                  <Download className="w-4 h-4 mr-1" />PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportToExcel(showSubmissionModal)} className="border-green-500/30 text-green-600 hover:bg-green-500/10">
                  <FileSpreadsheet className="w-4 h-4 mr-1" />Excel
                </Button>
              </div>
              <div className="flex gap-2">
                {showSubmissionModal?.status === 'submitted' && (
                  <Button onClick={() => handleMarkReviewed(showSubmissionModal.id)} className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground">
                    <CheckCircle className="w-4 h-4 mr-1" />{isRTL ? 'تم المراجعة' : 'Mark Reviewed'}
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowSubmissionModal(null)}>{isRTL ? 'إغلاق' : 'Close'}</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
