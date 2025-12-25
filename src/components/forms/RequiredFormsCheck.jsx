import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ClipboardList,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle,
  Loader2
} from 'lucide-react';
import ClientIntakeForm from './ClientIntakeForm';

/**
 * RequiredFormsCheck - Blocks access to features until required intake forms are completed
 *
 * Usage:
 * <RequiredFormsCheck
 *   blockAccess={true}                    // If true, children won't render until forms complete
 *   showBanner={true}                     // Show a banner instead of blocking
 *   onFormsComplete={() => {}}            // Callback when all forms are complete
 * >
 *   <YourProtectedComponent />
 * </RequiredFormsCheck>
 */
export default function RequiredFormsCheck({
  children,
  blockAccess = true,
  showBanner = false,
  onFormsComplete
}) {
  const { t, i18n } = useTranslation();
  const { user, userProfile } = useAuth();
  const language = i18n.language;
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [pendingForms, setPendingForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showFormsList, setShowFormsList] = useState(false);

  useEffect(() => {
    if (user && userProfile?.role === 'user') {
      checkPendingForms();
    } else {
      setLoading(false);
    }
  }, [user, userProfile]);

  const checkPendingForms = async () => {
    try {
      const { data, error } = await supabase
        .from('form_assignments')
        .select(`
          *,
          form_template:form_templates(*),
          responses:form_responses(*)
        `)
        .eq('client_id', user.id)
        .eq('is_initial_intake', true)
        .eq('is_required', true)
        .in('status', ['pending', 'in_progress']);

      if (error) throw error;

      setPendingForms(data || []);

      if ((data || []).length === 0 && onFormsComplete) {
        onFormsComplete();
      }
    } catch (error) {
      console.error('Error checking pending forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormComplete = () => {
    setSelectedForm(null);
    checkPendingForms();
  };

  // Not a user role, don't block
  if (userProfile?.role !== 'user') {
    return children;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // No pending forms, render children
  if (pendingForms.length === 0) {
    return children;
  }

  // Show selected form for filling
  if (selectedForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <ClientIntakeForm
          assignmentId={selectedForm.id}
          formTemplate={selectedForm.form_template}
          existingResponses={selectedForm.responses?.[0]?.responses}
          onComplete={handleFormComplete}
          onClose={() => setSelectedForm(null)}
        />
      </div>
    );
  }

  // Show banner mode (non-blocking)
  if (showBanner && !blockAccess) {
    return (
      <>
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {isRTL ? 'لديك نماذج غير مكتملة' : 'You have incomplete forms'}
                </p>
                <p className="text-sm text-yellow-700">
                  {isRTL
                    ? `${pendingForms.length} نموذج بحاجة لإكمال`
                    : `${pendingForms.length} form(s) need to be completed`}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => setShowFormsList(true)}
            >
              {isRTL ? 'إكمال النماذج' : 'Complete Forms'}
            </Button>
          </div>
        </div>
        {children}

        {/* Modal for forms list */}
        {showFormsList && (
          <FormsListModal
            forms={pendingForms}
            isRTL={isRTL}
            onSelect={(form) => {
              setSelectedForm(form);
              setShowFormsList(false);
            }}
            onClose={() => setShowFormsList(false)}
          />
        )}
      </>
    );
  }

  // Block mode - show forms required screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">
            {isRTL ? 'مرحباً! نحتاج لبعض المعلومات' : "Welcome! We need some information"}
          </CardTitle>
          <CardDescription>
            {isRTL
              ? 'يرجى إكمال نماذج الاستقبال التالية قبل المتابعة. تساعدنا هذه المعلومات في تقديم أفضل رعاية لك.'
              : 'Please complete the following intake forms before continuing. This information helps us provide you with the best care.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingForms.map((assignment) => {
            const template = assignment.form_template;
            const formName = isRTL ? (template.name_ar || template.name) : template.name;
            const formDesc = isRTL ? (template.description_ar || template.description) : template.description;
            const isInProgress = assignment.status === 'in_progress';

            return (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setSelectedForm(assignment)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isInProgress ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                    <FileText className={`w-5 h-5 ${isInProgress ? 'text-blue-600' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{formName}</h3>
                    <p className="text-sm text-gray-500">{formDesc}</p>
                    {isInProgress && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {isRTL ? 'قيد التقدم' : 'In Progress'}
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            );
          })}

          <div className="pt-4 border-t text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              {isRTL
                ? 'معلوماتك آمنة ومحمية'
                : 'Your information is secure and protected'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Forms List Modal Component
function FormsListModal({ forms, isRTL, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-600" />
            {isRTL ? 'النماذج المطلوبة' : 'Required Forms'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {forms.map((assignment) => {
            const template = assignment.form_template;
            const formName = isRTL ? (template.name_ar || template.name) : template.name;

            return (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelect(assignment)}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">{formName}</span>
                </div>
                <Badge variant="outline">
                  {assignment.status === 'in_progress'
                    ? (isRTL ? 'متابعة' : 'Continue')
                    : (isRTL ? 'ابدأ' : 'Start')}
                </Badge>
              </div>
            );
          })}
          <Button variant="outline" className="w-full mt-4" onClick={onClose}>
            {isRTL ? 'إغلاق' : 'Close'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
