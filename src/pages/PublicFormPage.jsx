import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
  Send,
  User,
  Mail,
  Phone,
  Leaf,
  Check,
  Edit3,
  Eye
} from 'lucide-react';

// Signature Pad Component
const SignaturePad = ({ value, onChange, label, required, isRTL }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      onChange(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-emerald-200 rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50">
        {isRTL ? 'مسح التوقيع' : 'Clear Signature'}
      </Button>
    </div>
  );
};

// Question Field Component
const QuestionField = ({ question, value, onChange, language }) => {
  const label = language === 'ar' ? (question.label_ar || question.label) : question.label;
  const isRTL = language === 'ar';

  const commonProps = {
    id: question.id,
    value: value || '',
    onChange: (e) => onChange(question.id, e.target.value),
    required: question.required,
    className: `w-full bg-white border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`,
    dir: isRTL ? 'rtl' : 'ltr'
  };

  switch (question.type) {
    case 'text':
    case 'tel':
    case 'phone':
    case 'email':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-gray-700">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Input type={question.type === 'phone' ? 'tel' : question.type} {...commonProps} />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-gray-700">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Input type="number" {...commonProps} />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-gray-700">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Input type="date" {...commonProps} />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-gray-700">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Textarea {...commonProps} rows={3} />
        </div>
      );

    case 'yes_no':
    case 'yesno':
      return (
        <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
          <span className="text-sm text-gray-700 flex-1 pr-4">
            {label} {question.required && <span className="text-red-500">*</span>}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={value === true || value === 'yes' ? 'default' : 'outline'}
              className={`min-w-[60px] ${value === true || value === 'yes' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-300 hover:bg-emerald-50'}`}
              onClick={() => onChange(question.id, true)}
            >
              {language === 'ar' ? 'نعم' : 'Yes'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={value === false || value === 'no' ? 'default' : 'outline'}
              className={`min-w-[60px] ${value === false || value === 'no' ? 'bg-red-500 hover:bg-red-600 text-white' : 'border-red-200 hover:bg-red-50'}`}
              onClick={() => onChange(question.id, false)}
            >
              {language === 'ar' ? 'لا' : 'No'}
            </Button>
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-gray-700">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <select
            {...commonProps}
            className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700"
          >
            <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
            {question.options?.map((opt, idx) => (
              <option key={idx} value={opt.value || opt}>
                {language === 'ar' ? (opt.label_ar || opt.label || opt) : (opt.label || opt)}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {question.options?.map((opt, idx) => {
              const optValue = opt.value || opt;
              const isSelected = selectedValues.includes(optValue);
              return (
                <button
                  key={idx}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  onClick={() => {
                    const newValue = isSelected
                      ? selectedValues.filter(v => v !== optValue)
                      : [...selectedValues, optValue];
                    onChange(question.id, newValue);
                  }}
                >
                  {language === 'ar' ? (opt.label_ar || opt.label || opt) : (opt.label || opt)}
                </button>
              );
            })}
          </div>
        </div>
      );

    case 'signature':
      return (
        <SignaturePad
          value={value}
          onChange={(sig) => onChange(question.id, sig)}
          label={label}
          required={question.required}
          isRTL={isRTL}
        />
      );

    default:
      return null;
  }
};

// Format value for display in review
const formatValueForDisplay = (question, value, language) => {
  if (value === undefined || value === null || value === '') return '-';

  if (question.type === 'yes_no' || question.type === 'yesno') {
    if (value === true || value === 'yes') return language === 'ar' ? 'نعم' : 'Yes';
    if (value === false || value === 'no') return language === 'ar' ? 'لا' : 'No';
  }

  if (question.type === 'select' && question.options) {
    const option = question.options.find(opt => (opt.value || opt) === value);
    if (option) return language === 'ar' ? (option.label_ar || option.label || option) : (option.label || option);
  }

  if (question.type === 'multiselect' && Array.isArray(value)) {
    return value.map(v => {
      const opt = question.options?.find(o => (o.value || o) === v);
      return opt ? (language === 'ar' ? (opt.label_ar || opt.label || opt) : (opt.label || opt)) : v;
    }).join(', ');
  }

  if (question.type === 'signature') return language === 'ar' ? 'تم التوقيع' : 'Signed';

  return value;
};

export default function PublicFormPage() {
  const { linkCode } = useParams();
  const { i18n } = useTranslation();
  const { sendPushToUser } = usePushNotifications();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formLink, setFormLink] = useState(null);
  const [formTemplate, setFormTemplate] = useState(null);
  const [nutritionistInfo, setNutritionistInfo] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form language from database
  const [formLanguage, setFormLanguage] = useState('en');
  const language = formLanguage;
  const isRTL = formLanguage === 'ar';

  // Submitter info
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitterPhone, setSubmitterPhone] = useState('');

  // Form state
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});

  // Section review state
  const [showSectionReview, setShowSectionReview] = useState(false);
  const [completedSections, setCompletedSections] = useState([]);

  useEffect(() => {
    fetchFormData();
  }, [linkCode]);

  const fetchFormData = async () => {
    try {
      const { data: linkData, error: linkError } = await supabase
        .from('public_form_links')
        .select('*, form_template:form_templates(*)')
        .eq('link_code', linkCode)
        .eq('is_active', true)
        .single();

      if (linkError || !linkData) {
        setError('Invalid or expired form link / رابط النموذج غير صالح أو منتهي الصلاحية');
        setLoading(false);
        return;
      }

      const storedLang = linkData.form_language || 'en';
      setFormLanguage(storedLang);

      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        setError(storedLang === 'ar' ? 'انتهت صلاحية هذا الرابط' : 'This link has expired');
        setLoading(false);
        return;
      }

      if (linkData.max_submissions && linkData.current_submissions >= linkData.max_submissions) {
        setError(storedLang === 'ar' ? 'تم الوصول إلى الحد الأقصى للتقديمات' : 'Maximum submissions reached');
        setLoading(false);
        return;
      }

      setFormLink(linkData);
      setFormTemplate(linkData.form_template);

      // Fetch nutritionist info
      const { data: nutInfo } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', linkData.nutritionist_id)
        .single();
      setNutritionistInfo(nutInfo);

    } catch (err) {
      console.error('Error fetching form:', err);
      setError('Error loading form / حدث خطأ في تحميل النموذج');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const validateContactInfo = () => {
    const newErrors = {};
    if (!submitterName.trim()) newErrors.name = true;
    if (!submitterEmail.trim() || !/\S+@\S+\.\S+/.test(submitterEmail)) newErrors.email = true;
    return Object.keys(newErrors).length === 0;
  };

  const validateSection = (sectionIndex) => {
    if (!formTemplate?.sections?.[sectionIndex]) return true;
    const newErrors = {};
    formTemplate.sections[sectionIndex].questions?.forEach(q => {
      if (q.required) {
        const value = responses[q.id];
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          newErrors[q.id] = true;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next - show review after each section
  const handleNext = () => {
    if (currentSection === 0) {
      if (!validateContactInfo()) return;
      // Mark contact info as complete and show review
      setShowSectionReview(true);
      return;
    }

    const sectionIndex = currentSection - 1;
    if (validateSection(sectionIndex)) {
      // Add to completed sections and show review
      if (!completedSections.includes(sectionIndex)) {
        setCompletedSections(prev => [...prev, sectionIndex]);
      }
      setShowSectionReview(true);
    }
  };

  // Continue to next section after review
  const handleContinueAfterReview = () => {
    setShowSectionReview(false);
    setCurrentSection(prev => prev + 1);
  };

  // Edit current section (go back from review)
  const handleEditSection = () => {
    setShowSectionReview(false);
  };

  const handlePrev = () => {
    setShowSectionReview(false);
    setCurrentSection(prev => prev - 1);
  };

  // Send email notification
  const sendNotificationEmail = async (toEmail, subject, htmlContent) => {
    try {
      const response = await fetch('https://greenofig.com/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          from: 'nutritionist@greenofig.com',
          subject: subject,
          html: htmlContent
        })
      });
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error sending email:', err);
      return false;
    }
  };

  // Generate nutritionist email HTML
  const generateNutritionistEmailHtml = () => {
    const formName = isRTL ? (formTemplate?.name_ar || formTemplate?.name) : formTemplate?.name;
    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981, #34d399); padding: 30px; text-align: center;">
            <img src="https://greenofig.com/logo.png" alt="GreenoFig" style="width: 60px; height: 60px; margin-bottom: 10px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GreenoFig</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">${isRTL ? 'نموذج جديد مستلم' : 'New Form Submission'}</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">${isRTL ? 'تفاصيل النموذج' : 'Form Details'}</h2>
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0;"><strong>${isRTL ? 'اسم النموذج:' : 'Form:'}</strong> ${formName}</p>
              <p style="margin: 0 0 10px 0;"><strong>${isRTL ? 'الاسم:' : 'Name:'}</strong> ${submitterName}</p>
              <p style="margin: 0 0 10px 0;"><strong>${isRTL ? 'البريد:' : 'Email:'}</strong> ${submitterEmail}</p>
              ${submitterPhone ? `<p style="margin: 0;"><strong>${isRTL ? 'الهاتف:' : 'Phone:'}</strong> ${submitterPhone}</p>` : ''}
            </div>
            <a href="https://greenofig.com/app/nutritionist/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981, #34d399); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              ${isRTL ? 'عرض في لوحة التحكم' : 'View in Dashboard'}
            </a>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">© ${new Date().getFullYear()} GreenoFig</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate customer welcome email HTML
  const generateCustomerWelcomeEmailHtml = () => {
    const formName = isRTL ? (formTemplate?.name_ar || formTemplate?.name) : formTemplate?.name;
    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981, #34d399); padding: 30px; text-align: center;">
            <img src="https://greenofig.com/logo.png" alt="GreenoFig" style="width: 60px; height: 60px; margin-bottom: 10px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">GreenoFig</h1>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">${isRTL ? `مرحباً ${submitterName}!` : `Welcome ${submitterName}!`}</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              ${isRTL
                ? `شكراً لإكمال نموذج "${formName}". لقد استلمنا معلوماتك بنجاح وسيتواصل معك أخصائي التغذية قريباً.`
                : `Thank you for completing the "${formName}" form. We have received your information and your nutritionist will contact you soon.`
              }
            </p>
            <div style="background: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #059669; font-weight: bold;">
                ${isRTL ? 'تم استلام النموذج بنجاح!' : 'Form Successfully Received!'}
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              ${isRTL
                ? 'إذا كانت لديك أي أسئلة، يرجى التواصل مع أخصائي التغذية الخاص بك.'
                : 'If you have any questions, please contact your nutritionist.'
              }
            </p>
          </div>
          <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">© ${new Date().getFullYear()} GreenoFig - ${isRTL ? 'منصة التغذية الذكية' : 'Smart Nutrition Platform'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleSubmit = async () => {
    const lastSectionIndex = (formTemplate?.sections?.length || 1) - 1;
    if (!validateSection(lastSectionIndex)) return;

    setSubmitting(true);
    try {
      const formName = isRTL ? (formTemplate?.name_ar || formTemplate?.name) : formTemplate?.name;

      // Create submission
      const { error: submitError } = await supabase
        .from('external_form_submissions')
        .insert({
          link_id: formLink.id,
          nutritionist_id: formLink.nutritionist_id,
          form_template_id: formTemplate.id,
          submitter_name: submitterName,
          submitter_email: submitterEmail,
          submitter_phone: submitterPhone,
          responses,
          signature_data: responses.signature || null,
          status: 'submitted'
        });

      if (submitError) throw submitError;

      // Update submission count
      await supabase
        .from('public_form_links')
        .update({ current_submissions: (formLink.current_submissions || 0) + 1 })
        .eq('id', formLink.id);

      // Send bell notification to nutritionist
      await supabase.from('notifications').insert({
        user_id: formLink.nutritionist_id,
        type: 'external_form_submitted',
        title: isRTL ? 'نموذج جديد مستلم' : 'New Form Submission',
        message: isRTL
          ? `قام ${submitterName} بتقديم نموذج "${formName}"`
          : `${submitterName} submitted the form: ${formName}`,
        is_read: false
      });

      // Send push notification to nutritionist
      try {
        await sendPushToUser(
          formLink.nutritionist_id,
          isRTL ? 'نموذج جديد مستلم' : 'New Form Submission',
          isRTL ? `قام ${submitterName} بتقديم نموذج "${formName}"` : `${submitterName} submitted: ${formName}`,
          { tag: 'form-submission', data: { type: 'external_form_submitted', url: '/app/nutritionist/dashboard' } }
        );
      } catch (pushErr) {
        console.error('Push notification error:', pushErr);
      }

      // Send email to nutritionist
      if (nutritionistInfo?.email) {
        await sendNotificationEmail(
          nutritionistInfo.email,
          isRTL ? `نموذج جديد من ${submitterName}` : `New Form Submission from ${submitterName}`,
          generateNutritionistEmailHtml()
        );
      }

      // Send welcome email to customer
      await sendNotificationEmail(
        submitterEmail,
        isRTL ? 'شكراً لإكمال النموذج - GreenoFig' : 'Thank You for Your Submission - GreenoFig',
        generateCustomerWelcomeEmailHtml()
      );

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(isRTL ? 'حدث خطأ في إرسال النموذج' : 'Error submitting form');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{isRTL ? 'خطأ' : 'Error'}</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    const formName = isRTL ? (formTemplate?.name_ar || formTemplate?.name) : formTemplate?.name;
    return (
      <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-emerald-100">
          <img src="https://greenofig.com/logo.png" alt="GreenoFig" className="w-16 h-16 mx-auto mb-4 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRTL ? 'تم الإرسال بنجاح!' : 'Successfully Submitted!'}
          </h1>
          <p className="text-gray-600 mb-4">
            {isRTL
              ? `شكراً لإكمال نموذج "${formName}". سيتواصل معك أخصائي التغذية قريباً.`
              : `Thank you for completing the "${formName}" form. Your nutritionist will contact you soon.`}
          </p>
          <div className="bg-emerald-50 rounded-xl p-4 mb-6">
            <p className="text-emerald-700 text-sm">
              {isRTL ? 'تم إرسال رسالة تأكيد إلى بريدك الإلكتروني' : 'A confirmation email has been sent to your inbox'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-emerald-600 pt-4 border-t border-emerald-100">
            <span className="font-bold text-lg">GreenoFig</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isRTL ? 'منصة التغذية والصحة الذكية' : 'Smart Nutrition & Health Platform'}
          </p>
        </div>
      </div>
    );
  }

  const sections = formTemplate?.sections || [];
  const totalSections = sections.length + 1; // +1 for contact info section
  const isLastSection = currentSection === totalSections - 1;
  const isFirstSection = currentSection === 0;

  const formTitle = isRTL ? (formTemplate?.name_ar || formTemplate?.name) : formTemplate?.name;
  const formDesc = isRTL ? (formTemplate?.description_ar || formTemplate?.description) : formTemplate?.description;

  // Get current section data for review
  const getCurrentSectionData = () => {
    if (currentSection === 0) {
      return {
        title: isRTL ? 'معلوماتك' : 'Your Information',
        items: [
          { label: isRTL ? 'الاسم الكامل' : 'Full Name', value: submitterName },
          { label: isRTL ? 'البريد الإلكتروني' : 'Email', value: submitterEmail },
          { label: isRTL ? 'رقم الهاتف' : 'Phone', value: submitterPhone || '-' }
        ]
      };
    }
    const section = sections[currentSection - 1];
    return {
      title: isRTL ? (section.title_ar || section.title) : section.title,
      items: section.questions?.map(q => ({
        label: isRTL ? (q.label_ar || q.label) : q.label,
        value: formatValueForDisplay(q, responses[q.id], language)
      })) || []
    };
  };

  // Section Review Screen
  if (showSectionReview) {
    const sectionData = getCurrentSectionData();
    return (
      <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="bg-white border-b-2 border-emerald-500 sticky top-0 z-10 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://greenofig.com/logo.png" alt="GreenoFig" className="w-10 h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                <div>
                  <h1 className="text-xl font-bold text-emerald-600">GreenoFig</h1>
                  <p className="text-xs text-gray-500">{isRTL ? 'مراجعة الإجابات' : 'Review Answers'}</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <Eye className="w-3 h-3 mr-1" />
                {isRTL ? 'مراجعة' : 'Review'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Review Card */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
              <div className="p-2 rounded-xl bg-emerald-100">
                <Check className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{sectionData.title}</h3>
                <p className="text-sm text-gray-500">
                  {isRTL ? 'راجع إجاباتك قبل المتابعة' : 'Review your answers before continuing'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {sectionData.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                  <span className="text-sm text-gray-900 text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleEditSection}
              className="flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Edit3 className="w-4 h-4" />
              {isRTL ? 'تعديل' : 'Edit'}
            </Button>

            {isLastSection ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isRTL ? 'إرسال النموذج' : 'Submit Form'}
              </Button>
            ) : (
              <Button
                onClick={handleContinueAfterReview}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
              >
                <Check className="w-4 h-4" />
                {isRTL ? 'تأكيد والمتابعة' : 'Confirm & Continue'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header - GreenoFig Branding */}
      <div className="bg-white border-b-2 border-emerald-500 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://greenofig.com/logo.png" alt="GreenoFig" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              <div>
                <h1 className="text-xl font-bold text-emerald-600">GreenoFig</h1>
                <p className="text-xs text-gray-500">{isRTL ? 'نموذج صحي احترافي' : 'Professional Health Form'}</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-medium text-emerald-700">{isRTL ? 'العربية' : 'English'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Form Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
            <Leaf className="w-4 h-4" />
            GreenoFig
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{formTitle}</h2>
          {formDesc && <p className="text-gray-600">{formDesc}</p>}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>{isRTL ? 'الخطوة' : 'Step'} {currentSection + 1} / {totalSections}</span>
            <span>{Math.round(((currentSection + 1) / totalSections) * 100)}%</span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }} />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-emerald-100 p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-bl-full" />

          {/* Contact Info Section */}
          {currentSection === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                <div className="p-2 rounded-xl bg-emerald-100">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{isRTL ? 'معلوماتك' : 'Your Information'}</h3>
                  <p className="text-sm text-gray-500">{isRTL ? 'يرجى إدخال بياناتك الشخصية' : 'Please enter your contact details'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                    <Input value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'} className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white border-emerald-200 focus:border-emerald-500`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                    <Input type="email" value={submitterEmail} onChange={(e) => setSubmitterEmail(e.target.value)} placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white border-emerald-200 focus:border-emerald-500`} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{isRTL ? 'رقم الهاتف' : 'Phone Number'}</label>
                  <div className="relative">
                    <Phone className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                    <Input type="tel" value={submitterPhone} onChange={(e) => setSubmitterPhone(e.target.value)} placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'} className={`${isRTL ? 'pr-10' : 'pl-10'} bg-white border-emerald-200 focus:border-emerald-500`} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Sections */}
          {currentSection > 0 && sections[currentSection - 1] && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                <div className="p-2 rounded-xl bg-emerald-100">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isRTL ? (sections[currentSection - 1].title_ar || sections[currentSection - 1].title) : sections[currentSection - 1].title}
                  </h3>
                  {sections[currentSection - 1].description && (
                    <p className="text-sm text-gray-500">
                      {isRTL ? (sections[currentSection - 1].description_ar || sections[currentSection - 1].description) : sections[currentSection - 1].description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {sections[currentSection - 1].questions?.map((question) => (
                  <div key={question.id} className={errors[question.id] ? 'ring-2 ring-red-300 rounded-xl p-3 -m-1 bg-red-50' : ''}>
                    <QuestionField question={question} value={responses[question.id]} onChange={handleChange} language={language} />
                    {errors[question.id] && (
                      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {isRTL ? 'هذا الحقل مطلوب' : 'This field is required'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={handlePrev} disabled={isFirstSection} className="flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isRTL ? 'السابق' : 'Previous'}
          </Button>

          <Button onClick={handleNext} className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg">
            {isRTL ? 'التالي' : 'Next'}
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src="https://greenofig.com/logo.png" alt="GreenoFig" className="w-6 h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="font-bold text-emerald-600">GreenoFig</span>
          </div>
          <p className="text-xs text-gray-400">{isRTL ? 'منصة التغذية والصحة الذكية' : 'Smart Nutrition & Health Platform'}</p>
        </div>
      </div>
    </div>
  );
}
