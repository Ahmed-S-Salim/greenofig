-- GreenoFig Branded Form Templates
-- Based on the 4 PDF forms, creating English and Arabic versions

-- 1. Exercise History Form - English
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Exercise History',
  'تاريخ التمارين',
  'Questionnaire about your exercise habits and sports activities',
  'استبيان حول عاداتك الرياضية والأنشطة البدنية',
  'exercise_history',
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
        {"id": "avg_miles", "type": "text", "label": "If yes, what is the average number of miles you cover in a workout?", "label_ar": "إذا نعم، ما هو متوسط عدد الأميال التي تقطعها في التمرين؟", "required": false},
        {"id": "avg_time_per_mile", "type": "text", "label": "What is your average time per mile?", "label_ar": "ما هو متوسط وقتك لكل ميل؟", "required": false},
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
          {"value": "bowling", "label": "Bowling", "label_ar": "البولينج"},
          {"value": "football", "label": "Football", "label_ar": "كرة القدم الأمريكية"},
          {"value": "tennis", "label": "Tennis", "label_ar": "التنس"},
          {"value": "baseball", "label": "Baseball", "label_ar": "البيسبول"},
          {"value": "racquetball", "label": "Racquetball", "label_ar": "الراكيتبول"},
          {"value": "track", "label": "Track", "label_ar": "ألعاب القوى"},
          {"value": "soccer", "label": "Soccer", "label_ar": "كرة القدم"},
          {"value": "basketball", "label": "Basketball", "label_ar": "كرة السلة"}
        ]},
        {"id": "other_sports", "type": "text", "label": "Other sports", "label_ar": "رياضات أخرى", "required": false},
        {"id": "times_per_week", "type": "number", "label": "Average number of times per week", "label_ar": "متوسط عدد المرات في الأسبوع", "required": false}
      ]
    },
    {
      "id": "limitations",
      "title": "Limitations & Pain",
      "title_ar": "القيود والألم",
      "questions": [
        {"id": "desired_activities", "type": "textarea", "label": "Are there any sports or activities you would like to participate in? If yes, why are you currently unable to do so?", "label_ar": "هل هناك رياضات أو أنشطة ترغب في المشاركة فيها؟ إذا نعم، لماذا لا تستطيع حالياً؟", "required": false},
        {"id": "pain_during_activity", "type": "yes_no", "label": "Do you have pain when participating in sport or activity?", "label_ar": "هل تشعر بألم عند ممارسة الرياضة أو النشاط؟", "required": true},
        {"id": "pain_description", "type": "textarea", "label": "If yes, please describe", "label_ar": "إذا نعم، يرجى الوصف", "required": false},
        {"id": "notes", "type": "textarea", "label": "Additional Notes", "label_ar": "ملاحظات إضافية", "required": false}
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
);

-- 2. Health History Form - English (4 pages comprehensive)
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Health History',
  'التاريخ الصحي',
  'Comprehensive health history questionnaire covering medical, lifestyle, and dietary information',
  'استبيان شامل للتاريخ الصحي يغطي المعلومات الطبية ونمط الحياة والنظام الغذائي',
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
        {"id": "address", "type": "text", "label": "Address", "label_ar": "العنوان", "required": false},
        {"id": "city_state_zip", "type": "text", "label": "City, State, Zip", "label_ar": "المدينة، المنطقة، الرمز البريدي", "required": false},
        {"id": "home_phone", "type": "phone", "label": "Home Phone", "label_ar": "هاتف المنزل", "required": false},
        {"id": "work_phone", "type": "phone", "label": "Work Phone", "label_ar": "هاتف العمل", "required": false},
        {"id": "employer", "type": "text", "label": "Employer", "label_ar": "جهة العمل", "required": false},
        {"id": "occupation", "type": "text", "label": "Occupation", "label_ar": "المهنة", "required": false}
      ]
    },
    {
      "id": "emergency_contact",
      "title": "Emergency Contact",
      "title_ar": "جهة الاتصال في حالات الطوارئ",
      "questions": [
        {"id": "emergency_name", "type": "text", "label": "Emergency Contact Name", "label_ar": "اسم جهة الاتصال الطارئة", "required": true},
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
        {"id": "under_care", "type": "yes_no", "label": "Are you under the care of a physician, chiropractor, or other health care professional?", "label_ar": "هل أنت تحت رعاية طبيب أو معالج يدوي أو متخصص صحي آخر؟", "required": true},
        {"id": "care_reason", "type": "textarea", "label": "If yes, list reason", "label_ar": "إذا نعم، اذكر السبب", "required": false}
      ]
    },
    {
      "id": "medications",
      "title": "Medications & Allergies",
      "title_ar": "الأدوية والحساسية",
      "questions": [
        {"id": "taking_medications", "type": "yes_no", "label": "Are you taking any medications?", "label_ar": "هل تتناول أي أدوية؟", "required": true},
        {"id": "medications_list", "type": "textarea", "label": "If yes, please list (Medication, Dosage, Condition)", "label_ar": "إذا نعم، يرجى ذكرها (الدواء، الجرعة، الحالة)", "required": false},
        {"id": "allergies", "type": "textarea", "label": "List any and all allergies", "label_ar": "اذكر جميع أنواع الحساسية", "required": false}
      ]
    },
    {
      "id": "medical_conditions",
      "title": "Medical Conditions",
      "title_ar": "الحالات الطبية",
      "questions": [
        {"id": "high_blood_pressure", "type": "yes_no", "label": "Has your doctor ever diagnosed you with high blood pressure?", "label_ar": "هل شخصك طبيبك بارتفاع ضغط الدم؟", "required": true},
        {"id": "bone_joint_problem", "type": "yes_no", "label": "Has your doctor diagnosed you with a bone or joint problem that could be made worse by exercise?", "label_ar": "هل شخصك طبيبك بمشكلة في العظام أو المفاصل قد تتفاقم بالتمارين؟", "required": true},
        {"id": "over_65", "type": "yes_no", "label": "Are you over 65 years of age?", "label_ar": "هل عمرك أكثر من 65 سنة؟", "required": true},
        {"id": "used_to_vigorous", "type": "yes_no", "label": "Are you used to vigorous exercise?", "label_ar": "هل اعتدت على التمارين الشاقة؟", "required": true},
        {"id": "reason_not_exercise", "type": "yes_no", "label": "Is there any reason not mentioned why you should not follow a regular exercise program?", "label_ar": "هل هناك سبب لم يُذكر يمنعك من اتباع برنامج تمارين منتظم؟", "required": true},
        {"id": "exercise_reason_explain", "type": "textarea", "label": "If yes, please explain", "label_ar": "إذا نعم، يرجى التوضيح", "required": false},
        {"id": "chest_pain", "type": "yes_no", "label": "Have you recently experienced any chest pain associated with exercise or stress?", "label_ar": "هل عانيت مؤخراً من ألم في الصدر مرتبط بالتمارين أو الإجهاد؟", "required": true},
        {"id": "chest_pain_explain", "type": "textarea", "label": "If yes, please explain", "label_ar": "إذا نعم، يرجى التوضيح", "required": false}
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
          {"value": "15_less", "label": "15 or less cigarettes per day", "label_ar": "15 سيجارة أو أقل يومياً"},
          {"value": "16_25", "label": "16 to 25 cigarettes per day", "label_ar": "16 إلى 25 سيجارة يومياً"},
          {"value": "26_35", "label": "26 to 35 cigarettes per day", "label_ar": "26 إلى 35 سيجارة يومياً"},
          {"value": "more_35", "label": "More than 35 cigarettes per day", "label_ar": "أكثر من 35 سيجارة يومياً"}
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
        {"id": "family_respiratory", "type": "text", "label": "Respiratory/Pulmonary Conditions (who)", "label_ar": "أمراض الجهاز التنفسي (من)", "required": false},
        {"id": "family_diabetes", "type": "text", "label": "Diabetes (Type I/II, how long, who)", "label_ar": "السكري (النوع، المدة، من)", "required": false},
        {"id": "family_epilepsy", "type": "text", "label": "Epilepsy (who)", "label_ar": "الصرع (من)", "required": false},
        {"id": "family_osteoporosis", "type": "text", "label": "Osteoporosis (who)", "label_ar": "هشاشة العظام (من)", "required": false}
      ]
    },
    {
      "id": "lifestyle",
      "title": "Lifestyle & Dietary Factors",
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
        {"id": "caffeine", "type": "yes_no", "label": "Do you consume caffeine?", "label_ar": "هل تستهلك الكافيين؟", "required": true},
        {"id": "alcohol", "type": "yes_no", "label": "Do you consume alcohol?", "label_ar": "هل تستهلك الكحول؟", "required": true},
        {"id": "anemia", "type": "yes_no", "label": "Anemia?", "label_ar": "فقر الدم؟", "required": false},
        {"id": "gi_disorder", "type": "yes_no", "label": "Gastrointestinal Disorder?", "label_ar": "اضطراب الجهاز الهضمي؟", "required": false},
        {"id": "hypoglycemia", "type": "yes_no", "label": "Hypoglycemia?", "label_ar": "نقص السكر في الدم؟", "required": false},
        {"id": "thyroid", "type": "yes_no", "label": "Thyroid Disorder?", "label_ar": "اضطراب الغدة الدرقية؟", "required": false},
        {"id": "prenatal", "type": "yes_no", "label": "Pre/Postnatal?", "label_ar": "قبل/بعد الولادة؟", "required": false}
      ]
    },
    {
      "id": "cardiovascular",
      "title": "Cardiovascular",
      "title_ar": "القلب والأوعية الدموية",
      "questions": [
        {"id": "cv_high_bp", "type": "yes_no", "label": "High Blood Pressure", "label_ar": "ارتفاع ضغط الدم", "required": true},
        {"id": "cv_hypertension", "type": "yes_no", "label": "Hypertension", "label_ar": "فرط ضغط الدم", "required": true},
        {"id": "cv_high_cholesterol", "type": "yes_no", "label": "High Cholesterol", "label_ar": "ارتفاع الكوليسترول", "required": true},
        {"id": "cv_hyperlipidemia", "type": "yes_no", "label": "Hyperlipidemia", "label_ar": "فرط شحميات الدم", "required": false},
        {"id": "cv_heart_disease", "type": "yes_no", "label": "Heart Disease", "label_ar": "أمراض القلب", "required": true},
        {"id": "cv_heart_attack", "type": "yes_no", "label": "Heart Attack", "label_ar": "نوبة قلبية", "required": true},
        {"id": "cv_stroke", "type": "yes_no", "label": "Stroke", "label_ar": "سكتة دماغية", "required": true},
        {"id": "cv_angina", "type": "yes_no", "label": "Angina", "label_ar": "الذبحة الصدرية", "required": false},
        {"id": "cv_gout", "type": "yes_no", "label": "Gout", "label_ar": "النقرس", "required": false}
      ]
    },
    {
      "id": "pain_history",
      "title": "Pain History",
      "title_ar": "تاريخ الألم",
      "questions": [
        {"id": "pain_head_neck", "type": "text", "label": "Head/Neck pain (describe)", "label_ar": "ألم الرأس/الرقبة (وصف)", "required": false},
        {"id": "pain_upper_back", "type": "text", "label": "Upper Back pain (describe)", "label_ar": "ألم أعلى الظهر (وصف)", "required": false},
        {"id": "pain_shoulder", "type": "text", "label": "Shoulder/Clavicle pain (describe)", "label_ar": "ألم الكتف/الترقوة (وصف)", "required": false},
        {"id": "pain_arm_elbow", "type": "text", "label": "Arm/Elbow pain (describe)", "label_ar": "ألم الذراع/الكوع (وصف)", "required": false},
        {"id": "pain_wrist_hand", "type": "text", "label": "Wrist/Hand pain (describe)", "label_ar": "ألم الرسغ/اليد (وصف)", "required": false},
        {"id": "pain_lower_back", "type": "text", "label": "Lower Back pain (describe)", "label_ar": "ألم أسفل الظهر (وصف)", "required": false},
        {"id": "pain_hip_pelvis", "type": "text", "label": "Hip/Pelvis pain (describe)", "label_ar": "ألم الورك/الحوض (وصف)", "required": false},
        {"id": "pain_thigh_knee", "type": "text", "label": "Thigh/Knee pain (describe)", "label_ar": "ألم الفخذ/الركبة (وصف)", "required": false},
        {"id": "pain_arthritis", "type": "text", "label": "Arthritis (describe)", "label_ar": "التهاب المفاصل (وصف)", "required": false},
        {"id": "pain_hernia", "type": "text", "label": "Hernia (describe)", "label_ar": "فتق (وصف)", "required": false},
        {"id": "surgeries", "type": "textarea", "label": "Previous Surgeries", "label_ar": "العمليات الجراحية السابقة", "required": false}
      ]
    },
    {
      "id": "nutrition",
      "title": "Nutrition",
      "title_ar": "التغذية",
      "questions": [
        {"id": "specific_diet", "type": "yes_no", "label": "Are you on any specific food/diet plan?", "label_ar": "هل تتبع نظاماً غذائياً محدداً؟", "required": true},
        {"id": "diet_details", "type": "textarea", "label": "If yes, please list and advise who prescribed it", "label_ar": "إذا نعم، اذكر التفاصيل ومن وصفه", "required": false},
        {"id": "dietary_supplements", "type": "yes_no", "label": "Do you take dietary supplements?", "label_ar": "هل تتناول مكملات غذائية؟", "required": true},
        {"id": "supplements_list", "type": "textarea", "label": "If yes, please list", "label_ar": "إذا نعم، اذكرها", "required": false},
        {"id": "weight_fluctuating", "type": "yes_no", "label": "Do you notice your weight fluctuating?", "label_ar": "هل تلاحظ تذبذب وزنك؟", "required": false},
        {"id": "recent_weight_change", "type": "yes_no", "label": "Have you experienced a recent weight gain or loss?", "label_ar": "هل عانيت من زيادة أو نقص في الوزن مؤخراً؟", "required": false},
        {"id": "weight_change_details", "type": "textarea", "label": "If yes, explain how and over what time", "label_ar": "إذا نعم، اشرح كيف وخلال أي فترة", "required": false},
        {"id": "caffeine_beverages", "type": "text", "label": "How many caffeine beverages per day? What are they?", "label_ar": "كم مشروب كافيين تتناول يومياً؟ ما هي؟", "required": false},
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
          {"value": "intense_both", "label": "Intense occupational and recreational effort", "label_ar": "جهد مهني وترفيهي مكثف"},
          {"value": "moderate_both", "label": "Moderate occupational and recreational effort", "label_ar": "جهد مهني وترفيهي متوسط"},
          {"value": "sedentary_intense", "label": "Sedentary occupational and intense recreational effort", "label_ar": "عمل مكتبي وجهد ترفيهي مكثف"},
          {"value": "sedentary_moderate", "label": "Sedentary occupational and moderate recreational effort", "label_ar": "عمل مكتبي وجهد ترفيهي متوسط"},
          {"value": "sedentary_light", "label": "Sedentary occupational and light recreational effort", "label_ar": "عمل مكتبي وجهد ترفيهي خفيف"},
          {"value": "complete_lack", "label": "Complete lack of activity", "label_ar": "انعدام تام للنشاط"}
        ]},
        {"id": "work_stress", "type": "select", "label": "Work environment stress level", "label_ar": "مستوى ضغط بيئة العمل", "required": true, "options": [
          {"value": "minimal", "label": "Minimal", "label_ar": "أدنى"},
          {"value": "moderate", "label": "Moderate", "label_ar": "متوسط"},
          {"value": "average", "label": "Average", "label_ar": "متوسط"},
          {"value": "extremely", "label": "Extremely", "label_ar": "شديد جداً"}
        ]},
        {"id": "home_stress", "type": "select", "label": "Home environment stress level", "label_ar": "مستوى ضغط بيئة المنزل", "required": true, "options": [
          {"value": "minimal", "label": "Minimal", "label_ar": "أدنى"},
          {"value": "moderate", "label": "Moderate", "label_ar": "متوسط"},
          {"value": "average", "label": "Average", "label_ar": "متوسط"},
          {"value": "extremely", "label": "Extremely", "label_ar": "شديد جداً"}
        ]},
        {"id": "work_40_hours", "type": "yes_no", "label": "Do you work more than 40 hours a week?", "label_ar": "هل تعمل أكثر من 40 ساعة أسبوعياً؟", "required": false},
        {"id": "additional_info", "type": "textarea", "label": "Anything else you would like your nutrition coach to know?", "label_ar": "أي شيء آخر تريد أن يعرفه مدرب التغذية الخاص بك؟", "required": false}
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
);

-- 3. Medical History Form - English
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Medical History',
  'التاريخ الطبي',
  'Medical history form covering personal medical conditions and hospitalization',
  'نموذج التاريخ الطبي يغطي الحالات الطبية الشخصية والاستشفاء',
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
      "description": "Please indicate if you (personally) have a history of the following",
      "description_ar": "يرجى الإشارة إذا كان لديك (شخصياً) تاريخ من الحالات التالية",
      "questions": [
        {"id": "heart_attack", "type": "yes_no", "label": "Heart attack", "label_ar": "نوبة قلبية", "required": true},
        {"id": "bypass_surgery", "type": "yes_no", "label": "Bypass or cardiac surgery", "label_ar": "جراحة قلب أو تحويلة", "required": true},
        {"id": "chest_discomfort", "type": "yes_no", "label": "Chest discomfort with exertion", "label_ar": "انزعاج في الصدر مع المجهود", "required": true},
        {"id": "high_bp", "type": "yes_no", "label": "High blood pressure", "label_ar": "ارتفاع ضغط الدم", "required": true},
        {"id": "rapid_heartbeat", "type": "yes_no", "label": "Rapid or runaway heartbeat", "label_ar": "ضربات قلب سريعة أو غير منتظمة", "required": true},
        {"id": "skipped_heartbeat", "type": "yes_no", "label": "Skipped heartbeat", "label_ar": "تخطي نبضات القلب", "required": true},
        {"id": "rheumatic_fever", "type": "yes_no", "label": "Rheumatic fever", "label_ar": "الحمى الروماتيزمية", "required": true},
        {"id": "phlebitis_embolism", "type": "yes_no", "label": "Phlebitis or embolism", "label_ar": "التهاب الوريد أو انسداد", "required": true},
        {"id": "shortness_breath", "type": "yes_no", "label": "Shortness of breath with or without exercise", "label_ar": "ضيق التنفس مع أو بدون تمارين", "required": true},
        {"id": "fainting", "type": "yes_no", "label": "Fainting or light-headedness", "label_ar": "إغماء أو دوخة", "required": true},
        {"id": "pulmonary_disease", "type": "yes_no", "label": "Pulmonary disease or disorder", "label_ar": "مرض أو اضطراب رئوي", "required": true},
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
        {"id": "other_conditions", "type": "textarea", "label": "Please list any other diagnosed conditions and when they were diagnosed", "label_ar": "يرجى ذكر أي حالات مشخصة أخرى ومتى تم تشخيصها", "required": false}
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
);

-- 4. Client Intake/Screening Form - English
INSERT INTO form_templates (name, name_ar, description, description_ar, form_type, sections, is_active, created_by)
VALUES (
  'Client Intake Screening',
  'نموذج فحص العميل',
  'Initial client intake form with health screening questions',
  'نموذج استقبال العميل الأولي مع أسئلة الفحص الصحي',
  'client_screening',
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
        {"id": "city_state_zip", "type": "text", "label": "City, State, Zip", "label_ar": "المدينة، المنطقة، الرمز البريدي", "required": false},
        {"id": "home_phone", "type": "phone", "label": "Home Phone", "label_ar": "هاتف المنزل", "required": false},
        {"id": "work_phone", "type": "phone", "label": "Work Phone", "label_ar": "هاتف العمل", "required": false},
        {"id": "employer", "type": "text", "label": "Employer", "label_ar": "جهة العمل", "required": false},
        {"id": "occupation", "type": "text", "label": "Occupation", "label_ar": "المهنة", "required": false}
      ]
    },
    {
      "id": "heart_conditions",
      "title": "Heart & Cardiovascular Conditions",
      "title_ar": "أمراض القلب والأوعية الدموية",
      "questions": [
        {"id": "heart_condition", "type": "yes_no", "label": "Has a doctor diagnosed you with a heart condition?", "label_ar": "هل شخصك طبيب بحالة قلبية؟", "required": true},
        {"id": "angina_pain", "type": "yes_no", "label": "Have you ever had angina pectoris, sharp pain, or heavy pressure in your chest as a result of exercise or physical activity?", "label_ar": "هل عانيت من الذبحة الصدرية أو ألم حاد أو ضغط شديد في صدرك نتيجة التمارين أو النشاط البدني؟", "required": true},
        {"id": "cold_chest_pain", "type": "yes_no", "label": "Do you experience any sharp pain or extreme tightness in your chest in cold temperatures?", "label_ar": "هل تشعر بألم حاد أو ضيق شديد في صدرك في درجات الحرارة الباردة؟", "required": true},
        {"id": "rapid_heartbeat", "type": "yes_no", "label": "Have you ever experienced rapid heart beat or palpitations?", "label_ar": "هل عانيت من ضربات قلب سريعة أو خفقان؟", "required": true},
        {"id": "heart_attack", "type": "yes_no", "label": "Have you ever had a real or suspected heart attack, coronary occlusion, myocardial infarction, coronary insufficiency, or thrombosis?", "label_ar": "هل أصبت بنوبة قلبية حقيقية أو مشتبه بها، انسداد الشريان التاجي، احتشاء عضلة القلب، قصور الشريان التاجي، أو تجلط؟", "required": true},
        {"id": "rheumatic_fever", "type": "yes_no", "label": "Have you ever had rheumatic fever?", "label_ar": "هل أصبت بالحمى الروماتيزمية؟", "required": true}
      ]
    },
    {
      "id": "health_conditions",
      "title": "Health Conditions",
      "title_ar": "الحالات الصحية",
      "questions": [
        {"id": "diabetes_hypertension", "type": "yes_no", "label": "Do you have or have you had diabetes, hypertension, or high blood pressure?", "label_ar": "هل تعاني أو عانيت من السكري أو ارتفاع ضغط الدم؟", "required": true},
        {"id": "family_diabetes", "type": "yes_no", "label": "Does anyone in your family have diabetes, hypertension, or high blood pressure?", "label_ar": "هل يعاني أحد في عائلتك من السكري أو ارتفاع ضغط الدم؟", "required": true},
        {"id": "family_heart_disease", "type": "yes_no", "label": "Has any blood relative (parent, sibling, first cousin) had a heart attack or coronary artery disease before the age of 60?", "label_ar": "هل أصيب أي قريب بالدم (والد، أخ، ابن عم) بنوبة قلبية أو مرض الشريان التاجي قبل سن 60؟", "required": true},
        {"id": "cholesterol_meds", "type": "yes_no", "label": "Have you ever or do you take medications or been on a special diet to lower your cholesterol?", "label_ar": "هل تناولت أو تتناول أدوية أو اتبعت نظاماً غذائياً خاصاً لخفض الكوليسترول؟", "required": true},
        {"id": "heart_drugs", "type": "yes_no", "label": "Have you ever taken digitalis, quinine, or any other drug for your heart?", "label_ar": "هل تناولت الديجيتالس أو الكينين أو أي دواء آخر لقلبك؟", "required": true},
        {"id": "nitroglycerine", "type": "yes_no", "label": "Have you ever taken nitroglycerine or any other tablets for chest pain?", "label_ar": "هل تناولت النيتروجليسرين أو أي أقراص أخرى لألم الصدر؟", "required": true}
      ]
    },
    {
      "id": "lifestyle",
      "title": "Lifestyle",
      "title_ar": "نمط الحياة",
      "questions": [
        {"id": "overweight", "type": "yes_no", "label": "Are you overweight?", "label_ar": "هل تعاني من زيادة الوزن؟", "required": true},
        {"id": "excessive_stress", "type": "yes_no", "label": "Are you under excessive stress?", "label_ar": "هل تعاني من ضغط مفرط؟", "required": true},
        {"id": "heavy_drinking", "type": "yes_no", "label": "Do you drink heavily?", "label_ar": "هل تشرب بكثرة؟", "required": true},
        {"id": "smoke_tobacco", "type": "yes_no", "label": "Do you smoke tobacco?", "label_ar": "هل تدخن التبغ؟", "required": true},
        {"id": "physical_condition", "type": "yes_no", "label": "Do you have a physical condition, impairment or disability, including a joint or muscle problem, that should be considered before you begin a nutrition program?", "label_ar": "هل لديك حالة جسدية أو إعاقة، بما في ذلك مشكلة في المفاصل أو العضلات، يجب مراعاتها قبل بدء برنامج التغذية؟", "required": true}
      ]
    },
    {
      "id": "age_exercise",
      "title": "Age & Exercise",
      "title_ar": "العمر والتمارين",
      "questions": [
        {"id": "over_65", "type": "yes_no", "label": "Are you over 65 years old?", "label_ar": "هل عمرك أكثر من 65 سنة؟", "required": true},
        {"id": "over_35", "type": "yes_no", "label": "Are you over 35 years old?", "label_ar": "هل عمرك أكثر من 35 سنة؟", "required": true},
        {"id": "exercise_less_3x", "type": "yes_no", "label": "Do you exercise fewer than three times per week?", "label_ar": "هل تمارس الرياضة أقل من ثلاث مرات أسبوعياً؟", "required": true}
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
);
