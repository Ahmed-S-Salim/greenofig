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
  MapPin,
  Calendar,
  Save,
  Heart,
  Activity,
  ClipboardList,
  Stethoscope,
  Check,
  X,
  Sparkles,
  Shield,
  Lock
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
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-primary/30 rounded-xl overflow-hidden bg-white shadow-inner">
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
      <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="text-xs border-primary/30 text-primary hover:bg-primary/10">
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
    className: `w-full bg-card/50 border-border/50 focus:border-primary focus:ring-primary rounded-xl shadow-sm text-foreground ${isRTL ? 'text-right' : 'text-left'}`,
    dir: isRTL ? 'rtl' : 'ltr'
  };

  switch (question.type) {
    case 'text':
    case 'tel':
    case 'phone':
    case 'email':
      return (
        <div className="space-y-2">
          <label htmlFor={question.id} className="block text-sm font-semibold text-foreground">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Input type={question.type === 'phone' ? 'tel' : question.type} {...commonProps} />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <label htmlFor={question.id} className="block text-sm font-semibold text-foreground">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Input type="number" {...commonProps} />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <label htmlFor={question.id} className="block text-sm font-semibold text-foreground">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Input type="date" {...commonProps} />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-2">
          <label htmlFor={question.id} className="block text-sm font-semibold text-foreground">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <Textarea {...commonProps} rows={3} />
        </div>
      );

    case 'yes_no':
    case 'yesno':
      return (
        <div className="flex items-center justify-between p-4 glass-effect rounded-xl border border-border/30">
          <span className="text-sm font-medium text-foreground flex-1 pr-4">
            {label} {question.required && <span className="text-red-500">*</span>}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={value === true || value === 'yes' ? 'default' : 'outline'}
              className={`min-w-[70px] rounded-xl transition-all ${value === true || value === 'yes' ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' : 'border-border/50 hover:bg-primary/10 hover:border-primary/30'}`}
              onClick={() => onChange(question.id, true)}
            >
              <Check className="w-4 h-4 mr-1" />
              {language === 'ar' ? 'نعم' : 'Yes'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={value === false || value === 'no' ? 'default' : 'outline'}
              className={`min-w-[70px] rounded-xl transition-all ${value === false || value === 'no' ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' : 'border-border/50 hover:bg-red-500/10 hover:border-red-500/30'}`}
              onClick={() => onChange(question.id, false)}
            >
              <X className="w-4 h-4 mr-1" />
              {language === 'ar' ? 'لا' : 'No'}
            </Button>
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <label htmlFor={question.id} className="block text-sm font-semibold text-foreground">
            {label} {question.required && <span className="text-red-500">*</span>}
          </label>
          <select
            {...commonProps}
            className="w-full p-3 bg-card/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-foreground shadow-sm"
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
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
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
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-card/50 text-foreground hover:bg-primary/10 border border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => {
                    const newValue = isSelected
                      ? selectedValues.filter(v => v !== optValue)
                      : [...selectedValues, optValue];
                    onChange(question.id, newValue);
                  }}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
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

// Form Section Icons
const getSectionIcon = (index) => {
  const icons = [Activity, Heart, Stethoscope, ClipboardList, FileText];
  const Icon = icons[index % icons.length];
  return <Icon className="w-5 h-5" />;
};

// Default Patient Intake Form Templates with Arabic Translations
const defaultIntakeTemplates = [
  {
    name: 'Exercise History',
    name_ar: 'تاريخ التمارين',
    sections: [
      {
        title: 'Exercise Habits',
        title_ar: 'عادات التمارين',
        questions: [
          { id: 'exercise_frequency', label: 'How often do you exercise?', label_ar: 'كم مرة تمارس الرياضة؟', type: 'select', options: [{value:'never',label:'Never',label_ar:'أبداً'},{value:'1-2',label:'1-2 times/week',label_ar:'1-2 مرات/أسبوع'},{value:'3-4',label:'3-4 times/week',label_ar:'3-4 مرات/أسبوع'},{value:'5+',label:'5+ times/week',label_ar:'5+ مرات/أسبوع'}], required: true },
          { id: 'exercise_types', label: 'Types of exercise you do', label_ar: 'أنواع التمارين التي تمارسها', type: 'textarea', required: false },
          { id: 'exercise_duration', label: 'Average workout duration (minutes)', label_ar: 'متوسط مدة التمرين (بالدقائق)', type: 'number', required: false },
          { id: 'fitness_goals', label: 'What are your fitness goals?', label_ar: 'ما هي أهدافك الرياضية؟', type: 'textarea', required: true },
          { id: 'gym_membership', label: 'Do you have a gym membership?', label_ar: 'هل لديك عضوية صالة رياضية؟', type: 'yes_no', required: false }
        ]
      }
    ]
  },
  {
    name: 'Health History',
    name_ar: 'التاريخ الصحي',
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
    name: 'Medical History',
    name_ar: 'التاريخ الطبي',
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
  },
  {
    name: 'Client Intake',
    name_ar: 'استقبال العميل',
    sections: [
      {
        title: 'Goals & Expectations',
        title_ar: 'الأهداف والتوقعات',
        questions: [
          { id: 'primary_goal', label: 'What is your primary health/fitness goal?', label_ar: 'ما هو هدفك الرئيسي للصحة/اللياقة؟', type: 'select', options: [{value:'lose_weight',label:'Lose Weight',label_ar:'إنقاص الوزن'},{value:'gain_muscle',label:'Build Muscle',label_ar:'بناء العضلات'},{value:'improve_health',label:'Improve Health',label_ar:'تحسين الصحة'},{value:'increase_energy',label:'Increase Energy',label_ar:'زيادة الطاقة'},{value:'other',label:'Other',label_ar:'أخرى'}], required: true },
          { id: 'goal_timeline', label: 'What is your goal timeline?', label_ar: 'ما هو الجدول الزمني لهدفك؟', type: 'select', options: [{value:'1_month',label:'1 month',label_ar:'شهر واحد'},{value:'3_months',label:'3 months',label_ar:'3 أشهر'},{value:'6_months',label:'6 months',label_ar:'6 أشهر'},{value:'1_year',label:'1 year',label_ar:'سنة واحدة'}], required: true },
          { id: 'motivation', label: 'What motivates you to achieve your goals?', label_ar: 'ما الذي يحفزك لتحقيق أهدافك؟', type: 'textarea', required: false },
          { id: 'previous_attempts', label: 'Have you tried to achieve this goal before?', label_ar: 'هل حاولت تحقيق هذا الهدف من قبل؟', type: 'yes_no', required: true },
          { id: 'challenges', label: 'What challenges do you face?', label_ar: 'ما هي التحديات التي تواجهها؟', type: 'textarea', required: false },
          { id: 'commitment_level', label: 'How committed are you (1-10)?', label_ar: 'ما مستوى التزامك (1-10)؟', type: 'number', required: true },
          { id: 'expectations', label: 'What do you expect from working with a nutritionist?', label_ar: 'ما الذي تتوقعه من العمل مع أخصائي التغذية؟', type: 'textarea', required: false }
        ]
      }
    ]
  }
];

export default function PatientIntakePage() {
  const { linkCode } = useParams();
  const { i18n } = useTranslation();
  const { sendPushToUser } = usePushNotifications();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [formLink, setFormLink] = useState(null);
  const [formTemplates, setFormTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [nutritionistInfo, setNutritionistInfo] = useState(null);
  const [formLanguage, setFormLanguage] = useState('en'); // Form language from database

  // Use form language from database, not app language
  const language = formLanguage;
  const isRTL = formLanguage === 'ar';

  // Patient Info
  const [patientInfo, setPatientInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    age: '',
    address: ''
  });

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : '';
  };

  const handleBirthDateChange = (e) => {
    const birthDate = e.target.value;
    const age = calculateAge(birthDate);
    setPatientInfo({ ...patientInfo, birthDate, age: age.toString() });
  };
  const [patientInfoComplete, setPatientInfoComplete] = useState(false);

  // Form sections state
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [completedForms, setCompletedForms] = useState([]);
  const [completedSectionsList, setCompletedSectionsList] = useState([]); // Track completed sections for review
  const [showSectionReview, setShowSectionReview] = useState(false); // Show review after each section
  const [currentSectionForReview, setCurrentSectionForReview] = useState(null); // Current section being reviewed
  const [errors, setErrors] = useState({});
  const [draftId, setDraftId] = useState(null);

  useEffect(() => {
    fetchFormData();
    loadDraft();
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
        setError(isRTL ? 'رابط النموذج غير صالح أو منتهي الصلاحية' : 'Invalid or expired form link');
        setLoading(false);
        return;
      }

      if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
        setError(isRTL ? 'انتهت صلاحية هذا الرابط' : 'This link has expired');
        setLoading(false);
        return;
      }

      if (linkData.max_submissions && linkData.current_submissions >= linkData.max_submissions) {
        setError(isRTL ? 'تم الوصول إلى الحد الأقصى للتقديمات' : 'Maximum submissions reached');
        setLoading(false);
        return;
      }

      setFormLink(linkData);

      // Set form language from database link (default to 'en')
      const storedLanguage = linkData.form_language || 'en';
      setFormLanguage(storedLanguage);

      // Use default intake templates with Arabic translations
      setFormTemplates(defaultIntakeTemplates);

      const { data: nutInfo } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', linkData.nutritionist_id)
        .single();

      setNutritionistInfo(nutInfo);
    } catch (err) {
      console.error('Error fetching form:', err);
      setError(isRTL ? 'حدث خطأ في تحميل النموذج' : 'Error loading form');
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    const savedDraftId = localStorage.getItem(`draft_${linkCode}`);
    if (savedDraftId) {
      try {
        const { data: draft } = await supabase
          .from('external_form_submissions')
          .select('*')
          .eq('id', savedDraftId)
          .eq('status', 'draft')
          .single();

        if (draft) {
          setDraftId(draft.id);
          setPatientInfo({
            fullName: draft.submitter_name || '',
            email: draft.submitter_email || '',
            phone: draft.submitter_phone || '',
            age: draft.submitter_age || '',
            address: draft.submitter_address || ''
          });
          setResponses(draft.responses || {});
          setCompletedForms(draft.completed_forms || []);
          if (draft.submitter_name && draft.submitter_email) {
            setPatientInfoComplete(true);
          }
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
    }
  };

  const handleChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const validatePatientInfo = () => {
    const newErrors = {};
    if (!patientInfo.fullName.trim()) newErrors.fullName = true;
    if (!patientInfo.email.trim() || !/\S+@\S+\.\S+/.test(patientInfo.email)) newErrors.email = true;
    if (!patientInfo.phone.trim()) newErrors.phone = true;
    if (!patientInfo.birthDate) newErrors.birthDate = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSection = () => {
    const currentForm = formTemplates[currentFormIndex];
    if (!currentForm?.sections?.[currentSectionIndex]) return true;

    const newErrors = {};
    currentForm.sections[currentSectionIndex].questions?.forEach(q => {
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

  const handlePatientInfoSubmit = () => {
    if (validatePatientInfo()) {
      setPatientInfoComplete(true);
      saveDraft();
    }
  };

  const handleNextSection = () => {
    if (validateSection()) {
      const currentForm = formTemplates[currentFormIndex];
      const currentSectionData = currentForm?.sections?.[currentSectionIndex];

      // Store current section for review
      if (currentSectionData) {
        setCurrentSectionForReview({
          formIndex: currentFormIndex,
          sectionIndex: currentSectionIndex,
          formName: currentForm.name,
          formNameAr: currentForm.name_ar,
          sectionTitle: currentSectionData.title,
          sectionTitleAr: currentSectionData.title_ar,
          questions: currentSectionData.questions,
          isLastSectionOfForm: currentSectionIndex >= currentForm.sections.length - 1,
          isLastForm: currentFormIndex >= formTemplates.length - 1
        });
        setShowSectionReview(true); // Show review after EACH section
      }
      saveDraft();
    }
  };

  const handleContinueAfterReview = () => {
    const reviewData = currentSectionForReview;
    setShowSectionReview(false);
    setCurrentSectionForReview(null);

    if (reviewData) {
      if (!reviewData.isLastSectionOfForm) {
        // Move to next section in same form
        setCurrentSectionIndex(prev => prev + 1);
      } else {
        // End of current form
        setCompletedForms(prev => [...prev, currentFormIndex]);
        if (!reviewData.isLastForm) {
          // Move to next form
          setCurrentFormIndex(prev => prev + 1);
          setCurrentSectionIndex(0);
        }
      }
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    } else if (currentFormIndex > 0) {
      setCurrentFormIndex(prev => prev - 1);
      const prevForm = formTemplates[currentFormIndex - 1];
      setCurrentSectionIndex(prevForm.sections.length - 1);
    }
  };

  const saveDraft = async () => {
    setSavingDraft(true);
    try {
      const draftData = {
        link_id: formLink.id,
        nutritionist_id: formLink.nutritionist_id,
        form_template_id: formTemplates[0]?.id,
        submitter_name: patientInfo.fullName,
        submitter_email: patientInfo.email,
        submitter_phone: patientInfo.phone,
        submitter_age: patientInfo.age,
        submitter_address: patientInfo.address,
        responses,
        completed_forms: completedForms,
        status: 'draft'
      };

      if (draftId) {
        await supabase
          .from('external_form_submissions')
          .update(draftData)
          .eq('id', draftId);
      } else {
        const { data: newDraft } = await supabase
          .from('external_form_submissions')
          .insert(draftData)
          .select()
          .single();

        if (newDraft) {
          setDraftId(newDraft.id);
          localStorage.setItem(`draft_${linkCode}`, newDraft.id);
        }
      }
    } catch (err) {
      console.error('Error saving draft:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  const sendNotificationEmail = async (toEmail, subject, htmlContent) => {
    try {
      // Use PHP endpoint on Hostinger for sending emails
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

      if (!response.ok) {
        throw new Error('Email sending failed');
      }

      const result = await response.json();
      console.log('Email sent:', result);
    } catch (err) {
      console.error('Error sending email:', err);
    }
  };

  // Generate email HTML for nutritionist notification
  const generateNutritionistEmailHtml = () => {
    const formattedDate = new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6BD55C, #4ade80); padding: 30px; text-align: center; }
          .header img { width: 60px; height: 60px; border-radius: 12px; margin-bottom: 10px; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .alert-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 15px; margin-bottom: 20px; }
          .alert-box h3 { color: #d97706; margin: 0 0 5px 0; }
          .patient-card { background: #f0fdf4; border: 2px solid #6BD55C; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
          .patient-card h3 { color: #16a34a; margin: 0 0 15px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #6b7280; font-size: 14px; }
          .info-value { color: #1f2937; font-weight: 600; }
          .cta-btn { display: inline-block; background: #6BD55C; color: #fff; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 20px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #6b7280; font-size: 12px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://greenofig.com/logo.png" alt="GreenoFig">
            <h1>GreenoFig</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h3>${isRTL ? '🔔 نموذج مريض جديد!' : '🔔 New Patient Intake!'}</h3>
              <p style="margin: 0; color: #92400e;">${isRTL ? 'قام مريض جديد بإكمال جميع نماذج القبول' : 'A new patient has completed all intake forms'}</p>
            </div>

            <div class="patient-card">
              <h3>${isRTL ? 'معلومات المريض' : 'Patient Information'}</h3>
              <div class="info-row">
                <span class="info-label">${isRTL ? 'الاسم' : 'Name'}</span>
                <span class="info-value">${patientInfo.fullName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                <span class="info-value">${patientInfo.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${isRTL ? 'الهاتف' : 'Phone'}</span>
                <span class="info-value">${patientInfo.phone}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${isRTL ? 'العمر' : 'Age'}</span>
                <span class="info-value">${patientInfo.age} ${isRTL ? 'سنة' : 'years'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">${isRTL ? 'تاريخ الإرسال' : 'Submitted'}</span>
                <span class="info-value">${formattedDate}</span>
              </div>
            </div>

            <p style="color: #374151;">${isRTL ? 'يرجى مراجعة النماذج المقدمة والتواصل مع المريض لتحديد موعد الاستشارة.' : 'Please review the submitted forms and contact the patient to schedule their consultation.'}</p>

            <center>
              <a href="https://greenofig.com/nutritionist/forms" class="cta-btn">
                ${isRTL ? 'عرض النماذج' : 'View Forms'}
              </a>
            </center>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GreenoFig - ${isRTL ? 'شريكك الغذائي الشخصي' : 'Your Personal Nutrition Partner'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Generate welcome email HTML for customer
  const generateCustomerWelcomeEmailHtml = () => {
    return `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #6BD55C, #4ade80); padding: 40px 30px; text-align: center; }
          .header img { width: 70px; height: 70px; border-radius: 12px; margin-bottom: 15px; }
          .header h1 { color: #fff; margin: 0 0 10px 0; font-size: 28px; }
          .header p { color: rgba(255,255,255,0.9); margin: 0; font-size: 16px; }
          .content { padding: 30px; }
          .success-icon { width: 80px; height: 80px; background: #f0fdf4; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
          .success-icon span { font-size: 40px; }
          h2 { color: #1f2937; text-align: center; margin: 0 0 10px 0; }
          .subtitle { color: #6b7280; text-align: center; margin-bottom: 30px; }
          .steps { background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
          .steps h3 { color: #6BD55C; margin: 0 0 15px 0; font-size: 16px; }
          .step { display: flex; align-items: flex-start; margin-bottom: 12px; }
          .step:last-child { margin-bottom: 0; }
          .step-num { width: 24px; height: 24px; background: #6BD55C; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-${isRTL ? 'left' : 'right'}: 12px; flex-shrink: 0; }
          .step-text { color: #4b5563; font-size: 14px; line-height: 1.5; }
          .contact-box { background: #eff6ff; border: 1px solid #3b82f6; border-radius: 12px; padding: 20px; text-align: center; }
          .contact-box h4 { color: #1d4ed8; margin: 0 0 10px 0; }
          .contact-box p { color: #1e40af; margin: 0; font-size: 14px; }
          .contact-box a { color: #1d4ed8; font-weight: 600; }
          .footer { background: #f9fafb; padding: 25px; text-align: center; border-top: 1px solid #e5e7eb; }
          .footer p { color: #6b7280; font-size: 12px; margin: 5px 0; }
          .social-links { margin-top: 15px; }
          .social-links a { color: #6BD55C; margin: 0 10px; text-decoration: none; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://greenofig.com/logo.png" alt="GreenoFig">
            <h1>GreenoFig</h1>
            <p>${isRTL ? 'شريكك الغذائي الشخصي' : 'Your Personal Nutrition Partner'}</p>
          </div>
          <div class="content">
            <div class="success-icon"><span>✓</span></div>
            <h2>${isRTL ? `مرحباً ${patientInfo.fullName}!` : `Welcome ${patientInfo.fullName}!`}</h2>
            <p class="subtitle">${isRTL ? 'شكراً لإكمال نماذج القبول الصحية' : 'Thank you for completing your health intake forms'}</p>

            <div class="steps">
              <h3>${isRTL ? '✨ الخطوات التالية:' : '✨ What happens next:'}</h3>
              <div class="step">
                <span class="step-num">1</span>
                <span class="step-text">${isRTL ? 'سيقوم أخصائي التغذية بمراجعة نماذجك بعناية' : 'Our nutritionist will carefully review your forms'}</span>
              </div>
              <div class="step">
                <span class="step-num">2</span>
                <span class="step-text">${isRTL ? 'سنتواصل معك خلال 24-48 ساعة لتحديد موعد الاستشارة' : "We'll contact you within 24-48 hours to schedule your consultation"}</span>
              </div>
              <div class="step">
                <span class="step-num">3</span>
                <span class="step-text">${isRTL ? 'ستحصل على خطة تغذية مخصصة لتحقيق أهدافك' : "You'll receive a personalized nutrition plan to achieve your goals"}</span>
              </div>
              <div class="step">
                <span class="step-num">4</span>
                <span class="step-text">${isRTL ? 'دعم متواصل ومتابعة طوال رحلتك الصحية' : 'Continuous support and follow-up throughout your health journey'}</span>
              </div>
            </div>

            <div class="contact-box">
              <h4>${isRTL ? '📧 هل لديك أسئلة؟' : '📧 Have questions?'}</h4>
              <p>${isRTL ? 'تواصل معنا على' : 'Contact us at'} <a href="mailto:nutritionist@greenofig.com">nutritionist@greenofig.com</a></p>
            </div>
          </div>
          <div class="footer">
            <p><strong>GreenoFig</strong></p>
            <p>${isRTL ? 'نحن متحمسون لمساعدتك في رحلتك نحو حياة صحية أفضل!' : "We're excited to help you on your journey to a healthier life!"}</p>
            <p>© ${new Date().getFullYear()} GreenoFig - greenofig.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleFinalSubmit = async () => {
    if (!validateSection()) return;

    setSubmitting(true);
    try {
      const submissionData = {
        link_id: formLink.id,
        nutritionist_id: formLink.nutritionist_id,
        form_template_id: formTemplates[0]?.id,
        submitter_name: patientInfo.fullName,
        submitter_email: patientInfo.email,
        submitter_phone: patientInfo.phone,
        submitter_age: patientInfo.age,
        submitter_address: patientInfo.address,
        responses,
        completed_forms: [...completedForms, currentFormIndex],
        signature_data: responses.signature || null,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      };

      if (draftId) {
        await supabase.from('external_form_submissions').update(submissionData).eq('id', draftId);
      } else {
        await supabase.from('external_form_submissions').insert(submissionData);
      }

      await supabase.from('public_form_links').update({ current_submissions: (formLink.current_submissions || 0) + 1 }).eq('id', formLink.id);
      localStorage.removeItem(`draft_${linkCode}`);

      // Create bell notification for nutritionist
      await supabase.from('notifications').insert({
        user_id: formLink.nutritionist_id,
        type: 'patient_intake_submitted',
        title: isRTL ? 'تم استلام نماذج مريض جديد' : 'New Patient Intake Submitted',
        message: isRTL ? `قام ${patientInfo.fullName} بتقديم جميع نماذج القبول` : `${patientInfo.fullName} has submitted all intake forms`,
        is_read: false,
        data: { patient_name: patientInfo.fullName, patient_email: patientInfo.email }
      });

      // Send push notification to nutritionist
      try {
        await sendPushToUser(
          formLink.nutritionist_id,
          isRTL ? 'نماذج مريض جديد!' : 'New Patient Intake!',
          isRTL ? `${patientInfo.fullName} أكمل جميع نماذج القبول` : `${patientInfo.fullName} completed all intake forms`,
          { data: { type: 'patient_intake', url: '/nutritionist/forms' } }
        );
      } catch (pushErr) {
        console.error('Push notification error:', pushErr);
      }

      // Send email notification to nutritionist (nutritionist@greenofig.com)
      try {
        await sendNotificationEmail(
          'nutritionist@greenofig.com',
          isRTL ? `نموذج مريض جديد: ${patientInfo.fullName}` : `New Patient Intake: ${patientInfo.fullName}`,
          generateNutritionistEmailHtml()
        );
      } catch (emailErr) {
        console.error('Nutritionist email error:', emailErr);
      }

      // Send welcome email to customer from nutritionist@greenofig.com
      try {
        await sendNotificationEmail(
          patientInfo.email,
          isRTL ? 'مرحباً بك في GreenoFig! تم استلام نماذجك' : 'Welcome to GreenoFig! Your forms have been received',
          generateCustomerWelcomeEmailHtml()
        );
      } catch (emailErr) {
        console.error('Customer email error:', emailErr);
      }

      setSuccess(true);
    } catch (err) {
      console.error('Error submitting forms:', err);
      setError(isRTL ? 'حدث خطأ في إرسال النماذج' : 'Error submitting forms');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state - Dark theme matching GreenoFig
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
        <div className="text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="GreenoFig" className="w-12 h-12 animate-pulse" />
            <span className="text-2xl font-extrabold tracking-tight gradient-text">GreenoFig</span>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-text-secondary">{isRTL ? 'جاري تحميل النماذج...' : 'Loading your forms...'}</p>
        </div>
      </div>
    );
  }

  // Error state - Dark theme matching GreenoFig
  if (error && !success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
        <div className="max-w-md w-full glass-effect rounded-2xl shadow-2xl p-8 text-center border border-border/30 relative z-10">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">{isRTL ? 'عذراً' : 'Oops!'}</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="GreenoFig" className="w-8 h-8" />
            <span className="text-lg font-extrabold gradient-text">GreenoFig</span>
          </div>
        </div>
      </div>
    );
  }

  // Success state - Dark theme matching GreenoFig
  if (success) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>
        <div className="max-w-lg w-full glass-effect rounded-2xl shadow-2xl overflow-hidden border border-border/30 relative z-10">
          <div className="bg-gradient-to-r from-primary to-green-400 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <CheckCircle className="w-14 h-14 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isRTL ? 'تم الإرسال بنجاح!' : 'Successfully Submitted!'}
              </h1>
              <p className="text-white/90">
                {isRTL ? 'شكراً لك على إكمال جميع النماذج' : 'Thank you for completing all the forms'}
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="glass-effect rounded-xl p-4 mb-6 border border-border/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isRTL ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {isRTL ? `أرسلنا رسالة تأكيد إلى ${patientInfo.email}` : `We sent a confirmation to ${patientInfo.email}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {isRTL ? 'ماذا بعد؟' : "What's Next?"}
              </h4>
              <div className="space-y-2 text-sm">
                {[
                  isRTL ? 'سيقوم فريقنا بمراجعة نماذجك بعناية' : 'Our team will carefully review your forms',
                  isRTL ? 'سنتواصل معك لتحديد موعد الاستشارة' : "We'll contact you to schedule your consultation",
                  isRTL ? 'ابدأ رحلتك نحو حياة صحية أفضل معنا' : 'Start your journey to a healthier life with us',
                  isRTL ? 'ستحصل على خطة تغذية مخصصة لك' : "You'll receive a personalized nutrition plan",
                  isRTL ? 'دعم متواصل طوال رحلتك الصحية' : 'Continuous support throughout your health journey'
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 glass-effect rounded-xl border border-border/20">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">{i + 1}</span>
                    </div>
                    <p className="text-text-secondary">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-4 border-t border-border/30">
              <img src="/logo.png" alt="GreenoFig" className="w-8 h-8" />
              <span className="text-lg font-extrabold gradient-text">GreenoFig</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Patient Info Page - Dark theme matching GreenoFig
  if (!patientInfoComplete) {
    return (
      <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

        {/* Header - Glass Style */}
        <header className="sticky top-0 z-50">
          <div className="glass-effect border-b border-border/30 shadow-lg">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="GreenoFig" className="w-10 h-10" />
                <div>
                  <span className="text-xl font-extrabold tracking-tight gradient-text">GreenoFig</span>
                  <p className="text-xs text-text-secondary">{isRTL ? 'نموذج معلومات المريض' : 'Patient Information Form'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4 border border-primary/20">
              <Shield className="w-4 h-4" />
              {isRTL ? 'معلوماتك آمنة ومحمية' : 'Your information is safe & secure'}
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {isRTL ? 'مرحباً بك!' : 'Welcome!'}
            </h2>
            <p className="text-text-secondary max-w-md mx-auto">
              {isRTL
                ? 'يرجى تعبئة معلوماتك الشخصية للبدء في إكمال نماذج القبول الصحية'
                : 'Please fill in your personal information to start completing your health intake forms'}
            </p>
          </div>

          {/* Patient Info Card */}
          <div className="glass-effect rounded-2xl shadow-xl border border-border/30 p-8 mb-6">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border/30">
              <div className="p-3 rounded-xl bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {isRTL ? 'معلوماتك الشخصية' : 'Your Personal Information'}
                </h3>
                <p className="text-sm text-text-secondary">
                  {isRTL ? 'جميع الحقول مطلوبة' : 'All fields are required'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <Input
                  value={patientInfo.fullName}
                  onChange={(e) => setPatientInfo({...patientInfo, fullName: e.target.value})}
                  placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  className={`w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary ${errors.fullName ? 'border-red-500' : ''}`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{isRTL ? 'هذا الحقل مطلوب' : 'This field is required'}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={patientInfo.email}
                  onChange={(e) => setPatientInfo({...patientInfo, email: e.target.value})}
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  className={`w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{isRTL ? 'بريد إلكتروني غير صالح' : 'Invalid email address'}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  value={patientInfo.phone}
                  onChange={(e) => setPatientInfo({...patientInfo, phone: e.target.value})}
                  placeholder={isRTL ? 'رقم الهاتف' : 'Phone'}
                  className={`w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>

              {/* Birth Date & Age */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRTL ? 'تاريخ الميلاد' : 'Date of Birth'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Input
                      type="date"
                      value={patientInfo.birthDate}
                      onChange={handleBirthDateChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary ${errors.birthDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {patientInfo.age && (
                    <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-md text-primary font-medium whitespace-nowrap">
                      {isRTL ? `${patientInfo.age} سنة` : `${patientInfo.age} years`}
                    </div>
                  )}
                </div>
                {errors.birthDate && <p className="text-red-500 text-xs mt-1">{isRTL ? 'هذا الحقل مطلوب' : 'This field is required'}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isRTL ? 'العنوان' : 'Address'}
                </label>
                <Input
                  value={patientInfo.address}
                  onChange={(e) => setPatientInfo({...patientInfo, address: e.target.value})}
                  placeholder={isRTL ? 'أدخل عنوانك' : 'Enter your address'}
                  className="w-full bg-background border border-border rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Forms Overview */}
          <div className="glass-effect rounded-xl p-6 mb-8 border border-border/30">
            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {isRTL ? 'النماذج التي ستقوم بتعبئتها:' : 'Forms you will complete:'}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {['Exercise History', 'Health History', 'Medical History', 'Client Intake'].map((form, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    {getSectionIcon(idx)}
                  </div>
                  <span className="text-sm font-medium text-foreground">{form}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handlePatientInfoSubmit}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg"
          >
            {isRTL ? 'متابعة إلى النماذج' : 'Continue to Forms'}
            {isRTL ? <ChevronLeft className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 ml-2" />}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-text-secondary">
            <Lock className="w-4 h-4" />
            {isRTL ? 'معلوماتك مشفرة وآمنة' : 'Your information is encrypted and secure'}
          </div>
        </div>
      </div>
    );
  }

  // Forms Section View - Dark theme matching GreenoFig
  const currentForm = formTemplates[currentFormIndex];
  const currentSection = currentForm?.sections?.[currentSectionIndex];
  const totalSections = formTemplates.reduce((acc, f) => acc + (f.sections?.length || 0), 0);
  const completedSectionsCount = completedForms.reduce((acc, fIdx) => acc + (formTemplates[fIdx]?.sections?.length || 0), 0) + currentSectionIndex;
  const isLastSection = currentFormIndex === formTemplates.length - 1 && currentSectionIndex === (currentForm?.sections?.length || 1) - 1;
  const isFirstSection = currentFormIndex === 0 && currentSectionIndex === 0;

  // Section Review View - Show answers for the CURRENT section only before moving to next
  if (showSectionReview && currentSectionForReview) {
    const reviewSection = currentSectionForReview;
    const isLastSection = reviewSection.isLastSectionOfForm && reviewSection.isLastForm;

    return (
      <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

        <header className="sticky top-0 z-50">
          <div className="glass-effect border-b border-border/30 shadow-lg">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="GreenoFig" className="w-8 h-8" />
                <div>
                  <span className="text-lg font-extrabold tracking-tight gradient-text">GreenoFig</span>
                  <p className="text-xs text-text-secondary">{patientInfo.fullName}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-6 relative z-10">
          {/* Review Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-3">
              <CheckCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {isRTL ? 'مراجعة إجاباتك' : 'Review Your Answers'}
            </h2>
            <p className="text-sm text-text-secondary">
              {isRTL
                ? `${reviewSection.sectionTitleAr || reviewSection.sectionTitle}`
                : `${reviewSection.sectionTitle}`}
            </p>
          </div>

          {/* Current Section Answers Only */}
          <div className="glass-effect rounded-2xl border border-border/30 overflow-hidden mb-6">
            <div className="p-4 bg-primary/5 border-b border-border/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  {getSectionIcon(reviewSection.sectionIndex)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isRTL ? (reviewSection.sectionTitleAr || reviewSection.sectionTitle) : reviewSection.sectionTitle}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {isRTL ? (reviewSection.formNameAr || reviewSection.formName) : reviewSection.formName}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {reviewSection.questions?.map((q, qIdx) => {
                const answer = responses[q.id];
                // Skip showing signature as base64 - show "Signed" instead
                if (q.type === 'signature') {
                  return (
                    <div key={qIdx} className="flex justify-between items-center py-2 px-3 rounded-lg bg-green-500/10 border-b border-border/10 last:border-0">
                      <span className="text-sm text-text-secondary">
                        {isRTL ? (q.label_ar || q.label) : q.label}
                      </span>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {answer ? (isRTL ? 'تم التوقيع' : 'Signed') : (isRTL ? 'لم يتم التوقيع' : 'Not signed')}
                      </span>
                    </div>
                  );
                }

                const displayAnswer = answer === true
                  ? (isRTL ? 'نعم' : 'Yes')
                  : answer === false
                    ? (isRTL ? 'لا' : 'No')
                    : Array.isArray(answer)
                      ? answer.join(', ')
                      : answer || (isRTL ? '—' : '—');

                const bgColor = answer === true ? 'bg-green-500/10' : answer === false ? 'bg-red-500/10' : 'bg-muted/30';

                return (
                  <div key={qIdx} className={`flex justify-between items-start py-2 px-3 rounded-lg ${bgColor}`}>
                    <span className="text-sm text-text-secondary flex-1 pr-3">
                      {isRTL ? (q.label_ar || q.label) : q.label}
                    </span>
                    <span className={`text-sm font-medium text-right max-w-[50%] break-words ${
                      answer === true ? 'text-green-600' : answer === false ? 'text-red-500' : 'text-foreground'
                    }`}>
                      {displayAnswer}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Info */}
          <div className="glass-effect rounded-xl border border-border/20 p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {isRTL ? 'التقدم:' : 'Progress:'}
              </span>
              <span className="font-medium text-primary">
                {isRTL
                  ? `القسم ${reviewSection.sectionIndex + 1} من ${formTemplates[reviewSection.formIndex]?.sections?.length || 1}`
                  : `Section ${reviewSection.sectionIndex + 1} of ${formTemplates[reviewSection.formIndex]?.sections?.length || 1}`}
              </span>
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            {isLastSection ? (
              <Button
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-8 h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                {isRTL ? 'إرسال جميع النماذج' : 'Submit All Forms'}
              </Button>
            ) : (
              <Button
                onClick={handleContinueAfterReview}
                className="px-8 h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg"
              >
                {reviewSection.isLastSectionOfForm
                  ? (isRTL ? 'متابعة إلى النموذج التالي' : 'Continue to Next Form')
                  : (isRTL ? 'متابعة إلى القسم التالي' : 'Continue to Next Section')}
                {isRTL ? <ChevronLeft className="w-5 h-5 mr-2" /> : <ChevronRight className="w-5 h-5 ml-2" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

      {/* Header - Glass Style */}
      <header className="sticky top-0 z-50">
        <div className="glass-effect border-b border-border/30 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="GreenoFig" className="w-8 h-8" />
                <div>
                  <span className="text-lg font-extrabold tracking-tight gradient-text">GreenoFig</span>
                  <p className="text-xs text-text-secondary">{patientInfo.fullName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={saveDraft}
                disabled={savingDraft}
                className="text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                {savingDraft ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                {isRTL ? 'حفظ' : 'Save Draft'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 relative z-10">
        {/* Forms Progress Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {formTemplates.map((form, idx) => {
            const isCompleted = completedForms.includes(idx);
            const isCurrent = idx === currentFormIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${
                  isCompleted
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : isCurrent
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                      : 'bg-card/50 text-text-secondary border-border/30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                )}
                <span className="text-sm font-medium">
                  {isRTL ? (form.name_ar?.split(' ')[0] || form.name.split(' ')[0]) : form.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Section Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-foreground">
              {isRTL ? (currentForm?.name_ar || currentForm?.name) : currentForm?.name}
            </span>
            <span className="text-primary font-semibold">
              {Math.round((completedSectionsCount / totalSections) * 100)}%
            </span>
          </div>
          <div className="w-full bg-card/50 rounded-full h-2.5 overflow-hidden border border-border/30">
            <div
              className="bg-gradient-to-r from-primary to-green-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(completedSectionsCount / totalSections) * 100}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2">
            {isRTL ? `القسم ${currentSectionIndex + 1} من ${currentForm?.sections?.length || 1}` : `Section ${currentSectionIndex + 1} of ${currentForm?.sections?.length || 1}`}
          </p>
        </div>

        {/* Current Section Card */}
        <div className="glass-effect rounded-2xl shadow-xl border border-border/30 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-border/30">
            <div className="p-3 rounded-xl bg-primary/10">
              {getSectionIcon(currentSectionIndex)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {isRTL
                  ? (currentSection?.title_ar || currentSection?.title)
                  : currentSection?.title}
              </h3>
              {currentSection?.description && (
                <p className="text-sm text-text-secondary mt-1">
                  {isRTL
                    ? (currentSection?.description_ar || currentSection?.description)
                    : currentSection?.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            {currentSection?.questions?.map((question) => (
              <div
                key={question.id}
                className={errors[question.id] ? 'ring-2 ring-red-500/30 rounded-xl p-4 -m-2 bg-red-500/5' : ''}
              >
                <QuestionField
                  question={question}
                  value={responses[question.id]}
                  onChange={handleChange}
                  language={language}
                />
                {errors[question.id] && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {isRTL ? 'هذا الحقل مطلوب' : 'This field is required'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevSection}
            disabled={isFirstSection}
            className="flex items-center gap-2 border-border/50 text-foreground hover:bg-card/50 rounded-xl px-6 h-12"
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {isRTL ? 'السابق' : 'Previous'}
          </Button>

          {isLastSection ? (
            <Button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl px-8 h-12 text-base font-semibold"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isRTL ? 'إرسال جميع النماذج' : 'Submit All Forms'}
            </Button>
          ) : (
            <Button
              onClick={handleNextSection}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-xl px-6 h-12"
            >
              {isRTL ? 'التالي' : 'Next'}
              {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          )}
        </div>

        {/* Auto-save indicator */}
        {savingDraft && (
          <div className="fixed bottom-4 right-4 flex items-center gap-2 glass-effect px-4 py-2 rounded-full shadow-lg text-sm text-primary border border-primary/20">
            <Loader2 className="w-4 h-4 animate-spin" />
            {isRTL ? 'جاري الحفظ...' : 'Saving...'}
          </div>
        )}
      </div>
    </div>
  );
}
