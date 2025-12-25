-- GreenoFig Branded Form Templates
-- These are professional intake forms with GreenoFig branding
-- Based on standard fitness/nutrition industry forms

-- Add is_system_template column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_templates'
    AND column_name = 'is_system_template'
  ) THEN
    ALTER TABLE public.form_templates ADD COLUMN is_system_template BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_templates'
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.form_templates ADD COLUMN category TEXT DEFAULT 'intake';
  END IF;
END $$;

-- Allow read access to all authenticated users for system templates
DROP POLICY IF EXISTS "Anyone can read system templates" ON public.form_templates;
CREATE POLICY "Anyone can read system templates" ON public.form_templates
  FOR SELECT USING (is_system_template = true);

-- DELETE existing GreenoFig system templates to avoid duplicates
DELETE FROM public.form_templates WHERE is_system_template = true;

-- =====================================================
-- FORM 1: Exercise History
-- =====================================================
INSERT INTO public.form_templates (name, name_ar, description, description_ar, category, is_system_template, form_type, sections)
VALUES (
  'Exercise History',
  'تاريخ التمارين الرياضية',
  'Comprehensive exercise and fitness history questionnaire',
  'استبيان شامل عن تاريخ التمارين واللياقة البدنية',
  'fitness',
  true,
  'custom',
  '[
    {
      "title": "Current Exercise Program",
      "title_ar": "برنامج التمارين الحالي",
      "questions": [
        {
          "id": "ex_regular_program",
          "label": "Are you currently involved in a regular exercise program?",
          "label_ar": "هل تشارك حالياً في برنامج تمارين منتظم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "ex_walk_run",
          "label": "Do you regularly walk or run 1 or more miles continuously?",
          "label_ar": "هل تمشي أو تركض ميلاً واحداً أو أكثر بشكل منتظم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "ex_avg_miles",
          "label": "If yes, what is the average number of miles you cover in a workout?",
          "label_ar": "إذا كانت الإجابة نعم، ما هو متوسط عدد الأميال التي تقطعها في التمرين؟",
          "type": "text",
          "required": false
        },
        {
          "id": "ex_avg_time_mile",
          "label": "What is your average time per mile?",
          "label_ar": "ما هو متوسط وقتك للميل الواحد؟",
          "type": "text",
          "required": false
        },
        {
          "id": "ex_lift_weights",
          "label": "Do you lift weights?",
          "label_ar": "هل ترفع الأثقال؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "ex_aerobic",
          "label": "Are you involved in an aerobic program?",
          "label_ar": "هل تشارك في برنامج تمارين هوائية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "ex_aerobic_types",
          "label": "If yes, what type(s) of aerobic exercise?",
          "label_ar": "إذا كانت الإجابة نعم، ما نوع التمارين الهوائية؟",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Competitive Sports",
      "title_ar": "الرياضات التنافسية",
      "questions": [
        {
          "id": "ex_competitive",
          "label": "Do you frequently compete in competitive sports?",
          "label_ar": "هل تشارك بشكل متكرر في الرياضات التنافسية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "ex_sports_list",
          "label": "If yes, which sports do you participate in?",
          "label_ar": "إذا كانت الإجابة نعم، ما هي الرياضات التي تمارسها؟",
          "type": "checkbox",
          "options": ["Golf", "Volleyball", "Bowling", "Football", "Tennis", "Baseball", "Racquetball", "Track", "Soccer", "Basketball", "Swimming", "Cycling", "Other"],
          "options_ar": ["الجولف", "الكرة الطائرة", "البولينج", "كرة القدم الأمريكية", "التنس", "البيسبول", "الراكيتبول", "الجري", "كرة القدم", "كرة السلة", "السباحة", "ركوب الدراجات", "أخرى"],
          "required": false
        },
        {
          "id": "ex_sports_frequency",
          "label": "Average number of times per week you play sports:",
          "label_ar": "متوسط عدد مرات ممارسة الرياضة في الأسبوع:",
          "type": "number",
          "required": false
        }
      ]
    },
    {
      "title": "Goals and Limitations",
      "title_ar": "الأهداف والقيود",
      "questions": [
        {
          "id": "ex_desired_activities",
          "label": "Are there any sports or activities you would like to participate in? If yes, why are you currently unable to do so?",
          "label_ar": "هل هناك رياضات أو أنشطة ترغب في المشاركة فيها؟ إذا كانت الإجابة نعم، لماذا لا تستطيع حالياً؟",
          "type": "textarea",
          "required": false
        },
        {
          "id": "ex_pain_activity",
          "label": "Do you have pain when participating in sport or activity?",
          "label_ar": "هل تشعر بألم عند ممارسة الرياضة أو النشاط؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "ex_pain_description",
          "label": "If yes, please describe the pain:",
          "label_ar": "إذا كانت الإجابة نعم، يرجى وصف الألم:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "ex_notes",
          "label": "Additional notes about your exercise history:",
          "label_ar": "ملاحظات إضافية حول تاريخ تمارينك:",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {
          "id": "ex_signature",
          "label": "Patient Signature",
          "label_ar": "توقيع المريض",
          "type": "signature",
          "required": true
        }
      ]
    }
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FORM 2: Medical History
-- =====================================================
INSERT INTO public.form_templates (name, name_ar, description, description_ar, category, is_system_template, form_type, sections)
VALUES (
  'Medical History',
  'التاريخ الطبي',
  'Personal medical history questionnaire for health screening',
  'استبيان التاريخ الطبي الشخصي للفحص الصحي',
  'medical',
  true,
  'custom',
  '[
    {
      "title": "Cardiovascular History",
      "title_ar": "تاريخ القلب والأوعية الدموية",
      "questions": [
        {
          "id": "med_heart_attack",
          "label": "Have you had a heart attack?",
          "label_ar": "هل أصبت بنوبة قلبية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_bypass_surgery",
          "label": "Have you had bypass or cardiac surgery?",
          "label_ar": "هل أجريت لك عملية قلب مفتوح أو جراحة قلبية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_chest_discomfort",
          "label": "Do you experience chest discomfort with exertion?",
          "label_ar": "هل تشعر بعدم ارتياح في الصدر عند بذل مجهود؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_high_bp",
          "label": "Do you have high blood pressure?",
          "label_ar": "هل تعاني من ارتفاع ضغط الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_rapid_heartbeat",
          "label": "Do you experience rapid or runaway heartbeat?",
          "label_ar": "هل تعاني من سرعة أو عدم انتظام ضربات القلب؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_skipped_heartbeat",
          "label": "Do you experience skipped heartbeat?",
          "label_ar": "هل تشعر بتخطي ضربات القلب؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_rheumatic_fever",
          "label": "Have you had rheumatic fever?",
          "label_ar": "هل أصبت بالحمى الروماتيزمية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_phlebitis",
          "label": "Have you had phlebitis or embolism?",
          "label_ar": "هل أصبت بالتهاب الوريد أو الانسداد الرئوي؟",
          "type": "yes_no",
          "required": true
        }
      ]
    },
    {
      "title": "Respiratory & Other Conditions",
      "title_ar": "أمراض الجهاز التنفسي وحالات أخرى",
      "questions": [
        {
          "id": "med_shortness_breath",
          "label": "Do you experience shortness of breath with or without exercise?",
          "label_ar": "هل تعاني من ضيق في التنفس مع أو بدون التمرين؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_fainting",
          "label": "Do you experience fainting or light-headedness?",
          "label_ar": "هل تعاني من الإغماء أو الدوخة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_pulmonary",
          "label": "Do you have any pulmonary disease or disorder?",
          "label_ar": "هل تعاني من أي مرض أو اضطراب رئوي؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_high_lipid",
          "label": "Do you have high blood fat (lipid) level?",
          "label_ar": "هل تعاني من ارتفاع الدهون في الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_stroke",
          "label": "Have you had a stroke?",
          "label_ar": "هل أصبت بسكتة دماغية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_hospitalization",
          "label": "Have you been recently hospitalized for any cause?",
          "label_ar": "هل تم إدخالك للمستشفى مؤخراً لأي سبب؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_hospitalization_reason",
          "label": "If yes, what was the reason for hospitalization?",
          "label_ar": "إذا كانت الإجابة نعم، ما سبب دخول المستشفى؟",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Orthopedic & Other Conditions",
      "title_ar": "حالات العظام وحالات أخرى",
      "questions": [
        {
          "id": "med_orthopedic",
          "label": "Do you have any orthopedic conditions (including arthritis)?",
          "label_ar": "هل تعاني من أي حالات في العظام (بما في ذلك التهاب المفاصل)؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "med_orthopedic_desc",
          "label": "If yes, please describe your orthopedic condition:",
          "label_ar": "إذا كانت الإجابة نعم، يرجى وصف حالتك:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "med_other_conditions",
          "label": "Please list any other diagnosed conditions and when they were diagnosed:",
          "label_ar": "يرجى ذكر أي حالات أخرى تم تشخيصها ومتى تم تشخيصها:",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {
          "id": "med_signature",
          "label": "Patient Signature",
          "label_ar": "توقيع المريض",
          "type": "signature",
          "required": true
        }
      ]
    }
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FORM 3: Client Intake / Screening Form
-- =====================================================
INSERT INTO public.form_templates (name, name_ar, description, description_ar, category, is_system_template, form_type, sections)
VALUES (
  'Client Screening Form',
  'نموذج فحص العميل',
  'Comprehensive client intake and health screening questionnaire',
  'استبيان شامل لاستقبال العميل والفحص الصحي',
  'intake',
  true,
  'custom',
  '[
    {
      "title": "Personal Information",
      "title_ar": "المعلومات الشخصية",
      "questions": [
        {
          "id": "scr_dob",
          "label": "Date of Birth",
          "label_ar": "تاريخ الميلاد",
          "type": "date",
          "required": true
        },
        {
          "id": "scr_address",
          "label": "Address",
          "label_ar": "العنوان",
          "type": "text",
          "required": true
        },
        {
          "id": "scr_city_state",
          "label": "City, State, Zip",
          "label_ar": "المدينة، المنطقة، الرمز البريدي",
          "type": "text",
          "required": true
        },
        {
          "id": "scr_home_phone",
          "label": "Home Phone",
          "label_ar": "هاتف المنزل",
          "type": "tel",
          "required": false
        },
        {
          "id": "scr_work_phone",
          "label": "Work Phone",
          "label_ar": "هاتف العمل",
          "type": "tel",
          "required": false
        },
        {
          "id": "scr_employer",
          "label": "Employer",
          "label_ar": "جهة العمل",
          "type": "text",
          "required": false
        },
        {
          "id": "scr_occupation",
          "label": "Occupation",
          "label_ar": "المهنة",
          "type": "text",
          "required": false
        }
      ]
    },
    {
      "title": "Heart & Cardiovascular Health",
      "title_ar": "صحة القلب والأوعية الدموية",
      "questions": [
        {
          "id": "scr_heart_condition",
          "label": "Has a doctor diagnosed you with a heart condition?",
          "label_ar": "هل شخصك طبيب بحالة قلبية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_angina",
          "label": "Have you ever had angina pectoris, sharp pain, or heavy pressure in your chest as a result of exercise or physical activity?",
          "label_ar": "هل عانيت من ذبحة صدرية أو ألم حاد أو ضغط شديد في صدرك نتيجة التمرين أو النشاط البدني؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_cold_chest_pain",
          "label": "Do you experience any sharp pain or extreme tightness in your chest in cold temperatures?",
          "label_ar": "هل تشعر بأي ألم حاد أو ضيق شديد في صدرك في درجات الحرارة الباردة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_palpitations",
          "label": "Have you ever experienced rapid heart beat or palpitations?",
          "label_ar": "هل عانيت من سرعة ضربات القلب أو الخفقان؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_heart_attack",
          "label": "Have you ever had a real or suspected heart attack, coronary occlusion, myocardial infarction, coronary insufficiency, or thrombosis?",
          "label_ar": "هل أصبت بنوبة قلبية حقيقية أو مشتبه بها، أو انسداد الشريان التاجي، أو احتشاء عضلة القلب؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_rheumatic_fever",
          "label": "Have you ever had rheumatic fever?",
          "label_ar": "هل أصبت بالحمى الروماتيزمية؟",
          "type": "yes_no",
          "required": true
        }
      ]
    },
    {
      "title": "Medical Conditions",
      "title_ar": "الحالات الطبية",
      "questions": [
        {
          "id": "scr_diabetes_hypertension",
          "label": "Do you have or have you had diabetes, hypertension, or high blood pressure?",
          "label_ar": "هل تعاني أو عانيت من السكري أو ارتفاع ضغط الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_family_diabetes",
          "label": "Does anyone in your family have diabetes, hypertension, or high blood pressure?",
          "label_ar": "هل يعاني أي فرد من عائلتك من السكري أو ارتفاع ضغط الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_family_heart",
          "label": "Has any blood relative (parent, sibling, first cousin) had a heart attack or coronary artery disease before the age of 60?",
          "label_ar": "هل أصيب أي قريب من الدرجة الأولى بنوبة قلبية أو مرض الشريان التاجي قبل سن 60؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_cholesterol_meds",
          "label": "Have you ever taken medications or been on a special diet to lower your cholesterol?",
          "label_ar": "هل تناولت أدوية أو اتبعت حمية خاصة لخفض الكوليسترول؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_heart_drugs",
          "label": "Have you ever taken digitalis, quinine, or any other drug for your heart?",
          "label_ar": "هل تناولت الديجيتال أو الكينين أو أي دواء آخر للقلب؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_nitroglycerine",
          "label": "Have you ever taken nitroglycerine or any other tablets for chest pain?",
          "label_ar": "هل تناولت النيتروجليسرين أو أي أقراص أخرى لألم الصدر؟",
          "type": "yes_no",
          "required": true
        }
      ]
    },
    {
      "title": "Lifestyle Factors",
      "title_ar": "عوامل نمط الحياة",
      "questions": [
        {
          "id": "scr_overweight",
          "label": "Are you overweight?",
          "label_ar": "هل تعاني من زيادة الوزن؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_stress",
          "label": "Are you under excessive stress?",
          "label_ar": "هل تعاني من ضغط نفسي مفرط؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_alcohol",
          "label": "Do you drink heavily?",
          "label_ar": "هل تشرب الكحول بكثرة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_smoke",
          "label": "Do you smoke tobacco?",
          "label_ar": "هل تدخن التبغ؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_physical_condition",
          "label": "Do you have a physical condition, impairment or disability that should be considered before you begin a nutrition program?",
          "label_ar": "هل لديك حالة جسدية أو إعاقة يجب مراعاتها قبل بدء برنامج التغذية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_over_65",
          "label": "Are you over 65 years old?",
          "label_ar": "هل عمرك أكثر من 65 سنة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_over_35",
          "label": "Are you over 35 years old?",
          "label_ar": "هل عمرك أكثر من 35 سنة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "scr_exercise_frequency",
          "label": "Do you exercise fewer than three times per week?",
          "label_ar": "هل تمارس الرياضة أقل من ثلاث مرات في الأسبوع؟",
          "type": "yes_no",
          "required": true
        }
      ]
    },
    {
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {
          "id": "scr_signature",
          "label": "Patient Signature",
          "label_ar": "توقيع المريض",
          "type": "signature",
          "required": true
        }
      ]
    }
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FORM 4: Comprehensive Health History (4 pages)
-- =====================================================
INSERT INTO public.form_templates (name, name_ar, description, description_ar, category, is_system_template, form_type, sections)
VALUES (
  'Comprehensive Health History',
  'التاريخ الصحي الشامل',
  'Complete health history questionnaire covering medical, lifestyle, cardiovascular, pain, nutrition, and work factors',
  'استبيان شامل للتاريخ الصحي يغطي العوامل الطبية ونمط الحياة والقلب والألم والتغذية والعمل',
  'comprehensive',
  true,
  'custom',
  '[
    {
      "title": "Personal & Emergency Contact",
      "title_ar": "المعلومات الشخصية وجهة الاتصال للطوارئ",
      "questions": [
        {
          "id": "hh_dob",
          "label": "Date of Birth",
          "label_ar": "تاريخ الميلاد",
          "type": "date",
          "required": true
        },
        {
          "id": "hh_address",
          "label": "Address",
          "label_ar": "العنوان",
          "type": "text",
          "required": true
        },
        {
          "id": "hh_city_state",
          "label": "City, State, Zip",
          "label_ar": "المدينة، المنطقة، الرمز البريدي",
          "type": "text",
          "required": true
        },
        {
          "id": "hh_home_phone",
          "label": "Home Phone",
          "label_ar": "هاتف المنزل",
          "type": "tel",
          "required": false
        },
        {
          "id": "hh_work_phone",
          "label": "Work Phone",
          "label_ar": "هاتف العمل",
          "type": "tel",
          "required": false
        },
        {
          "id": "hh_employer",
          "label": "Employer",
          "label_ar": "جهة العمل",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_occupation",
          "label": "Occupation",
          "label_ar": "المهنة",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_emergency_name",
          "label": "Emergency Contact Name",
          "label_ar": "اسم جهة الاتصال للطوارئ",
          "type": "text",
          "required": true
        },
        {
          "id": "hh_emergency_relationship",
          "label": "Relationship to Emergency Contact",
          "label_ar": "علاقتك بجهة الاتصال للطوارئ",
          "type": "text",
          "required": true
        },
        {
          "id": "hh_emergency_phone",
          "label": "Emergency Contact Phone",
          "label_ar": "هاتف جهة الاتصال للطوارئ",
          "type": "tel",
          "required": true
        }
      ]
    },
    {
      "title": "Physician Information",
      "title_ar": "معلومات الطبيب",
      "questions": [
        {
          "id": "hh_physician_name",
          "label": "Current Physician Name",
          "label_ar": "اسم الطبيب الحالي",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_physician_phone",
          "label": "Physician Phone",
          "label_ar": "هاتف الطبيب",
          "type": "tel",
          "required": false
        },
        {
          "id": "hh_under_care",
          "label": "Are you under the care of a physician, chiropractor, or other health care professional?",
          "label_ar": "هل أنت تحت رعاية طبيب أو معالج أو أي متخصص صحي آخر؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_care_reason",
          "label": "If yes, list the reason:",
          "label_ar": "إذا كانت الإجابة نعم، اذكر السبب:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_medications",
          "label": "Are you taking any medications?",
          "label_ar": "هل تتناول أي أدوية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_medications_list",
          "label": "If yes, please list medications, dosage, and condition:",
          "label_ar": "إذا كانت الإجابة نعم، يرجى ذكر الأدوية والجرعات والحالة:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_allergies",
          "label": "List any and all allergies:",
          "label_ar": "اذكر جميع أنواع الحساسية:",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Medical Conditions",
      "title_ar": "الحالات الطبية",
      "questions": [
        {
          "id": "hh_high_bp",
          "label": "Has your doctor ever diagnosed you with high blood pressure?",
          "label_ar": "هل شخصك طبيبك بارتفاع ضغط الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_bone_joint",
          "label": "Has your doctor ever diagnosed you with a bone or joint problem that could be made worse by exercise?",
          "label_ar": "هل شخصك طبيبك بمشكلة في العظام أو المفاصل قد تتفاقم بالتمرين؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_over_65",
          "label": "Are you over 65 years of age?",
          "label_ar": "هل عمرك أكثر من 65 سنة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_vigorous_exercise",
          "label": "Are you used to vigorous exercise?",
          "label_ar": "هل اعتدت على التمارين الشاقة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_exercise_restriction",
          "label": "Is there any reason not mentioned why you should not follow a regular exercise program?",
          "label_ar": "هل هناك أي سبب لم يذكر يمنعك من اتباع برنامج تمارين منتظم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_exercise_restriction_explain",
          "label": "If yes, please explain:",
          "label_ar": "إذا كانت الإجابة نعم، يرجى الشرح:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_chest_pain_recent",
          "label": "Have you recently experienced any chest pain associated with exercise or stress?",
          "label_ar": "هل عانيت مؤخراً من أي ألم في الصدر مرتبط بالتمرين أو الضغط؟",
          "type": "yes_no",
          "required": true
        }
      ]
    },
    {
      "title": "Smoking Habits",
      "title_ar": "عادات التدخين",
      "questions": [
        {
          "id": "hh_smoking_status",
          "label": "What describes your current smoking habits?",
          "label_ar": "ما الذي يصف عادات التدخين الحالية؟",
          "type": "select",
          "options": ["Non-user or former user", "Cigar and/or pipe", "15 or less cigarettes per day", "16 to 25 cigarettes per day", "26 to 35 cigarettes per day", "More than 35 cigarettes per day"],
          "options_ar": ["غير مدخن أو مدخن سابق", "سيجار و/أو غليون", "15 سيجارة أو أقل يومياً", "16 إلى 25 سيجارة يومياً", "26 إلى 35 سيجارة يومياً", "أكثر من 35 سيجارة يومياً"],
          "required": true
        },
        {
          "id": "hh_quit_date",
          "label": "If former smoker, date quit:",
          "label_ar": "إذا كنت مدخناً سابقاً، تاريخ الإقلاع:",
          "type": "date",
          "required": false
        }
      ]
    },
    {
      "title": "Family History",
      "title_ar": "التاريخ العائلي",
      "questions": [
        {
          "id": "hh_family_asthma",
          "label": "Family history of Asthma? If yes, who?",
          "label_ar": "تاريخ عائلي للربو؟ إذا كانت الإجابة نعم، من؟",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_family_respiratory",
          "label": "Family history of Respiratory/Pulmonary Conditions? If yes, who?",
          "label_ar": "تاريخ عائلي لأمراض الجهاز التنفسي؟ إذا كانت الإجابة نعم، من؟",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_family_diabetes",
          "label": "Family history of Diabetes? Type and who?",
          "label_ar": "تاريخ عائلي للسكري؟ النوع ومن؟",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_family_epilepsy",
          "label": "Family history of Epilepsy? If yes, who?",
          "label_ar": "تاريخ عائلي للصرع؟ إذا كانت الإجابة نعم، من؟",
          "type": "text",
          "required": false
        },
        {
          "id": "hh_family_osteoporosis",
          "label": "Family history of Osteoporosis? If yes, who?",
          "label_ar": "تاريخ عائلي لهشاشة العظام؟ إذا كانت الإجابة نعم، من؟",
          "type": "text",
          "required": false
        }
      ]
    },
    {
      "title": "Lifestyle & Dietary Factors",
      "title_ar": "عوامل نمط الحياة والنظام الغذائي",
      "questions": [
        {
          "id": "hh_stress_level",
          "label": "Occupational Stress Level:",
          "label_ar": "مستوى ضغط العمل:",
          "type": "select",
          "options": ["Low", "Medium", "High"],
          "options_ar": ["منخفض", "متوسط", "مرتفع"],
          "required": true
        },
        {
          "id": "hh_energy_level",
          "label": "Energy Level:",
          "label_ar": "مستوى الطاقة:",
          "type": "select",
          "options": ["Low", "Medium", "High"],
          "options_ar": ["منخفض", "متوسط", "مرتفع"],
          "required": true
        },
        {
          "id": "hh_caffeine",
          "label": "Do you consume caffeine?",
          "label_ar": "هل تستهلك الكافيين؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_alcohol",
          "label": "Do you consume alcohol?",
          "label_ar": "هل تستهلك الكحول؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_anemia",
          "label": "Do you have anemia?",
          "label_ar": "هل تعاني من فقر الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_gi_disorder",
          "label": "Do you have a gastrointestinal disorder?",
          "label_ar": "هل تعاني من اضطراب في الجهاز الهضمي؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_hypoglycemia",
          "label": "Do you have hypoglycemia?",
          "label_ar": "هل تعاني من انخفاض السكر في الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_thyroid",
          "label": "Do you have a thyroid disorder?",
          "label_ar": "هل تعاني من اضطراب في الغدة الدرقية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_prenatal",
          "label": "Are you pre/postnatal?",
          "label_ar": "هل أنتِ في فترة ما قبل أو بعد الولادة؟",
          "type": "yes_no",
          "required": false
        }
      ]
    },
    {
      "title": "Cardiovascular Health",
      "title_ar": "صحة القلب والأوعية الدموية",
      "questions": [
        {
          "id": "hh_cv_high_bp",
          "label": "High Blood Pressure?",
          "label_ar": "ارتفاع ضغط الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_hypertension",
          "label": "Hypertension?",
          "label_ar": "فرط ضغط الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_cholesterol",
          "label": "High Cholesterol?",
          "label_ar": "ارتفاع الكوليسترول؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_hyperlipidemia",
          "label": "Hyperlipidemia?",
          "label_ar": "فرط شحميات الدم؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_heart_disease",
          "label": "Heart Disease?",
          "label_ar": "أمراض القلب؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_heart_attack",
          "label": "Heart Attack?",
          "label_ar": "نوبة قلبية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_stroke",
          "label": "Stroke?",
          "label_ar": "سكتة دماغية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_angina",
          "label": "Angina?",
          "label_ar": "ذبحة صدرية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_cv_gout",
          "label": "Gout?",
          "label_ar": "النقرس؟",
          "type": "yes_no",
          "required": true
        }
      ]
    },
    {
      "title": "Pain History",
      "title_ar": "تاريخ الألم",
      "questions": [
        {
          "id": "hh_pain_head_neck",
          "label": "Do you have or have had pain in Head/Neck? If yes, describe:",
          "label_ar": "هل تعاني أو عانيت من ألم في الرأس/الرقبة؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_upper_back",
          "label": "Pain in Upper Back? If yes, describe:",
          "label_ar": "ألم في أعلى الظهر؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_shoulder",
          "label": "Pain in Shoulder/Clavicle? If yes, describe:",
          "label_ar": "ألم في الكتف/الترقوة؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_arm_elbow",
          "label": "Pain in Arm/Elbow? If yes, describe:",
          "label_ar": "ألم في الذراع/المرفق؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_wrist_hand",
          "label": "Pain in Wrist/Hand? If yes, describe:",
          "label_ar": "ألم في الرسغ/اليد؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_lower_back",
          "label": "Pain in Lower Back? If yes, describe:",
          "label_ar": "ألم في أسفل الظهر؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_hip_pelvis",
          "label": "Pain in Hip/Pelvis? If yes, describe:",
          "label_ar": "ألم في الورك/الحوض؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_pain_thigh_knee",
          "label": "Pain in Thigh/Knee? If yes, describe:",
          "label_ar": "ألم في الفخذ/الركبة؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_arthritis",
          "label": "Arthritis? If yes, describe:",
          "label_ar": "التهاب المفاصل؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_hernia",
          "label": "Hernia? If yes, describe:",
          "label_ar": "فتق؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_surgeries",
          "label": "Previous Surgeries? If yes, describe:",
          "label_ar": "عمليات جراحية سابقة؟ إذا كانت الإجابة نعم، صف:",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Nutrition",
      "title_ar": "التغذية",
      "questions": [
        {
          "id": "hh_diet_plan",
          "label": "Are you on any specific food/diet plan?",
          "label_ar": "هل تتبع أي خطة غذائية محددة؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_diet_plan_details",
          "label": "If yes, please list and advise who prescribed it:",
          "label_ar": "إذا كانت الإجابة نعم، يرجى ذكرها ومن وصفها:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_supplements",
          "label": "Do you take dietary supplements?",
          "label_ar": "هل تتناول مكملات غذائية؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_supplements_list",
          "label": "If yes, please list:",
          "label_ar": "إذا كانت الإجابة نعم، يرجى ذكرها:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_weight_fluctuation",
          "label": "Do you notice your weight fluctuating?",
          "label_ar": "هل تلاحظ تقلب وزنك؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_recent_weight_change",
          "label": "Have you experienced a recent weight gain or loss?",
          "label_ar": "هل عانيت من زيادة أو فقدان وزن مؤخراً؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_weight_change_details",
          "label": "If yes, explain how and over what amount of time:",
          "label_ar": "إذا كانت الإجابة نعم، اشرح كيف وخلال أي فترة:",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_caffeine_beverages",
          "label": "How many beverages do you consume per day that contain caffeine? What are they?",
          "label_ar": "كم مشروب يحتوي على الكافيين تستهلك يومياً؟ ما هي؟",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_nutritional_behaviors",
          "label": "How would you describe your current nutritional behaviors?",
          "label_ar": "كيف تصف سلوكياتك الغذائية الحالية؟",
          "type": "textarea",
          "required": false
        },
        {
          "id": "hh_food_issues",
          "label": "Other food/nutritional issues (food allergies, mealtimes, etc.):",
          "label_ar": "مشاكل غذائية أخرى (حساسية الطعام، أوقات الوجبات، إلخ):",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Work & Environment",
      "title_ar": "العمل والبيئة",
      "questions": [
        {
          "id": "hh_work_habits",
          "label": "What best describes your work and exercise habits?",
          "label_ar": "ما الذي يصف عادات عملك وتمارينك بشكل أفضل؟",
          "type": "select",
          "options": ["Intense occupational and recreational effort", "Moderate occupational and recreational effort", "Sedentary occupational and intense recreational effort", "Sedentary occupational and moderate recreational effort", "Sedentary occupational and light recreational effort", "Complete lack of activity"],
          "options_ar": ["جهد مهني وترفيهي مكثف", "جهد مهني وترفيهي معتدل", "جهد مهني خامل وترفيهي مكثف", "جهد مهني خامل وترفيهي معتدل", "جهد مهني خامل وترفيهي خفيف", "انعدام النشاط تماماً"],
          "required": true
        },
        {
          "id": "hh_work_stress",
          "label": "How stressful is your work environment?",
          "label_ar": "ما مدى ضغط بيئة عملك؟",
          "type": "select",
          "options": ["Minimal", "Moderate", "Average", "Extremely"],
          "options_ar": ["ضئيل", "معتدل", "متوسط", "شديد جداً"],
          "required": true
        },
        {
          "id": "hh_home_stress",
          "label": "How stressful is your home environment?",
          "label_ar": "ما مدى ضغط بيئة منزلك؟",
          "type": "select",
          "options": ["Minimal", "Moderate", "Average", "Extremely"],
          "options_ar": ["ضئيل", "معتدل", "متوسط", "شديد جداً"],
          "required": true
        },
        {
          "id": "hh_work_40_hours",
          "label": "Do you work more than 40 hours a week?",
          "label_ar": "هل تعمل أكثر من 40 ساعة في الأسبوع؟",
          "type": "yes_no",
          "required": true
        },
        {
          "id": "hh_additional_info",
          "label": "Anything else you would like your nutrition coach to know?",
          "label_ar": "أي شيء آخر تريد أن يعرفه مدرب التغذية الخاص بك؟",
          "type": "textarea",
          "required": false
        }
      ]
    },
    {
      "title": "Signature",
      "title_ar": "التوقيع",
      "questions": [
        {
          "id": "hh_signature",
          "label": "Patient Signature",
          "label_ar": "توقيع المريض",
          "type": "signature",
          "required": true
        },
        {
          "id": "hh_guardian_signature",
          "label": "Signature of Parent/Guardian (for participants under 18)",
          "label_ar": "توقيع ولي الأمر (للمشاركين تحت 18 سنة)",
          "type": "signature",
          "required": false
        }
      ]
    }
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_form_templates_category ON public.form_templates(category);
CREATE INDEX IF NOT EXISTS idx_form_templates_system ON public.form_templates(is_system_template);
