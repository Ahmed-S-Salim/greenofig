-- Migration for remaining missing features (excluding recipes which are in 20251119_recipe_database.sql)
-- Created: 2025-11-19

-- =====================================================
-- EXERCISES TABLE (for ExerciseLibrary)
-- =====================================================
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(100) NOT NULL,
    equipment VARCHAR(100),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    instructions JSONB, -- Array of step-by-step instructions
    tips JSONB, -- Array of tips and safety notes
    target_muscles JSONB, -- Array of specific muscle names
    video_url TEXT,
    thumbnail_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment ON exercises(equipment);

-- =====================================================
-- USER FAVORITE EXERCISES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_favorite_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_exercises_user ON user_favorite_exercises(user_id);

-- =====================================================
-- USER NOTIFICATIONS (for CustomNotifications)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('meal', 'workout', 'water', 'sleep', 'medication', 'custom')),
    time TIME NOT NULL,
    days JSONB NOT NULL, -- Array of days: ['monday', 'tuesday', etc.]
    enabled BOOLEAN DEFAULT true,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_enabled ON user_notifications(enabled);

-- =====================================================
-- USER GOALS TRACKING (for GoalTracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_goals_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('weight', 'fitness', 'nutrition', 'sleep', 'hydration', 'custom')),
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    start_value DECIMAL(10,2),
    unit VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    completed_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    milestones JSONB, -- Array of milestone objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals_tracking(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_category ON user_goals_tracking(category);

-- =====================================================
-- WORKOUT ANALYTICS (enhanced workout_logs if needed)
-- =====================================================
-- Add columns to existing workout_logs table if they don't exist
ALTER TABLE workout_logs
ADD COLUMN IF NOT EXISTS type VARCHAR(100),
ADD COLUMN IF NOT EXISTS intensity VARCHAR(50) CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10,2);

-- =====================================================
-- EXPORT HISTORY (for DataExport)
-- =====================================================
CREATE TABLE IF NOT EXISTS export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('csv', 'json', 'pdf')),
    data_types JSONB NOT NULL, -- Array of data types exported
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    sent_via_email BOOLEAN DEFAULT false,
    email_address VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_export_history_user ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_created ON export_history(created_at DESC);

-- =====================================================
-- HEALTH PROFESSIONALS (for DoctorConsultations & AppointmentScheduling)
-- =====================================================
CREATE TABLE IF NOT EXISTS health_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    qualifications TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    bio TEXT,
    profile_picture_url TEXT,
    consultation_fee DECIMAL(10,2),
    availability JSONB, -- Schedule availability
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_professionals_specialization ON health_professionals(specialization);
CREATE INDEX IF NOT EXISTS idx_health_professionals_active ON health_professionals(is_active);

-- =====================================================
-- DOCTOR CONSULTATIONS (for DoctorConsultations)
-- =====================================================
CREATE TABLE IF NOT EXISTS doctor_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES health_professionals(id) ON DELETE CASCADE,
    consultation_type VARCHAR(50) NOT NULL CHECK (consultation_type IN ('video', 'chat', 'phone')),
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'inProgress', 'completed', 'cancelled')),
    reason TEXT,
    notes TEXT,
    diagnosis TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_user ON doctor_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON doctor_consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON doctor_consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled ON doctor_consultations(scheduled_datetime);

-- =====================================================
-- DOCTOR APPOINTMENTS (for AppointmentScheduling)
-- =====================================================
CREATE TABLE IF NOT EXISTS doctor_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES health_professionals(id) ON DELETE CASCADE,
    appointment_type VARCHAR(50) NOT NULL CHECK (appointment_type IN ('checkup', 'followup', 'consultation', 'therapy', 'vaccination', 'labwork')),
    appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'missed')),
    reminder_hours_before INTEGER DEFAULT 24,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_user ON doctor_appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON doctor_appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON doctor_appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON doctor_appointments(appointment_datetime);

-- =====================================================
-- PRESCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES doctor_consultations(id) ON DELETE SET NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    prescribed_date DATE NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_active ON prescriptions(is_active);

-- =====================================================
-- DAILY MACROS (for MacroTracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_macros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories DECIMAL(10,2) DEFAULT 0,
    protein DECIMAL(10,2) DEFAULT 0,
    carbs DECIMAL(10,2) DEFAULT 0,
    fat DECIMAL(10,2) DEFAULT 0,
    fiber DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_macros_user_date ON daily_macros(user_id, date DESC);

-- =====================================================
-- USER MACRO GOALS (for MacroTracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_macro_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calories_goal DECIMAL(10,2) NOT NULL DEFAULT 2000,
    protein_goal DECIMAL(10,2) NOT NULL DEFAULT 150,
    carbs_goal DECIMAL(10,2) NOT NULL DEFAULT 200,
    fat_goal DECIMAL(10,2) NOT NULL DEFAULT 65,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Exercises (public read, admin write)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active exercises" ON exercises;
CREATE POLICY "Anyone can view active exercises" ON exercises FOR SELECT USING (is_active = true);

-- User Favorite Exercises
ALTER TABLE user_favorite_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own favorite exercises" ON user_favorite_exercises;
CREATE POLICY "Users can manage their own favorite exercises" ON user_favorite_exercises
    FOR ALL USING (auth.uid() = user_id);

-- User Notifications
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own notifications" ON user_notifications;
CREATE POLICY "Users can manage their own notifications" ON user_notifications
    FOR ALL USING (auth.uid() = user_id);

-- User Goals Tracking
ALTER TABLE user_goals_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own goals" ON user_goals_tracking;
CREATE POLICY "Users can manage their own goals" ON user_goals_tracking
    FOR ALL USING (auth.uid() = user_id);

-- Export History
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own export history" ON export_history;
DROP POLICY IF EXISTS "Users can create export records" ON export_history;
CREATE POLICY "Users can view their own export history" ON export_history
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create export records" ON export_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Health Professionals (public read)
ALTER TABLE health_professionals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active health professionals" ON health_professionals;
CREATE POLICY "Anyone can view active health professionals" ON health_professionals
    FOR SELECT USING (is_active = true);

-- Doctor Consultations
ALTER TABLE doctor_consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own consultations" ON doctor_consultations;
CREATE POLICY "Users can manage their own consultations" ON doctor_consultations
    FOR ALL USING (auth.uid() = user_id);

-- Doctor Appointments
ALTER TABLE doctor_appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own appointments" ON doctor_appointments;
CREATE POLICY "Users can manage their own appointments" ON doctor_appointments
    FOR ALL USING (auth.uid() = user_id);

-- Prescriptions
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON prescriptions;
CREATE POLICY "Users can view their own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Daily Macros
ALTER TABLE daily_macros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own daily macros" ON daily_macros;
CREATE POLICY "Users can manage their own daily macros" ON daily_macros
    FOR ALL USING (auth.uid() = user_id);

-- User Macro Goals
ALTER TABLE user_macro_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own macro goals" ON user_macro_goals;
CREATE POLICY "Users can manage their own macro goals" ON user_macro_goals
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA - Sample Exercises
-- =====================================================
INSERT INTO exercises (name, description, muscle_group, equipment, difficulty, instructions, tips, target_muscles, thumbnail_url) VALUES
('Push-ups', 'Classic bodyweight exercise for upper body strength', 'chest', 'bodyweight', 'beginner',
 '["Start in plank position with hands shoulder-width apart", "Lower your body until chest nearly touches the floor", "Push back up to starting position", "Keep your core engaged throughout"]'::jsonb,
 '["Keep your body in a straight line", "Don''t let your hips sag", "Breathe out as you push up"]'::jsonb,
 '["Pectorals", "Triceps", "Deltoids", "Core"]'::jsonb,
 NULL),
('Squats', 'Fundamental lower body exercise', 'legs', 'bodyweight', 'beginner',
 '["Stand with feet shoulder-width apart", "Lower your body by bending knees and hips", "Go down until thighs are parallel to ground", "Push through heels to return to start"]'::jsonb,
 '["Keep your chest up", "Knees should track over toes", "Keep weight on your heels"]'::jsonb,
 '["Quadriceps", "Hamstrings", "Glutes", "Core"]'::jsonb,
 NULL),
('Plank', 'Core strengthening exercise', 'core', 'bodyweight', 'beginner',
 '["Start in push-up position", "Lower onto forearms", "Keep body straight from head to heels", "Hold position for desired time"]'::jsonb,
 '["Don''t let hips sag or pike up", "Keep core tight", "Breathe normally"]'::jsonb,
 '["Rectus Abdominis", "Obliques", "Transverse Abdominis"]'::jsonb,
 NULL),
('Dumbbell Rows', 'Back strengthening exercise', 'back', 'dumbbells', 'intermediate',
 '["Place one knee and hand on bench", "Hold dumbbell in opposite hand", "Pull dumbbell up to ribcage", "Lower with control"]'::jsonb,
 '["Keep back flat", "Pull elbow back, not just the weight", "Squeeze shoulder blade at top"]'::jsonb,
 '["Latissimus Dorsi", "Rhomboids", "Trapezius"]'::jsonb,
 NULL),
('Burpees', 'Full body cardio exercise', 'fullBody', 'bodyweight', 'advanced',
 '["Start standing", "Drop into squat position", "Kick feet back to plank", "Do a push-up", "Jump feet back to squat", "Jump up explosively"]'::jsonb,
 '["Move quickly but with control", "Keep core engaged", "Land softly"]'::jsonb,
 '["Full Body", "Cardiovascular"]'::jsonb,
 NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA - Sample Health Professionals
-- =====================================================
INSERT INTO health_professionals (name, specialization, email, consultation_fee, is_active) VALUES
('Dr. Sarah Johnson', 'General Practitioner', 'dr.johnson@greenofig.com', 75.00, true),
('Dr. Michael Chen', 'Nutritionist', 'dr.chen@greenofig.com', 60.00, true),
('Dr. Emily Rodriguez', 'Sports Medicine', 'dr.rodriguez@greenofig.com', 85.00, true),
('Dr. James Williams', 'Cardiologist', 'dr.williams@greenofig.com', 100.00, true),
('Dr. Lisa Anderson', 'Mental Health Counselor', 'dr.anderson@greenofig.com', 70.00, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notifications_updated_at ON user_notifications;
CREATE TRIGGER update_user_notifications_updated_at BEFORE UPDATE ON user_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_tracking_updated_at ON user_goals_tracking;
CREATE TRIGGER update_user_goals_tracking_updated_at BEFORE UPDATE ON user_goals_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_professionals_updated_at ON health_professionals;
CREATE TRIGGER update_health_professionals_updated_at BEFORE UPDATE ON health_professionals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_consultations_updated_at ON doctor_consultations;
CREATE TRIGGER update_doctor_consultations_updated_at BEFORE UPDATE ON doctor_consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doctor_appointments_updated_at ON doctor_appointments;
CREATE TRIGGER update_doctor_appointments_updated_at BEFORE UPDATE ON doctor_appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_macros_updated_at ON daily_macros;
CREATE TRIGGER update_daily_macros_updated_at BEFORE UPDATE ON daily_macros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_macro_goals_updated_at ON user_macro_goals;
CREATE TRIGGER update_user_macro_goals_updated_at BEFORE UPDATE ON user_macro_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
