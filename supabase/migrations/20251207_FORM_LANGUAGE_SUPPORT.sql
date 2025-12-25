-- Add form_language column to form_assignments table
-- This stores the preferred language for displaying form content to the client
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_assignments'
    AND column_name = 'form_language'
  ) THEN
    ALTER TABLE public.form_assignments ADD COLUMN form_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Add form_language column to public_form_links table
-- This stores the preferred language for external form links
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'public_form_links'
    AND column_name = 'form_language'
  ) THEN
    ALTER TABLE public.public_form_links ADD COLUMN form_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- Add comment to explain the column
COMMENT ON COLUMN public.form_assignments.form_language IS 'Language preference for form display: en or ar';
COMMENT ON COLUMN public.public_form_links.form_language IS 'Language preference for external form link: en or ar';
