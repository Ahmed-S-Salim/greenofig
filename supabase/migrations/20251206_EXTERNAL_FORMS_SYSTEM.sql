-- External Forms System for GreenoFig
-- Allows nutritionists to create shareable form links for external customers

-- Table for public/external form links
CREATE TABLE IF NOT EXISTS public_form_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,
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
  form_template_id UUID REFERENCES form_templates(id) ON DELETE CASCADE,

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

-- Nutritionists can manage their own links
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

-- Nutritionists can view submissions for their links
CREATE POLICY "Nutritionists can view submissions"
ON external_form_submissions FOR SELECT
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'admin')
));

-- Anyone can submit to public forms (insert)
CREATE POLICY "Anyone can submit external forms"
ON external_form_submissions FOR INSERT
WITH CHECK (true);

-- Nutritionists can update submissions (for review status)
CREATE POLICY "Nutritionists can update submissions"
ON external_form_submissions FOR UPDATE
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Nutritionists can delete submissions
CREATE POLICY "Nutritionists can delete submissions"
ON external_form_submissions FOR DELETE
USING (nutritionist_id = auth.uid() OR EXISTS (
  SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Add notification types for external form submissions
INSERT INTO notification_types (type, description) VALUES
  ('external_form_submitted', 'Notification when an external form is submitted'),
  ('patient_intake_submitted', 'Notification when a patient completes all intake forms')
ON CONFLICT DO NOTHING;

-- Function to generate unique link code
CREATE OR REPLACE FUNCTION generate_form_link_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  chars VARCHAR(62) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result VARCHAR(20) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * 62 + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
