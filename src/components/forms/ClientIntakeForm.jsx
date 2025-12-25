import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Loader2,
  Save,
  Send,
  X,
  ClipboardList
} from 'lucide-react';

// Signature Pad Component
const SignaturePad = ({ value, onChange, label, required, isRTL }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'var(--foreground)';
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
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="border-2 border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm">
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
      <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="text-xs">
        {isRTL ? 'مسح التوقيع' : 'Clear Signature'}
      </Button>
    </div>
  );
};

// Question Renderer Component
const QuestionField = ({ question, value, onChange, language }) => {
  const label = language === 'ar' ? (question.label_ar || question.label) : question.label;
  const isRTL = language === 'ar';

  const commonProps = {
    id: question.id,
    value: value || '',
    onChange: (e) => onChange(question.id, e.target.value),
    required: question.required,
    className: `w-full bg-card/50 border-border/50 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`,
    dir: isRTL ? 'rtl' : 'ltr'
  };

  switch (question.type) {
    case 'text':
    case 'tel':
    case 'email':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          <Input type={question.type} {...commonProps} />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          <Input type="number" {...commonProps} min="0" max="150" />
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          <Input type="date" {...commonProps} />
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <label htmlFor={question.id} className="block text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          <Textarea {...commonProps} rows={3} />
        </div>
      );

    case 'yesno':
      return (
        <div className="flex items-center justify-between p-3 sm:p-4 glass-effect rounded-xl border border-border/30">
          <span className="text-sm text-foreground flex-1 pr-4">
            {label} {question.required && <span className="text-destructive">*</span>}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={value === true ? 'default' : 'outline'}
              className={`min-w-[60px] ${value === true ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'hover:bg-primary/10'}`}
              onClick={() => onChange(question.id, true)}
            >
              {language === 'ar' ? 'نعم' : 'Yes'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={value === false ? 'default' : 'outline'}
              className={`min-w-[60px] ${value === false ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'hover:bg-destructive/10'}`}
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
          <label htmlFor={question.id} className="block text-sm font-medium text-foreground">
            {label} {question.required && <span className="text-destructive">*</span>}
          </label>
          <select
            {...commonProps}
            className="w-full p-2.5 bg-card/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all"
          >
            <option value="">{language === 'ar' ? 'اختر...' : 'Select...'}</option>
            {question.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {language === 'ar' ? (opt.label_ar || opt.label) : opt.label}
              </option>
            ))}
          </select>
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

    case 'medication_list':
      return (
        <MedicationList
          value={value || []}
          onChange={(meds) => onChange(question.id, meds)}
          label={label}
          language={language}
        />
      );

    default:
      return null;
  }
};

// Medication List Component
const MedicationList = ({ value, onChange, label, language }) => {
  const [medications, setMedications] = useState(value || []);
  const isRTL = language === 'ar';

  const addMedication = () => {
    const newMeds = [...medications, { name: '', dosage: '', condition: '' }];
    setMedications(newMeds);
    onChange(newMeds);
  };

  const updateMedication = (index, field, val) => {
    const newMeds = [...medications];
    newMeds[index][field] = val;
    setMedications(newMeds);
    onChange(newMeds);
  };

  const removeMedication = (index) => {
    const newMeds = medications.filter((_, i) => i !== index);
    setMedications(newMeds);
    onChange(newMeds);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {medications.map((med, index) => (
        <div key={index} className="flex gap-2 items-center p-2 glass-effect rounded-lg">
          <Input
            placeholder={isRTL ? 'اسم الدواء' : 'Medication name'}
            value={med.name}
            onChange={(e) => updateMedication(index, 'name', e.target.value)}
            className="flex-1 bg-card/50"
          />
          <Input
            placeholder={isRTL ? 'الجرعة' : 'Dosage'}
            value={med.dosage}
            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
            className="w-24 bg-card/50"
          />
          <Input
            placeholder={isRTL ? 'الحالة' : 'Condition'}
            value={med.condition}
            onChange={(e) => updateMedication(index, 'condition', e.target.value)}
            className="flex-1 bg-card/50"
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeMedication(index)} className="hover:bg-destructive/10">
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addMedication} className="hover:bg-primary/10">
        {isRTL ? '+ إضافة دواء' : '+ Add Medication'}
      </Button>
    </div>
  );
};

// Main Form Component
export default function ClientIntakeForm({
  assignmentId,
  formTemplate,
  onComplete,
  onClose,
  readOnly = false,
  existingResponses = null,
  isModal = false
}) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const language = i18n.language;
  const isRTL = language === 'ar';

  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState(existingResponses || {});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const sections = formTemplate?.sections || [];
  const currentSectionData = sections[currentSection];
  const isLastSection = currentSection === sections.length - 1;
  const isFirstSection = currentSection === 0;

  const handleChange = (questionId, value) => {
    if (readOnly) return;
    setResponses(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: null }));
    }
  };

  const validateSection = () => {
    const newErrors = {};
    currentSectionData.questions.forEach(q => {
      if (q.required) {
        const value = responses[q.id];
        if (value === undefined || value === null || value === '') {
          newErrors[q.id] = true;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection()) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentSection(prev => prev - 1);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await supabase
        .from('form_assignments')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('id', assignmentId);

      const { error } = await supabase
        .from('form_responses')
        .upsert({
          assignment_id: assignmentId,
          client_id: user.id,
          responses,
          updated_at: new Date().toISOString()
        }, { onConflict: 'assignment_id' });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateSection()) return;

    setLoading(true);
    try {
      const { error: responseError } = await supabase
        .from('form_responses')
        .upsert({
          assignment_id: assignmentId,
          client_id: user.id,
          responses,
          signed_at: responses.signature ? new Date().toISOString() : null,
          signature_data: responses.signature || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'assignment_id' });

      if (responseError) throw responseError;

      const { error: assignmentError } = await supabase
        .from('form_assignments')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', assignmentId);

      if (assignmentError) throw assignmentError;

      onComplete?.();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const shouldShowQuestion = (question) => {
    if (!question.conditional) return true;
    const { field, value } = question.conditional;
    return responses[field] === value;
  };

  const formTitle = isRTL ? (formTemplate?.name_ar || formTemplate?.name) : formTemplate?.name;
  const sectionTitle = isRTL
    ? (currentSectionData?.title_ar || currentSectionData?.title)
    : currentSectionData?.title;

  const FormContent = () => (
    <div className={`${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm text-text-secondary">
          <span>{isRTL ? 'القسم' : 'Section'} {currentSection + 1} / {sections.length}</span>
          <span>{Math.round(((currentSection + 1) / sections.length) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-green-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section Navigation Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(index)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm whitespace-nowrap transition-all duration-200 font-medium ${
              index === currentSection
                ? 'bg-gradient-to-r from-primary to-green-400 text-primary-foreground shadow-lg'
                : index < currentSection
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {index < currentSection && <CheckCircle className="w-3 h-3 inline mr-1" />}
            {isRTL ? (section.title_ar || section.title) : section.title}
          </button>
        ))}
      </div>

      {/* Current Section */}
      <div className="glass-effect rounded-2xl p-4 sm:p-6 border border-border/30 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
          <div className="p-2 rounded-xl bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{sectionTitle}</h3>
            {currentSectionData?.description && (
              <p className="text-sm text-text-secondary mt-0.5">
                {isRTL ? (currentSectionData.description_ar || currentSectionData.description) : currentSectionData.description}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {currentSectionData?.questions
            .filter(shouldShowQuestion)
            .map((question) => (
              <div
                key={question.id}
                className={errors[question.id] ? 'ring-2 ring-destructive rounded-xl p-3 -m-1 bg-destructive/5' : ''}
              >
                <QuestionField
                  question={question}
                  value={responses[question.id]}
                  onChange={handleChange}
                  language={language}
                />
                {errors[question.id] && (
                  <p className="text-destructive text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {isRTL ? 'هذا الحقل مطلوب' : 'This field is required'}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {!readOnly && (
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/30">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={isFirstSection}
            className="flex items-center gap-2 min-h-[44px]"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            <span className="hidden sm:inline">{isRTL ? 'السابق' : 'Previous'}</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleSaveDraft}
            disabled={saving}
            className="flex items-center gap-2 text-text-secondary hover:text-foreground"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{isRTL ? 'حفظ المسودة' : 'Save Draft'}</span>
          </Button>

          {isLastSection ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground flex items-center gap-2 min-h-[44px] shadow-lg"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isRTL ? 'إرسال' : 'Submit'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary to-green-400 hover:opacity-90 text-primary-foreground flex items-center gap-2 min-h-[44px] shadow-lg"
            >
              <span className="hidden sm:inline">{isRTL ? 'التالي' : 'Next'}</span>
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // If used as modal
  if (isModal) {
    return (
      <Dialog open={true} onOpenChange={() => onClose?.()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              {formTitle}
            </DialogTitle>
            <DialogDescription>
              {isRTL
                ? 'يرجى ملء جميع الحقول المطلوبة أدناه'
                : 'Please fill out all required fields below'}
            </DialogDescription>
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    );
  }

  // Full page view
  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/10">
            <ClipboardList className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{formTitle}</h1>
            <p className="text-sm text-text-secondary">
              {isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill out all required fields'}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
      <FormContent />
    </div>
  );
}
