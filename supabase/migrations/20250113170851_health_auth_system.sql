-- Location: supabase/migrations/20250113170851_health_auth_system.sql
-- Schema Analysis: Fresh project - no existing schema found
-- Integration Type: FRESH_PROJECT - Complete authentication and health device system
-- Dependencies: None (new schema)

-- 1. TYPES AND ENUMS
CREATE TYPE public.user_role AS ENUM ('admin', 'premium_user', 'basic_user');
CREATE TYPE public.device_type AS ENUM ('blood_pressure', 'o2_sensor', 'heart_rate', 'smart_scale');
CREATE TYPE public.connection_status AS ENUM ('connected', 'disconnected', 'syncing', 'error');
CREATE TYPE public.data_sync_status AS ENUM ('pending', 'synced', 'failed');

-- 2. CORE USER PROFILE TABLE (PostgREST Compatible)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'basic_user'::public.user_role,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    health_goals TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. HEALTH DEVICES TABLE
CREATE TABLE public.health_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_type public.device_type NOT NULL,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT UNIQUE,
    mac_address TEXT,
    firmware_version TEXT,
    connection_status public.connection_status DEFAULT 'disconnected'::public.connection_status,
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    last_sync_at TIMESTAMPTZ,
    is_primary BOOLEAN DEFAULT false,
    calibration_data JSONB DEFAULT '{}',
    device_settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. HEALTH READINGS TABLE
CREATE TABLE public.health_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    device_id UUID REFERENCES public.health_devices(id) ON DELETE SET NULL,
    reading_type public.device_type NOT NULL,
    systolic_pressure INTEGER, -- For blood pressure
    diastolic_pressure INTEGER, -- For blood pressure
    heart_rate INTEGER, -- BPM for heart rate and blood pressure
    oxygen_saturation DECIMAL(4,2), -- Percentage for O2
    weight_kg DECIMAL(5,2), -- For smart scale
    body_fat_percentage DECIMAL(4,2), -- For smart scale
    muscle_mass_kg DECIMAL(5,2), -- For smart scale
    bone_density DECIMAL(4,2), -- For smart scale
    measurement_timestamp TIMESTAMPTZ NOT NULL,
    raw_data JSONB DEFAULT '{}',
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    notes TEXT,
    sync_status public.data_sync_status DEFAULT 'synced'::public.data_sync_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. DEVICE PAIRING SESSIONS TABLE
CREATE TABLE public.device_pairing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    device_type public.device_type NOT NULL,
    pairing_code TEXT,
    bluetooth_scan_results JSONB DEFAULT '[]',
    session_status TEXT CHECK (session_status IN ('active', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. ESSENTIAL INDEXES
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_health_devices_user_id ON public.health_devices(user_id);
CREATE INDEX idx_health_devices_type ON public.health_devices(device_type);
CREATE INDEX idx_health_devices_status ON public.health_devices(connection_status);
CREATE INDEX idx_health_readings_user_id ON public.health_readings(user_id);
CREATE INDEX idx_health_readings_device_id ON public.health_readings(device_id);
CREATE INDEX idx_health_readings_type ON public.health_readings(reading_type);
CREATE INDEX idx_health_readings_timestamp ON public.health_readings(measurement_timestamp);
CREATE INDEX idx_pairing_sessions_user_id ON public.device_pairing_sessions(user_id);
CREATE INDEX idx_pairing_sessions_status ON public.device_pairing_sessions(session_status);

-- 7. UTILITY FUNCTIONS (BEFORE RLS POLICIES)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$func$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $func$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'basic_user')::public.user_role
    );
    RETURN NEW;
END;
$func$;

-- 8. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_pairing_sessions ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES (Using Safe Patterns)

-- Pattern 1: Core User Table (user_profiles) - Simple direct comparison
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple User Ownership for health devices
CREATE POLICY "users_manage_own_health_devices"
ON public.health_devices
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for health readings
CREATE POLICY "users_manage_own_health_readings"
ON public.health_readings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 2: Simple User Ownership for pairing sessions
CREATE POLICY "users_manage_own_pairing_sessions"
ON public.device_pairing_sessions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 6A: Admin access using auth.users metadata (safe for all tables)
CREATE OR REPLACE FUNCTION public.is_admin_from_auth()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM auth.users au
    WHERE au.id = auth.uid() 
    AND (au.raw_user_meta_data->>'role' = 'admin' 
         OR au.raw_app_meta_data->>'role' = 'admin')
)
$$;

-- Admin policies for all tables
CREATE POLICY "admin_full_access_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_health_devices"
ON public.health_devices
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_health_readings"
ON public.health_readings
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

CREATE POLICY "admin_full_access_pairing_sessions"
ON public.device_pairing_sessions
FOR ALL
TO authenticated
USING (public.is_admin_from_auth())
WITH CHECK (public.is_admin_from_auth());

-- 10. TRIGGERS
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_devices_updated_at
    BEFORE UPDATE ON public.health_devices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. MOCK DATA FOR TESTING
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    device1_id UUID := gen_random_uuid();
    device2_id UUID := gen_random_uuid();
    device3_id UUID := gen_random_uuid();
BEGIN
    -- Create complete auth.users records with all required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@greenofig.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Dr. Sarah Johnson", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'user@greenofig.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Michael Chen", "role": "premium_user"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create health devices
    INSERT INTO public.health_devices (id, user_id, device_name, device_type, manufacturer, model, connection_status, battery_level, is_primary) VALUES
        (device1_id, user_uuid, 'Omron BP Monitor', 'blood_pressure', 'Omron', 'HEM-7120', 'connected', 85, true),
        (device2_id, user_uuid, 'Pulse Oximeter Pro', 'o2_sensor', 'Masimo', 'MightySat RX', 'connected', 92, true),
        (device3_id, user_uuid, 'Polar H10 HRM', 'heart_rate', 'Polar', 'H10', 'connected', 78, true);

    -- Create sample health readings
    INSERT INTO public.health_readings (user_id, device_id, reading_type, systolic_pressure, diastolic_pressure, heart_rate, measurement_timestamp, quality_score) VALUES
        (user_uuid, device1_id, 'blood_pressure', 120, 80, 72, now() - interval '1 hour', 5),
        (user_uuid, device1_id, 'blood_pressure', 118, 78, 70, now() - interval '2 hours', 4);

    INSERT INTO public.health_readings (user_id, device_id, reading_type, oxygen_saturation, heart_rate, measurement_timestamp, quality_score) VALUES
        (user_uuid, device2_id, 'o2_sensor', 98.5, 75, now() - interval '30 minutes', 5),
        (user_uuid, device2_id, 'o2_sensor', 97.8, 73, now() - interval '1.5 hours', 4);

    INSERT INTO public.health_readings (user_id, device_id, reading_type, heart_rate, measurement_timestamp, quality_score) VALUES
        (user_uuid, device3_id, 'heart_rate', 68, now() - interval '15 minutes', 5),
        (user_uuid, device3_id, 'heart_rate', 72, now() - interval '45 minutes', 4);

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- 12. CLEANUP FUNCTION FOR DEVELOPMENT
CREATE OR REPLACE FUNCTION public.cleanup_test_health_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user_ids_to_delete UUID[];
BEGIN
    -- Get auth user IDs to delete
    SELECT ARRAY_AGG(id) INTO auth_user_ids_to_delete
    FROM auth.users
    WHERE email LIKE '%@greenofig.com';

    -- Delete in dependency order (children first)
    DELETE FROM public.health_readings WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.health_devices WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.device_pairing_sessions WHERE user_id = ANY(auth_user_ids_to_delete);
    DELETE FROM public.user_profiles WHERE id = ANY(auth_user_ids_to_delete);

    -- Delete auth.users last (after all references are removed)
    DELETE FROM auth.users WHERE id = ANY(auth_user_ids_to_delete);
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key constraint prevents deletion: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Cleanup failed: %', SQLERRM;
END;
$$;