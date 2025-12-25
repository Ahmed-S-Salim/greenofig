-- Enable delete policy for form_templates table
-- Allows nutritionists and admins to delete templates

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Nutritionists can delete their own templates" ON form_templates;
DROP POLICY IF EXISTS "Nutritionists can delete non-system templates" ON form_templates;
DROP POLICY IF EXISTS "Nutritionists can delete templates" ON form_templates;

-- Allow nutritionists and admins to delete any templates
CREATE POLICY "Nutritionists can delete templates"
ON form_templates FOR DELETE
USING (
  -- Template was created by this user
  created_by = auth.uid()
  OR
  -- Or user is an admin/nutritionist (can delete any template including system ones)
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('nutritionist', 'admin')
  )
);

-- Ensure RLS is enabled
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

-- Also clean up any duplicate system templates (keep only latest of each name)
-- This removes the duplicate entries you're seeing in the UI
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY name, is_system_template ORDER BY created_at DESC) as rn
  FROM form_templates
  WHERE is_system_template = true
)
DELETE FROM form_templates
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
