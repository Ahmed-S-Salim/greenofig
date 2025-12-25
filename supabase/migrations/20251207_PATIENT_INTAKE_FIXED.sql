-- Patient Intake System for GreenoFig - FIXED VERSION
-- Run this INSTEAD of the previous migrations

-- =====================================================
-- PART 1: External Forms System Tables
-- =====================================================

-- Table for public/external form links
CREATE TABLE IF NOT EXISTS public_form_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,
  link_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255),
  title_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_submissions INTEGER,
  current_submissions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for external form submissions (non-logged-in users)
CREATE TABLE IF NOT EXISTS external_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public_form_links(id) ON DELETE CASCADE,
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_template_id UUID REFERENCES form_templates(id) ON DELETE SET NULL,

  -- Submitter info (since they're not logged in)
  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  submitter_phone VARCHAR(50),
  submitter_age VARCHAR(10),
  submitter_address TEXT,

  -- Form data
  responses JSONB NOT NULL DEFAULT '{}',
  completed_forms JSONB DEFAULT '[]',
  signature_data TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_form_links_nutritionist ON public_form_links(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_public_form_links_code ON public_form_links(link_code);
CREATE INDEX IF NOT EXISTS idx_external_submissions_link ON external_form_submissions(link_id);
CREATE INDEX IF NOT EXISTS idx_external_submissions_nutritionist ON external_form_submissions(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_external_submissions_email ON external_form_submissions(submitter_email);

-- Enable RLS
ALTER TABLE public_form_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public_form_links
DROP POLICY IF EXISTS "Nutritionists can view own form links" ON public_form_links;
DROP POLICY IF EXISTS "Nutritionists can create form links" ON public_form_links;
DROP POLICY IF EXISTS "Nutritionists can update own form links" ON public_form_links;
DROP POLICY IF EXISTS "Nutritionists can delete own form links" ON public_form_links;
DROP POLICY IF EXISTS "Public can view active form links" ON public_form_links;

CREATE POLICY "Nutritionists can view own form links"
ON public_form_links FOR SELECT
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'admin')
));

CREATE POLICY "Nutritionists can create form links"
ON public_form_links FOR INSERT
WITH CHECK (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'admin')
));

CREATE POLICY "Nutritionists can update own form links"
ON public_form_links FOR UPDATE
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Nutritionists can delete own form links"
ON public_form_links FOR DELETE
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Anyone can read active public links (for the public form page)
CREATE POLICY "Public can view active form links"
ON public_form_links FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- RLS Policies for external_form_submissions
DROP POLICY IF EXISTS "Nutritionists can view submissions" ON external_form_submissions;
DROP POLICY IF EXISTS "Anyone can submit external forms" ON external_form_submissions;
DROP POLICY IF EXISTS "Nutritionists can update submissions" ON external_form_submissions;
DROP POLICY IF EXISTS "Nutritionists can delete submissions" ON external_form_submissions;

CREATE POLICY "Nutritionists can view submissions"
ON external_form_submissions FOR SELECT
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'admin')
));

CREATE POLICY "Anyone can submit external forms"
ON external_form_submissions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Nutritionists can update submissions"
ON external_form_submissions FOR UPDATE
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Nutritionists can delete submissions"
ON external_form_submissions FOR DELETE
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
));

-- =====================================================
-- PART 2: Form Templates (Using valid form_types: screening, health_history, medical_history, custom)
-- =====================================================

-- 1. Exercise History Form (using 'custom' as form_type)
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Exercise History Form',
  'نموذج تاريخ التمارين',
  'Questionnaire about your exercise habits and sports activities',
  'استبيان حول عاداتك الرياضية والأنشطة البدنية',
  'custom',
  '[
    {
      "id": "personal_info",
      "title": "Personal Information",
      "title_ar": "المعلومات الشخصية",
      "questions": [
        {"id": "full_name", "type": "text", "label": "Full Name", "label_ar": "الاسم الكامل", "required": true},
        {"id": "date", "type": "date", "label": "Date", "label_ar": "التاريخ", "required": true}
      ]
    },
    {
      "id": "current_exercise",
      "title": "Current Exercise Habits",
      "title_ar": "عادات التمارين الحالية",
      "questions": [
        {"id": "regular_exercise", "type": "yes_no", "label": "Are you currently involved in a regular exercise program?", "label_ar": "هل تشارك حالياً في برنامج تمارين منتظم؟", "required": true},
        {"id": "walk_run_miles", "type": "yes_no", "label": "Do you regularly walk or run 1 or more miles continuously?", "label_ar": "هل تمشي أو تجري ميلاً أو أكثر بانتظام؟", "required": false},
        {"id": "avg_miles", "type": "text", "label": "If yes, average number of miles per workout?", "label_ar": "إذا نعم، متوسط عدد الأميال في التمرين؟", "required": false},
        {"id": "lift_weights", "type": "yes_no", "label": "Do you lift weights?", "label_ar": "هل ترفع الأثقال؟", "required": true},
        {"id": "aerobic_program", "type": "yes_no", "label": "Are you involved in an aerobic program?", "label_ar": "هل تشارك في برنامج تمارين هوائية؟", "required": false},
        {"id": "aerobic_types", "type": "textarea", "label": "If yes, what type(s)?", "label_ar": "إذا نعم، ما هي الأنواع؟", "required": false}
      ]
    },
    {
      "id": "competitive_sports",
      "title": "Competitive Sports",
      "title_ar": "الرياضات التنافسية",
      "questions": [
        {"id": "compete_sports", "type": "yes_no", "label": "Do you frequently compete in competitive sports?", "label_ar": "هل تتنافس بشكل متكرر في الرياضات التنافسية؟", "required": true},
        {"id": "sports_list", "type": "multiselect", "label": "If yes, which one(s)?", "label_ar": "إذا نعم، أي منها؟", "required": false, "options": [
          {"value": "golf", "label": "Golf", "label_ar": "الجولف"},
          {"value": "volleyball", "label": "Volleyball", "label_ar": "الكرة الطائرة"},
          {"value": "tennis", "label": "Tennis", "label_ar": "التنس"},
          {"value": "soccer", "label": "Soccer", "label_ar": "كرة القدم"},
          {"value": "basketball", "label": "Basketball", "label_ar": "كرة السلة"},
          {"value": "swimming", "label": "Swimming", "label_ar": "السباحة"}
        ]},
        {"id": "other_sports", "type": "text", "label": "Other sports", "label_ar": "رياضات أخرى", "required": false},
        {"id": "times_per_week", "type": "number", "label": "Average times per week", "label_ar": "متوسط المرات في الأسبوع", "required": false}
      ]
    },
    {
      "id": "limitations",
      "title": "Limitations & Pain",
      "title_ar": "القيود والألم",
      "questions": [
        {"id": "desired_activities", "type": "textarea", "label": "Are there any sports or activities you would like to participate in? Why are you currently unable?", "label_ar": "هل هناك رياضات ترغب في المشاركة فيها؟ لماذا لا تستطيع حالياً؟", "required": false},
        {"id": "pain_during_activity", "type": "yes_no", "label": "Do you have pain when participating in sport or activity?", "label_ar": "هل تشعر بألم عند ممارسة الرياضة؟", "required": true},
        {"id": "pain_description", "type": "textarea", "label": "If yes, please describe", "label_ar": "إذا نعم، يرجى الوصف", "required": false}
      ]
    },
    {
      "id": "signature_section",
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {"id": "signature", "type": "signature", "label": "Signature", "label_ar": "التوقيع", "required": true}
      ]
    }
  ]'::jsonb,
  true,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 2. Health History Form (using 'health_history' as form_type)
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Health History Form',
  'نموذج التاريخ الصحي',
  'Comprehensive health history questionnaire',
  'استبيان شامل للتاريخ الصحي',
  'health_history',
  '[
    {
      "id": "personal_info",
      "title": "Personal Information",
      "title_ar": "المعلومات الشخصية",
      "questions": [
        {"id": "full_name", "type": "text", "label": "Full Name", "label_ar": "الاسم الكامل", "required": true},
        {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "label_ar": "تاريخ الميلاد", "required": true},
        {"id": "age", "type": "number", "label": "Age", "label_ar": "العمر", "required": true},
        {"id": "occupation", "type": "text", "label": "Occupation", "label_ar": "المهنة", "required": false}
      ]
    },
    {
      "id": "emergency_contact",
      "title": "Emergency Contact",
      "title_ar": "جهة الاتصال في حالات الطوارئ",
      "questions": [
        {"id": "emergency_name", "type": "text", "label": "Emergency Contact Name", "label_ar": "اسم جهة الاتصال", "required": true},
        {"id": "emergency_relationship", "type": "text", "label": "Relationship", "label_ar": "العلاقة", "required": true},
        {"id": "emergency_phone", "type": "phone", "label": "Phone", "label_ar": "الهاتف", "required": true}
      ]
    },
    {
      "id": "physician_info",
      "title": "Physician Information",
      "title_ar": "معلومات الطبيب",
      "questions": [
        {"id": "physician_name", "type": "text", "label": "Current Physician", "label_ar": "الطبيب الحالي", "required": false},
        {"id": "physician_phone", "type": "phone", "label": "Physician Phone", "label_ar": "هاتف الطبيب", "required": false},
        {"id": "under_care", "type": "yes_no", "label": "Are you under the care of a physician or health care professional?", "label_ar": "هل أنت تحت رعاية طبيب أو متخصص صحي؟", "required": true},
        {"id": "care_reason", "type": "textarea", "label": "If yes, list reason", "label_ar": "إذا نعم، اذكر السبب", "required": false}
      ]
    },
    {
      "id": "medications",
      "title": "Medications & Allergies",
      "title_ar": "الأدوية والحساسية",
      "questions": [
        {"id": "taking_medications", "type": "yes_no", "label": "Are you taking any medications?", "label_ar": "هل تتناول أي أدوية؟", "required": true},
        {"id": "medications_list", "type": "textarea", "label": "If yes, please list (Medication, Dosage, Condition)", "label_ar": "إذا نعم، اذكر (الدواء، الجرعة، الحالة)", "required": false},
        {"id": "allergies", "type": "textarea", "label": "List any and all allergies", "label_ar": "اذكر جميع أنواع الحساسية", "required": false}
      ]
    },
    {
      "id": "medical_conditions",
      "title": "Medical Conditions",
      "title_ar": "الحالات الطبية",
      "questions": [
        {"id": "high_blood_pressure", "type": "yes_no", "label": "High blood pressure?", "label_ar": "ارتفاع ضغط الدم؟", "required": true},
        {"id": "bone_joint_problem", "type": "yes_no", "label": "Bone or joint problem that could worsen with exercise?", "label_ar": "مشكلة في العظام قد تتفاقم بالتمارين؟", "required": true},
        {"id": "over_65", "type": "yes_no", "label": "Are you over 65 years of age?", "label_ar": "هل عمرك أكثر من 65 سنة؟", "required": true},
        {"id": "chest_pain", "type": "yes_no", "label": "Chest pain with exercise or stress?", "label_ar": "ألم في الصدر مع التمارين أو الإجهاد؟", "required": true}
      ]
    },
    {
      "id": "lifestyle",
      "title": "Lifestyle",
      "title_ar": "نمط الحياة",
      "questions": [
        {"id": "stress_level", "type": "select", "label": "Stress Level", "label_ar": "مستوى الضغط", "required": true, "options": [
          {"value": "low", "label": "Low", "label_ar": "منخفض"},
          {"value": "medium", "label": "Medium", "label_ar": "متوسط"},
          {"value": "high", "label": "High", "label_ar": "مرتفع"}
        ]},
        {"id": "caffeine", "type": "yes_no", "label": "Do you consume caffeine?", "label_ar": "هل تستهلك الكافيين؟", "required": true},
        {"id": "alcohol", "type": "yes_no", "label": "Do you consume alcohol?", "label_ar": "هل تستهلك الكحول؟", "required": true},
        {"id": "smoking_status", "type": "select", "label": "Smoking status", "label_ar": "حالة التدخين", "required": true, "options": [
          {"value": "non_smoker", "label": "Non-smoker", "label_ar": "غير مدخن"},
          {"value": "former", "label": "Former smoker", "label_ar": "مدخن سابق"},
          {"value": "current", "label": "Current smoker", "label_ar": "مدخن حالي"}
        ]}
      ]
    },
    {
      "id": "cardiovascular",
      "title": "Cardiovascular",
      "title_ar": "القلب والأوعية الدموية",
      "questions": [
        {"id": "cv_high_cholesterol", "type": "yes_no", "label": "High Cholesterol", "label_ar": "ارتفاع الكوليسترول", "required": true},
        {"id": "cv_heart_disease", "type": "yes_no", "label": "Heart Disease", "label_ar": "أمراض القلب", "required": true},
        {"id": "cv_heart_attack", "type": "yes_no", "label": "Heart Attack", "label_ar": "نوبة قلبية", "required": true},
        {"id": "cv_stroke", "type": "yes_no", "label": "Stroke", "label_ar": "سكتة دماغية", "required": true}
      ]
    },
    {
      "id": "nutrition",
      "title": "Nutrition",
      "title_ar": "التغذية",
      "questions": [
        {"id": "specific_diet", "type": "yes_no", "label": "Are you on any specific diet plan?", "label_ar": "هل تتبع نظاماً غذائياً محدداً؟", "required": true},
        {"id": "diet_details", "type": "textarea", "label": "If yes, please describe", "label_ar": "إذا نعم، اذكر التفاصيل", "required": false},
        {"id": "dietary_supplements", "type": "yes_no", "label": "Do you take dietary supplements?", "label_ar": "هل تتناول مكملات غذائية؟", "required": true},
        {"id": "supplements_list", "type": "textarea", "label": "If yes, please list", "label_ar": "إذا نعم، اذكرها", "required": false},
        {"id": "nutritional_behaviors", "type": "textarea", "label": "How would you describe your current nutritional behaviors?", "label_ar": "كيف تصف سلوكياتك الغذائية الحالية؟", "required": false}
      ]
    },
    {
      "id": "signature_section",
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {"id": "printed_name", "type": "text", "label": "Printed Name", "label_ar": "الاسم المطبوع", "required": true},
        {"id": "signature", "type": "signature", "label": "Signature", "label_ar": "التوقيع", "required": true},
        {"id": "sign_date", "type": "date", "label": "Date", "label_ar": "التاريخ", "required": true}
      ]
    }
  ]'::jsonb,
  true,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 3. Medical History Form (using 'medical_history' as form_type)
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Medical History Form',
  'نموذج التاريخ الطبي',
  'Medical history covering personal conditions and hospitalization',
  'التاريخ الطبي يغطي الحالات الشخصية والاستشفاء',
  'medical_history',
  '[
    {
      "id": "personal_info",
      "title": "Personal Information",
      "title_ar": "المعلومات الشخصية",
      "questions": [
        {"id": "full_name", "type": "text", "label": "Full Name", "label_ar": "الاسم الكامل", "required": true},
        {"id": "date", "type": "date", "label": "Date", "label_ar": "التاريخ", "required": true}
      ]
    },
    {
      "id": "medical_conditions",
      "title": "Medical Conditions",
      "title_ar": "الحالات الطبية",
      "description": "Please indicate if you have a history of the following",
      "description_ar": "يرجى الإشارة إذا كان لديك تاريخ من الحالات التالية",
      "questions": [
        {"id": "heart_attack", "type": "yes_no", "label": "Heart attack", "label_ar": "نوبة قلبية", "required": true},
        {"id": "bypass_surgery", "type": "yes_no", "label": "Bypass or cardiac surgery", "label_ar": "جراحة قلب أو تحويلة", "required": true},
        {"id": "chest_discomfort", "type": "yes_no", "label": "Chest discomfort with exertion", "label_ar": "انزعاج في الصدر مع المجهود", "required": true},
        {"id": "high_bp", "type": "yes_no", "label": "High blood pressure", "label_ar": "ارتفاع ضغط الدم", "required": true},
        {"id": "rapid_heartbeat", "type": "yes_no", "label": "Rapid or irregular heartbeat", "label_ar": "ضربات قلب سريعة أو غير منتظمة", "required": true},
        {"id": "shortness_breath", "type": "yes_no", "label": "Shortness of breath", "label_ar": "ضيق التنفس", "required": true},
        {"id": "fainting", "type": "yes_no", "label": "Fainting or light-headedness", "label_ar": "إغماء أو دوخة", "required": true},
        {"id": "pulmonary_disease", "type": "yes_no", "label": "Pulmonary disease", "label_ar": "مرض رئوي", "required": true},
        {"id": "high_lipid", "type": "yes_no", "label": "High blood fat (lipid) level", "label_ar": "ارتفاع نسبة الدهون في الدم", "required": true},
        {"id": "stroke", "type": "yes_no", "label": "Stroke", "label_ar": "سكتة دماغية", "required": true}
      ]
    },
    {
      "id": "hospitalization",
      "title": "Hospitalization & Other Conditions",
      "title_ar": "الاستشفاء والحالات الأخرى",
      "questions": [
        {"id": "recent_hospitalization", "type": "yes_no", "label": "Recent hospitalization for any cause", "label_ar": "استشفاء حديث لأي سبب", "required": true},
        {"id": "hospitalization_reason", "type": "textarea", "label": "If yes, reason for hospitalization", "label_ar": "إذا نعم، سبب الاستشفاء", "required": false},
        {"id": "orthopedic_conditions", "type": "yes_no", "label": "Orthopedic conditions (including arthritis)", "label_ar": "حالات العظام (بما في ذلك التهاب المفاصل)", "required": true},
        {"id": "orthopedic_description", "type": "textarea", "label": "Please describe orthopedic conditions", "label_ar": "يرجى وصف حالات العظام", "required": false},
        {"id": "other_conditions", "type": "textarea", "label": "Other diagnosed conditions", "label_ar": "حالات مشخصة أخرى", "required": false}
      ]
    },
    {
      "id": "signature_section",
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {"id": "signature", "type": "signature", "label": "Signature", "label_ar": "التوقيع", "required": true}
      ]
    }
  ]'::jsonb,
  true,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- 4. Client Intake Screening Form (using 'screening' as form_type)
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Client Intake Screening Form',
  'نموذج فحص العميل',
  'Initial client intake form with health screening questions',
  'نموذج استقبال العميل الأولي مع أسئلة الفحص الصحي',
  'screening',
  '[
    {
      "id": "personal_info",
      "title": "Personal Information",
      "title_ar": "المعلومات الشخصية",
      "questions": [
        {"id": "full_name", "type": "text", "label": "Full Name", "label_ar": "الاسم الكامل", "required": true},
        {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "label_ar": "تاريخ الميلاد", "required": true},
        {"id": "age", "type": "number", "label": "Age", "label_ar": "العمر", "required": true},
        {"id": "occupation", "type": "text", "label": "Occupation", "label_ar": "المهنة", "required": false}
      ]
    },
    {
      "id": "heart_conditions",
      "title": "Heart & Cardiovascular",
      "title_ar": "القلب والأوعية الدموية",
      "questions": [
        {"id": "heart_condition", "type": "yes_no", "label": "Has a doctor diagnosed you with a heart condition?", "label_ar": "هل شخصك طبيب بحالة قلبية؟", "required": true},
        {"id": "angina_pain", "type": "yes_no", "label": "Have you ever had chest pain during exercise?", "label_ar": "هل عانيت من ألم في الصدر أثناء التمارين؟", "required": true},
        {"id": "rapid_heartbeat", "type": "yes_no", "label": "Have you experienced rapid heartbeat or palpitations?", "label_ar": "هل عانيت من ضربات قلب سريعة أو خفقان؟", "required": true},
        {"id": "heart_attack", "type": "yes_no", "label": "Have you had a heart attack?", "label_ar": "هل أصبت بنوبة قلبية؟", "required": true}
      ]
    },
    {
      "id": "health_conditions",
      "title": "Health Conditions",
      "title_ar": "الحالات الصحية",
      "questions": [
        {"id": "diabetes_hypertension", "type": "yes_no", "label": "Do you have diabetes or high blood pressure?", "label_ar": "هل تعاني من السكري أو ارتفاع ضغط الدم؟", "required": true},
        {"id": "family_heart_disease", "type": "yes_no", "label": "Family history of heart disease before age 60?", "label_ar": "تاريخ عائلي لأمراض القلب قبل سن 60؟", "required": true},
        {"id": "cholesterol_meds", "type": "yes_no", "label": "Do you take medications for cholesterol?", "label_ar": "هل تتناول أدوية للكوليسترول؟", "required": true}
      ]
    },
    {
      "id": "lifestyle",
      "title": "Lifestyle",
      "title_ar": "نمط الحياة",
      "questions": [
        {"id": "overweight", "type": "yes_no", "label": "Are you overweight?", "label_ar": "هل تعاني من زيادة الوزن؟", "required": true},
        {"id": "excessive_stress", "type": "yes_no", "label": "Are you under excessive stress?", "label_ar": "هل تعاني من ضغط مفرط؟", "required": true},
        {"id": "smoke_tobacco", "type": "yes_no", "label": "Do you smoke tobacco?", "label_ar": "هل تدخن التبغ؟", "required": true},
        {"id": "physical_condition", "type": "yes_no", "label": "Do you have a physical condition that should be considered before starting a nutrition program?", "label_ar": "هل لديك حالة جسدية يجب مراعاتها قبل بدء برنامج التغذية؟", "required": true}
      ]
    },
    {
      "id": "age_exercise",
      "title": "Age & Exercise",
      "title_ar": "العمر والتمارين",
      "questions": [
        {"id": "over_35", "type": "yes_no", "label": "Are you over 35 years old?", "label_ar": "هل عمرك أكثر من 35 سنة؟", "required": true},
        {"id": "exercise_less_3x", "type": "yes_no", "label": "Do you exercise fewer than 3 times per week?", "label_ar": "هل تمارس الرياضة أقل من 3 مرات أسبوعياً؟", "required": true}
      ]
    },
    {
      "id": "signature_section",
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {"id": "signature", "type": "signature", "label": "Signature", "label_ar": "التوقيع", "required": true},
        {"id": "sign_date", "type": "date", "label": "Date", "label_ar": "التاريخ", "required": true}
      ]
    }
  ]'::jsonb,
  true,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Done! The Patient Intake System is now ready.
