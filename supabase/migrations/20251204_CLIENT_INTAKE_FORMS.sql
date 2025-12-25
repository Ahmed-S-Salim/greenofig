-- Client Intake Forms System
-- Allows nutritionists to send forms to clients and receive responses

-- Form Templates Table (stores the 3 default forms + custom forms)
CREATE TABLE IF NOT EXISTS form_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    description_ar TEXT,
    form_type TEXT NOT NULL CHECK (form_type IN ('screening', 'health_history', 'medical_history', 'custom')),
    sections JSONB NOT NULL, -- Array of sections with questions
    is_default BOOLEAN DEFAULT false, -- True for the 3 standard forms
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Assignments Table (when nutritionist sends a form to client)
CREATE TABLE IF NOT EXISTS form_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nutritionist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'edit_requested')),
    is_required BOOLEAN DEFAULT true, -- If true, client must complete before proceeding
    is_initial_intake BOOLEAN DEFAULT false, -- True for mandatory post-registration forms
    due_date TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    notes TEXT, -- Nutritionist notes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form Responses Table (stores client answers)
CREATE TABLE IF NOT EXISTS form_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES form_assignments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- {question_id: answer} mapping
    signature_data TEXT, -- Base64 signature if required
    signed_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1, -- Increments on edits
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Edit Requests Table (when client requests to edit submitted form)
CREATE TABLE IF NOT EXISTS form_edit_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID NOT NULL REFERENCES form_assignments(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    responded_by UUID REFERENCES auth.users(id),
    response_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_assignments_client ON form_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_form_assignments_nutritionist ON form_assignments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_form_assignments_status ON form_assignments(status);
CREATE INDEX IF NOT EXISTS idx_form_responses_assignment ON form_responses(assignment_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_client ON form_responses(client_id);

-- RLS Policies
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_edit_requests ENABLE ROW LEVEL SECURITY;

-- Form Templates: Anyone can read, only nutritionists/admins can create
CREATE POLICY "Anyone can view active form templates"
    ON form_templates FOR SELECT
    USING (is_active = true);

CREATE POLICY "Nutritionists can create form templates"
    ON form_templates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Creators can update their templates"
    ON form_templates FOR UPDATE
    USING (created_by = auth.uid() OR is_default = false);

-- Form Assignments: Clients see their own, nutritionists see their clients'
CREATE POLICY "Clients can view their form assignments"
    ON form_assignments FOR SELECT
    USING (client_id = auth.uid());

CREATE POLICY "Nutritionists can view all assignments"
    ON form_assignments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Nutritionists can create assignments"
    ON form_assignments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Assignment status can be updated"
    ON form_assignments FOR UPDATE
    USING (
        client_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

-- Form Responses: Clients can CRUD their own, nutritionists can read
CREATE POLICY "Clients can manage their responses"
    ON form_responses FOR ALL
    USING (client_id = auth.uid());

CREATE POLICY "Nutritionists can view all responses"
    ON form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

-- Edit Requests: Clients create, nutritionists respond
CREATE POLICY "Clients can create edit requests"
    ON form_edit_requests FOR INSERT
    WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can view their edit requests"
    ON form_edit_requests FOR SELECT
    USING (
        client_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Nutritionists can update edit requests"
    ON form_edit_requests FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin', 'super_admin')
        )
    );

-- Insert the 3 default form templates based on the PDFs
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, is_default, sections) VALUES
-- 1. Client Intake/Screening Form
(
    'Client Intake Form',
    'نموذج استقبال العميل',
    'Initial screening questionnaire for new clients',
    'استبيان الفحص الأولي للعملاء الجدد',
    'screening',
    true,
    '[
        {
            "id": "personal_info",
            "title": "Personal Information",
            "title_ar": "المعلومات الشخصية",
            "questions": [
                {"id": "full_name", "type": "text", "label": "Full Name", "label_ar": "الاسم الكامل", "required": true},
                {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "label_ar": "تاريخ الميلاد", "required": true},
                {"id": "age", "type": "number", "label": "Age", "label_ar": "العمر", "required": true},
                {"id": "address", "type": "text", "label": "Address", "label_ar": "العنوان", "required": false},
                {"id": "city_state_zip", "type": "text", "label": "City, State, Zip", "label_ar": "المدينة، الولاية، الرمز البريدي", "required": false},
                {"id": "home_phone", "type": "tel", "label": "Home Phone", "label_ar": "هاتف المنزل", "required": false},
                {"id": "work_phone", "type": "tel", "label": "Work Phone", "label_ar": "هاتف العمل", "required": false},
                {"id": "employer", "type": "text", "label": "Employer", "label_ar": "جهة العمل", "required": false},
                {"id": "occupation", "type": "text", "label": "Occupation", "label_ar": "المهنة", "required": false}
            ]
        },
        {
            "id": "health_screening",
            "title": "Health Screening Questions",
            "title_ar": "أسئلة الفحص الصحي",
            "questions": [
                {"id": "heart_condition", "type": "yesno", "label": "Has a doctor diagnosed you with a heart condition?", "label_ar": "هل شخص طبيب حالة قلبية لديك؟", "required": true},
                {"id": "angina", "type": "yesno", "label": "Have you ever had angina pectoris, sharp pain, or heavy pressure in your chest as a result of exercise?", "label_ar": "هل سبق أن شعرت بذبحة صدرية أو ألم حاد أو ضغط شديد في صدرك نتيجة للتمارين؟", "required": true},
                {"id": "chest_pain_cold", "type": "yesno", "label": "Do you experience any sharp pain or extreme tightness in your chest in cold temperatures?", "label_ar": "هل تشعر بأي ألم حاد أو ضيق شديد في صدرك في درجات الحرارة الباردة؟", "required": true},
                {"id": "rapid_heartbeat", "type": "yesno", "label": "Have you ever experienced rapid heart beat or palpitations?", "label_ar": "هل سبق أن شعرت بتسارع نبضات القلب أو خفقان؟", "required": true},
                {"id": "heart_attack", "type": "yesno", "label": "Have you ever had a real or suspected heart attack, coronary occlusion, myocardial infarction, or thrombosis?", "label_ar": "هل سبق أن أصبت بنوبة قلبية حقيقية أو مشتبه بها؟", "required": true},
                {"id": "rheumatic_fever", "type": "yesno", "label": "Have you ever had rheumatic fever?", "label_ar": "هل سبق أن أصبت بالحمى الروماتيزمية؟", "required": true},
                {"id": "diabetes_hypertension", "type": "yesno", "label": "Do you have or have you had diabetes, hypertension, or high blood pressure?", "label_ar": "هل لديك أو كان لديك مرض السكري أو ارتفاع ضغط الدم؟", "required": true},
                {"id": "family_diabetes", "type": "yesno", "label": "Does anyone in your family have diabetes, hypertension, or high blood pressure?", "label_ar": "هل يعاني أي شخص في عائلتك من السكري أو ارتفاع ضغط الدم؟", "required": true},
                {"id": "family_heart_disease", "type": "yesno", "label": "Has any blood relative had a heart attack or coronary artery disease before the age of 60?", "label_ar": "هل أصيب أي قريب بنوبة قلبية قبل سن 60؟", "required": true},
                {"id": "cholesterol_meds", "type": "yesno", "label": "Have you ever taken medications or been on a special diet to lower your cholesterol?", "label_ar": "هل سبق أن تناولت أدوية أو اتبعت نظام غذائي لخفض الكوليسترول؟", "required": true},
                {"id": "heart_drugs", "type": "yesno", "label": "Have you ever taken digitalis, quinine, or any other drug for your heart?", "label_ar": "هل سبق أن تناولت أي دواء للقلب؟", "required": true},
                {"id": "nitroglycerin", "type": "yesno", "label": "Have you ever taken nitroglycerin or any other tablets for chest pain?", "label_ar": "هل سبق أن تناولت النتروجليسرين أو أي أقراص أخرى لألم الصدر؟", "required": true},
                {"id": "overweight", "type": "yesno", "label": "Are you overweight?", "label_ar": "هل تعاني من زيادة الوزن؟", "required": true},
                {"id": "excessive_stress", "type": "yesno", "label": "Are you under excessive stress?", "label_ar": "هل تعاني من ضغوط مفرطة؟", "required": true},
                {"id": "drink_heavily", "type": "yesno", "label": "Do you drink heavily?", "label_ar": "هل تشرب الكحول بكثرة؟", "required": true},
                {"id": "smoke", "type": "yesno", "label": "Do you smoke tobacco?", "label_ar": "هل تدخن التبغ؟", "required": true},
                {"id": "physical_condition", "type": "yesno", "label": "Do you have a physical condition or disability that should be considered before beginning a nutrition program?", "label_ar": "هل لديك حالة جسدية يجب مراعاتها قبل البدء في برنامج التغذية؟", "required": true},
                {"id": "over_65", "type": "yesno", "label": "Are you over 65 years old?", "label_ar": "هل عمرك أكثر من 65 سنة؟", "required": true},
                {"id": "over_35", "type": "yesno", "label": "Are you over 35 years old?", "label_ar": "هل عمرك أكثر من 35 سنة؟", "required": true},
                {"id": "exercise_less_3x", "type": "yesno", "label": "Do you exercise fewer than three times per week?", "label_ar": "هل تمارس الرياضة أقل من ثلاث مرات في الأسبوع؟", "required": true}
            ]
        }
    ]'::jsonb
),

-- 2. Health History Form (4 pages)
(
    'Health History Questionnaire',
    'استبيان التاريخ الصحي',
    'Comprehensive health and lifestyle assessment',
    'تقييم شامل للصحة ونمط الحياة',
    'health_history',
    true,
    '[
        {
            "id": "personal_info",
            "title": "Personal Information",
            "title_ar": "المعلومات الشخصية",
            "questions": [
                {"id": "full_name", "type": "text", "label": "Full Name", "label_ar": "الاسم الكامل", "required": true},
                {"id": "date_of_birth", "type": "date", "label": "Date of Birth", "label_ar": "تاريخ الميلاد", "required": true},
                {"id": "age", "type": "number", "label": "Age", "label_ar": "العمر", "required": true},
                {"id": "address", "type": "text", "label": "Address", "label_ar": "العنوان", "required": false},
                {"id": "city_state_zip", "type": "text", "label": "City, State, Zip", "label_ar": "المدينة، الولاية، الرمز البريدي", "required": false},
                {"id": "home_phone", "type": "tel", "label": "Home Phone", "label_ar": "هاتف المنزل", "required": false},
                {"id": "work_phone", "type": "tel", "label": "Work Phone", "label_ar": "هاتف العمل", "required": false},
                {"id": "employer", "type": "text", "label": "Employer", "label_ar": "جهة العمل", "required": false},
                {"id": "occupation", "type": "text", "label": "Occupation", "label_ar": "المهنة", "required": false}
            ]
        },
        {
            "id": "emergency_contact",
            "title": "Emergency Contact",
            "title_ar": "جهة الاتصال في حالات الطوارئ",
            "questions": [
                {"id": "emergency_name", "type": "text", "label": "Emergency Contact Name", "label_ar": "اسم جهة الاتصال", "required": true},
                {"id": "emergency_relationship", "type": "text", "label": "Relationship", "label_ar": "صلة القرابة", "required": true},
                {"id": "emergency_address", "type": "text", "label": "Address", "label_ar": "العنوان", "required": false},
                {"id": "emergency_phone", "type": "tel", "label": "Phone", "label_ar": "الهاتف", "required": true}
            ]
        },
        {
            "id": "physician_info",
            "title": "Physician Information",
            "title_ar": "معلومات الطبيب",
            "questions": [
                {"id": "physician_name", "type": "text", "label": "Current Physician", "label_ar": "الطبيب الحالي", "required": false},
                {"id": "physician_phone", "type": "tel", "label": "Physician Phone", "label_ar": "هاتف الطبيب", "required": false},
                {"id": "under_care", "type": "yesno", "label": "Are you under the care of a physician or other health care professional?", "label_ar": "هل أنت تحت رعاية طبيب أو أخصائي صحي؟", "required": true},
                {"id": "under_care_reason", "type": "textarea", "label": "If yes, list reason", "label_ar": "إذا نعم، اذكر السبب", "required": false, "conditional": {"field": "under_care", "value": true}}
            ]
        },
        {
            "id": "medications",
            "title": "Medications",
            "title_ar": "الأدوية",
            "questions": [
                {"id": "taking_medications", "type": "yesno", "label": "Are you taking any medications?", "label_ar": "هل تتناول أي أدوية؟", "required": true},
                {"id": "medications_list", "type": "medication_list", "label": "List medications (Name, Dosage, Condition)", "label_ar": "قائمة الأدوية (الاسم، الجرعة، الحالة)", "required": false, "conditional": {"field": "taking_medications", "value": true}},
                {"id": "allergies", "type": "textarea", "label": "List any and all allergies", "label_ar": "اذكر جميع أنواع الحساسية", "required": false}
            ]
        },
        {
            "id": "medical_questions",
            "title": "Medical Information",
            "title_ar": "المعلومات الطبية",
            "questions": [
                {"id": "high_blood_pressure", "type": "yesno", "label": "Has your doctor ever diagnosed you with high blood pressure?", "label_ar": "هل شخص طبيبك ارتفاع ضغط الدم؟", "required": true},
                {"id": "bone_joint_problem", "type": "yesno", "label": "Has your doctor diagnosed you with a bone or joint problem that could be made worse by exercise?", "label_ar": "هل شخص طبيبك مشكلة في العظام أو المفاصل؟", "required": true},
                {"id": "over_65", "type": "yesno", "label": "Are you over 65 years of age?", "label_ar": "هل عمرك أكثر من 65 سنة؟", "required": true},
                {"id": "vigorous_exercise", "type": "yesno", "label": "Are you used to vigorous exercise?", "label_ar": "هل أنت معتاد على التمارين الشاقة؟", "required": true},
                {"id": "other_reason", "type": "yesno", "label": "Is there any reason not mentioned why you should not follow a regular exercise program?", "label_ar": "هل هناك أي سبب آخر لعدم ممارسة برنامج تمارين منتظم؟", "required": true},
                {"id": "other_reason_explain", "type": "textarea", "label": "If yes, please explain", "label_ar": "إذا نعم، يرجى التوضيح", "required": false, "conditional": {"field": "other_reason", "value": true}},
                {"id": "chest_pain_exercise", "type": "yesno", "label": "Have you recently experienced any chest pain associated with exercise or stress?", "label_ar": "هل عانيت مؤخراً من ألم في الصدر مرتبط بالتمارين أو الإجهاد؟", "required": true},
                {"id": "chest_pain_explain", "type": "textarea", "label": "If yes, please explain", "label_ar": "إذا نعم، يرجى التوضيح", "required": false, "conditional": {"field": "chest_pain_exercise", "value": true}}
            ]
        },
        {
            "id": "smoking",
            "title": "Smoking",
            "title_ar": "التدخين",
            "questions": [
                {"id": "smoking_status", "type": "select", "label": "Please select your current smoking status", "label_ar": "يرجى اختيار حالة التدخين الحالية", "required": true, "options": [
                    {"value": "non_user", "label": "Non-user or former user", "label_ar": "غير مدخن أو مدخن سابق"},
                    {"value": "cigar_pipe", "label": "Cigar and/or pipe", "label_ar": "سيجار و/أو غليون"},
                    {"value": "15_or_less", "label": "15 or less cigarettes per day", "label_ar": "15 سيجارة أو أقل يومياً"},
                    {"value": "16_to_25", "label": "16 to 25 cigarettes per day", "label_ar": "16 إلى 25 سيجارة يومياً"},
                    {"value": "26_to_35", "label": "26 to 35 cigarettes per day", "label_ar": "26 إلى 35 سيجارة يومياً"},
                    {"value": "more_than_35", "label": "More than 35 cigarettes per day", "label_ar": "أكثر من 35 سيجارة يومياً"}
                ]},
                {"id": "quit_date", "type": "date", "label": "If former user, date quit", "label_ar": "إذا كنت مدخناً سابقاً، تاريخ الإقلاع", "required": false}
            ]
        },
        {
            "id": "family_history",
            "title": "Family History",
            "title_ar": "التاريخ العائلي",
            "questions": [
                {"id": "family_asthma", "type": "text", "label": "Asthma (who in family)", "label_ar": "الربو (من في العائلة)", "required": false},
                {"id": "family_respiratory", "type": "text", "label": "Respiratory/Pulmonary Conditions (who in family)", "label_ar": "أمراض الجهاز التنفسي (من في العائلة)", "required": false},
                {"id": "family_diabetes", "type": "text", "label": "Diabetes (who, Type I or II, how long)", "label_ar": "السكري (من، النوع، المدة)", "required": false},
                {"id": "family_epilepsy", "type": "text", "label": "Epilepsy (who, type)", "label_ar": "الصرع (من، النوع)", "required": false},
                {"id": "family_osteoporosis", "type": "text", "label": "Osteoporosis (who in family)", "label_ar": "هشاشة العظام (من في العائلة)", "required": false}
            ]
        },
        {
            "id": "lifestyle",
            "title": "Lifestyle and Dietary Factors",
            "title_ar": "نمط الحياة والعوامل الغذائية",
            "questions": [
                {"id": "stress_level", "type": "select", "label": "Occupational Stress Level", "label_ar": "مستوى ضغط العمل", "required": true, "options": [
                    {"value": "low", "label": "Low", "label_ar": "منخفض"},
                    {"value": "medium", "label": "Medium", "label_ar": "متوسط"},
                    {"value": "high", "label": "High", "label_ar": "مرتفع"}
                ]},
                {"id": "energy_level", "type": "select", "label": "Energy Level", "label_ar": "مستوى الطاقة", "required": true, "options": [
                    {"value": "low", "label": "Low", "label_ar": "منخفض"},
                    {"value": "medium", "label": "Medium", "label_ar": "متوسط"},
                    {"value": "high", "label": "High", "label_ar": "مرتفع"}
                ]},
                {"id": "caffeine", "type": "yesno", "label": "Do you consume caffeine?", "label_ar": "هل تتناول الكافيين؟", "required": true},
                {"id": "alcohol", "type": "yesno", "label": "Do you consume alcohol?", "label_ar": "هل تتناول الكحول؟", "required": true},
                {"id": "anemia", "type": "yesno", "label": "Do you have anemia?", "label_ar": "هل لديك فقر الدم؟", "required": true},
                {"id": "gi_disorder", "type": "yesno", "label": "Do you have a gastrointestinal disorder?", "label_ar": "هل لديك اضطراب في الجهاز الهضمي؟", "required": true},
                {"id": "hypoglycemia", "type": "yesno", "label": "Do you have hypoglycemia?", "label_ar": "هل لديك انخفاض سكر الدم؟", "required": true},
                {"id": "thyroid_disorder", "type": "yesno", "label": "Do you have a thyroid disorder?", "label_ar": "هل لديك اضطراب في الغدة الدرقية؟", "required": true},
                {"id": "pre_postnatal", "type": "yesno", "label": "Are you pre/postnatal?", "label_ar": "هل أنت حامل أو بعد الولادة؟", "required": true}
            ]
        },
        {
            "id": "cardiovascular",
            "title": "Cardiovascular",
            "title_ar": "القلب والأوعية الدموية",
            "questions": [
                {"id": "cv_high_bp", "type": "yesno", "label": "High Blood Pressure", "label_ar": "ارتفاع ضغط الدم", "required": true},
                {"id": "cv_hypertension", "type": "yesno", "label": "Hypertension", "label_ar": "فرط ضغط الدم", "required": true},
                {"id": "cv_high_cholesterol", "type": "yesno", "label": "High Cholesterol", "label_ar": "ارتفاع الكوليسترول", "required": true},
                {"id": "cv_hyperlipidemia", "type": "yesno", "label": "Hyperlipidemia", "label_ar": "فرط شحميات الدم", "required": true},
                {"id": "cv_heart_disease", "type": "yesno", "label": "Heart Disease", "label_ar": "أمراض القلب", "required": true},
                {"id": "cv_heart_attack", "type": "yesno", "label": "Heart Attack", "label_ar": "نوبة قلبية", "required": true},
                {"id": "cv_stroke", "type": "yesno", "label": "Stroke", "label_ar": "سكتة دماغية", "required": true},
                {"id": "cv_angina", "type": "yesno", "label": "Angina", "label_ar": "ذبحة صدرية", "required": true},
                {"id": "cv_gout", "type": "yesno", "label": "Gout", "label_ar": "النقرس", "required": true}
            ]
        },
        {
            "id": "pain_history",
            "title": "Pain History",
            "title_ar": "تاريخ الألم",
            "questions": [
                {"id": "pain_head_neck", "type": "text", "label": "Head/Neck pain (describe)", "label_ar": "ألم الرأس/الرقبة (صف)", "required": false},
                {"id": "pain_upper_back", "type": "text", "label": "Upper Back pain (describe)", "label_ar": "ألم أعلى الظهر (صف)", "required": false},
                {"id": "pain_shoulder", "type": "text", "label": "Shoulder/Clavicle pain (describe)", "label_ar": "ألم الكتف/الترقوة (صف)", "required": false},
                {"id": "pain_arm_elbow", "type": "text", "label": "Arm/Elbow pain (describe)", "label_ar": "ألم الذراع/المرفق (صف)", "required": false},
                {"id": "pain_wrist_hand", "type": "text", "label": "Wrist/Hand pain (describe)", "label_ar": "ألم الرسغ/اليد (صف)", "required": false},
                {"id": "pain_lower_back", "type": "text", "label": "Lower Back pain (describe)", "label_ar": "ألم أسفل الظهر (صف)", "required": false},
                {"id": "pain_hip_pelvis", "type": "text", "label": "Hip/Pelvis pain (describe)", "label_ar": "ألم الورك/الحوض (صف)", "required": false},
                {"id": "pain_thigh_knee", "type": "text", "label": "Thigh/Knee pain (describe)", "label_ar": "ألم الفخذ/الركبة (صف)", "required": false},
                {"id": "pain_arthritis", "type": "text", "label": "Arthritis (describe)", "label_ar": "التهاب المفاصل (صف)", "required": false},
                {"id": "pain_hernia", "type": "text", "label": "Hernia (describe)", "label_ar": "الفتق (صف)", "required": false},
                {"id": "surgeries", "type": "textarea", "label": "Surgeries (describe)", "label_ar": "العمليات الجراحية (صف)", "required": false},
                {"id": "other_pain", "type": "textarea", "label": "Other pain (describe)", "label_ar": "ألم آخر (صف)", "required": false}
            ]
        },
        {
            "id": "nutrition",
            "title": "Nutrition",
            "title_ar": "التغذية",
            "questions": [
                {"id": "specific_diet", "type": "yesno", "label": "Are you on any specific food/diet plan?", "label_ar": "هل تتبع نظام غذائي محدد؟", "required": true},
                {"id": "diet_details", "type": "textarea", "label": "If yes, list diet and who prescribed it", "label_ar": "إذا نعم، اذكر النظام ومن وصفه", "required": false, "conditional": {"field": "specific_diet", "value": true}},
                {"id": "supplements", "type": "yesno", "label": "Do you take dietary supplements?", "label_ar": "هل تتناول مكملات غذائية؟", "required": true},
                {"id": "supplements_list", "type": "textarea", "label": "If yes, please list", "label_ar": "إذا نعم، اذكرها", "required": false, "conditional": {"field": "supplements", "value": true}},
                {"id": "weight_fluctuating", "type": "yesno", "label": "Do you notice your weight fluctuating?", "label_ar": "هل تلاحظ تقلب وزنك؟", "required": true},
                {"id": "recent_weight_change", "type": "yesno", "label": "Have you experienced a recent weight gain or loss?", "label_ar": "هل عانيت من زيادة أو نقصان في الوزن مؤخراً؟", "required": true},
                {"id": "weight_change_details", "type": "textarea", "label": "If yes, explain how and over what amount of time", "label_ar": "إذا نعم، اشرح كيف وخلال أي فترة", "required": false, "conditional": {"field": "recent_weight_change", "value": true}},
                {"id": "caffeine_beverages", "type": "text", "label": "How many caffeine beverages per day? What are they?", "label_ar": "كم مشروب يحتوي على كافيين يومياً؟ ما هي؟", "required": false},
                {"id": "nutritional_behaviors", "type": "textarea", "label": "How would you describe your current nutritional behaviors?", "label_ar": "كيف تصف سلوكياتك الغذائية الحالية؟", "required": false},
                {"id": "food_issues", "type": "textarea", "label": "Other food/nutritional issues (allergies, mealtimes, etc.)", "label_ar": "مشاكل غذائية أخرى (حساسية، أوقات الوجبات، إلخ)", "required": false}
            ]
        },
        {
            "id": "work_environment",
            "title": "Work and Environment",
            "title_ar": "العمل والبيئة",
            "questions": [
                {"id": "activity_level", "type": "select", "label": "Work and exercise habits", "label_ar": "عادات العمل والتمارين", "required": true, "options": [
                    {"value": "intense_both", "label": "Intense occupational and recreational effort", "label_ar": "جهد مكثف في العمل والترفيه"},
                    {"value": "moderate_both", "label": "Moderate occupational and recreational effort", "label_ar": "جهد معتدل في العمل والترفيه"},
                    {"value": "sedentary_intense", "label": "Sedentary occupational and intense recreational effort", "label_ar": "عمل مكتبي وترفيه مكثف"},
                    {"value": "sedentary_moderate", "label": "Sedentary occupational and moderate recreational effort", "label_ar": "عمل مكتبي وترفيه معتدل"},
                    {"value": "sedentary_light", "label": "Sedentary occupational and light recreational effort", "label_ar": "عمل مكتبي وترفيه خفيف"},
                    {"value": "no_activity", "label": "Complete lack of activity", "label_ar": "انعدام النشاط تماماً"}
                ]},
                {"id": "work_stress", "type": "select", "label": "Work environment stress", "label_ar": "ضغط بيئة العمل", "required": true, "options": [
                    {"value": "minimal", "label": "Minimal", "label_ar": "أدنى"},
                    {"value": "moderate", "label": "Moderate", "label_ar": "معتدل"},
                    {"value": "average", "label": "Average", "label_ar": "متوسط"},
                    {"value": "extremely", "label": "Extremely", "label_ar": "شديد للغاية"}
                ]},
                {"id": "home_stress", "type": "select", "label": "Home environment stress", "label_ar": "ضغط بيئة المنزل", "required": true, "options": [
                    {"value": "minimal", "label": "Minimal", "label_ar": "أدنى"},
                    {"value": "moderate", "label": "Moderate", "label_ar": "معتدل"},
                    {"value": "average", "label": "Average", "label_ar": "متوسط"},
                    {"value": "extremely", "label": "Extremely", "label_ar": "شديد للغاية"}
                ]},
                {"id": "work_over_40", "type": "yesno", "label": "Do you work more than 40 hours a week?", "label_ar": "هل تعمل أكثر من 40 ساعة أسبوعياً؟", "required": true},
                {"id": "additional_notes", "type": "textarea", "label": "Anything else you would like your nutrition coach to know?", "label_ar": "أي شيء آخر تود أن يعرفه مدرب التغذية؟", "required": false}
            ]
        },
        {
            "id": "signature",
            "title": "Signature",
            "title_ar": "التوقيع",
            "questions": [
                {"id": "printed_name", "type": "text", "label": "Printed Name", "label_ar": "الاسم المطبوع", "required": true},
                {"id": "signature_date", "type": "date", "label": "Date", "label_ar": "التاريخ", "required": true},
                {"id": "signature", "type": "signature", "label": "Signature", "label_ar": "التوقيع", "required": true},
                {"id": "parent_signature", "type": "signature", "label": "Parent/Guardian Signature (if under 18)", "label_ar": "توقيع الوالد/الوصي (إذا كان العمر أقل من 18)", "required": false}
            ]
        }
    ]'::jsonb
),

-- 3. Medical History Form
(
    'Medical History',
    'التاريخ الطبي',
    'Quick medical condition checklist',
    'قائمة مراجعة سريعة للحالات الطبية',
    'medical_history',
    true,
    '[
        {
            "id": "personal_info",
            "title": "Personal Information",
            "title_ar": "المعلومات الشخصية",
            "questions": [
                {"id": "full_name", "type": "text", "label": "Name", "label_ar": "الاسم", "required": true},
                {"id": "date", "type": "date", "label": "Date", "label_ar": "التاريخ", "required": true}
            ]
        },
        {
            "id": "medical_conditions",
            "title": "Medical Conditions",
            "title_ar": "الحالات الطبية",
            "description": "Please indicate if you (personally) have a history of the following:",
            "description_ar": "يرجى الإشارة إذا كان لديك (شخصياً) تاريخ مع أي مما يلي:",
            "questions": [
                {"id": "heart_attack", "type": "yesno", "label": "Heart attack", "label_ar": "نوبة قلبية", "required": true},
                {"id": "bypass_surgery", "type": "yesno", "label": "Bypass or cardiac surgery", "label_ar": "جراحة مجازة أو جراحة قلبية", "required": true},
                {"id": "chest_discomfort", "type": "yesno", "label": "Chest discomfort with exertion", "label_ar": "انزعاج في الصدر مع المجهود", "required": true},
                {"id": "high_blood_pressure", "type": "yesno", "label": "High blood pressure", "label_ar": "ارتفاع ضغط الدم", "required": true},
                {"id": "rapid_heartbeat", "type": "yesno", "label": "Rapid or runaway heartbeat", "label_ar": "نبضات قلب سريعة أو متسارعة", "required": true},
                {"id": "skipped_heartbeat", "type": "yesno", "label": "Skipped heartbeat", "label_ar": "تخطي نبضات القلب", "required": true},
                {"id": "rheumatic_fever", "type": "yesno", "label": "Rheumatic fever", "label_ar": "الحمى الروماتيزمية", "required": true},
                {"id": "phlebitis_embolism", "type": "yesno", "label": "Phlebitis or embolism", "label_ar": "التهاب الوريد أو الانسداد", "required": true},
                {"id": "shortness_of_breath", "type": "yesno", "label": "Shortness of breath with or without exercise", "label_ar": "ضيق التنفس مع أو بدون تمارين", "required": true},
                {"id": "fainting", "type": "yesno", "label": "Fainting or light-headedness", "label_ar": "الإغماء أو الدوار", "required": true},
                {"id": "pulmonary_disease", "type": "yesno", "label": "Pulmonary disease or disorder", "label_ar": "مرض أو اضطراب رئوي", "required": true},
                {"id": "high_blood_fat", "type": "yesno", "label": "High blood fat (lipid) level", "label_ar": "ارتفاع مستوى دهون الدم", "required": true},
                {"id": "stroke", "type": "yesno", "label": "Stroke", "label_ar": "سكتة دماغية", "required": true},
                {"id": "recent_hospitalization", "type": "yesno", "label": "Recent hospitalization for any cause", "label_ar": "دخول المستشفى مؤخراً لأي سبب", "required": true},
                {"id": "hospitalization_reason", "type": "textarea", "label": "If yes, reason for hospitalization", "label_ar": "إذا نعم، سبب دخول المستشفى", "required": false, "conditional": {"field": "recent_hospitalization", "value": true}},
                {"id": "orthopedic_conditions", "type": "yesno", "label": "Orthopedic conditions (including arthritis)", "label_ar": "حالات العظام (بما في ذلك التهاب المفاصل)", "required": true},
                {"id": "orthopedic_details", "type": "textarea", "label": "Please describe orthopedic conditions", "label_ar": "يرجى وصف حالات العظام", "required": false, "conditional": {"field": "orthopedic_conditions", "value": true}}
            ]
        },
        {
            "id": "other_conditions",
            "title": "Other Diagnosed Conditions",
            "title_ar": "حالات أخرى مشخصة",
            "questions": [
                {"id": "other_conditions_list", "type": "textarea", "label": "Please list any other diagnosed conditions and when they were diagnosed", "label_ar": "يرجى ذكر أي حالات أخرى مشخصة ومتى تم تشخيصها", "required": false}
            ]
        }
    ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Function to auto-assign initial intake forms to new clients
CREATE OR REPLACE FUNCTION auto_assign_intake_forms()
RETURNS TRIGGER AS $$
DECLARE
    template_record RECORD;
BEGIN
    -- Only for users with role 'user' (clients)
    IF NEW.role = 'user' THEN
        -- Assign all default forms as initial intake
        FOR template_record IN
            SELECT id FROM form_templates WHERE is_default = true AND is_active = true
        LOOP
            INSERT INTO form_assignments (
                form_template_id,
                client_id,
                is_required,
                is_initial_intake,
                status
            ) VALUES (
                template_record.id,
                NEW.id,
                true,
                true,
                'pending'
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign forms on user_profiles insert
DROP TRIGGER IF EXISTS trigger_auto_assign_intake_forms ON user_profiles;
CREATE TRIGGER trigger_auto_assign_intake_forms
    AFTER INSERT ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_intake_forms();

-- Function to notify nutritionist when form is submitted
CREATE OR REPLACE FUNCTION notify_form_submission()
RETURNS TRIGGER AS $$
DECLARE
    client_name TEXT;
    form_name TEXT;
    nutritionist_ids UUID[];
BEGIN
    -- Get client name
    SELECT full_name INTO client_name FROM user_profiles WHERE id = NEW.client_id;

    -- Get form name
    SELECT ft.name INTO form_name
    FROM form_templates ft
    JOIN form_assignments fa ON fa.form_template_id = ft.id
    WHERE fa.id = NEW.assignment_id;

    -- Get all nutritionists
    SELECT ARRAY_AGG(id) INTO nutritionist_ids
    FROM user_profiles
    WHERE role IN ('nutritionist', 'admin', 'super_admin');

    -- Create notification for each nutritionist
    IF nutritionist_ids IS NOT NULL THEN
        INSERT INTO notifications (user_id, type, title, message, data)
        SELECT
            unnest(nutritionist_ids),
            'form_submitted',
            'New Form Submission',
            client_name || ' has submitted: ' || form_name,
            jsonb_build_object(
                'assignment_id', NEW.assignment_id,
                'client_id', NEW.client_id,
                'form_name', form_name
            );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for form submission notifications
DROP TRIGGER IF EXISTS trigger_notify_form_submission ON form_responses;
CREATE TRIGGER trigger_notify_form_submission
    AFTER INSERT ON form_responses
    FOR EACH ROW
    EXECUTE FUNCTION notify_form_submission();

-- Enable realtime for form tables
ALTER PUBLICATION supabase_realtime ADD TABLE form_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE form_responses;
ALTER PUBLICATION supabase_realtime ADD TABLE form_edit_requests;
