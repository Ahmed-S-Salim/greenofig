-- Enable delete policies for form management
-- This allows nutritionists to fully delete form assignments and related data

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Nutritionists can delete form assignments" ON form_assignments;
DROP POLICY IF EXISTS "Nutritionists can delete form responses" ON form_responses;
DROP POLICY IF EXISTS "Nutritionists can delete form edit requests" ON form_edit_requests;
DROP POLICY IF EXISTS "Anyone can delete their own form responses" ON form_responses;
DROP POLICY IF EXISTS "Anyone can delete their own edit requests" ON form_edit_requests;

-- Allow nutritionists to delete form assignments they created
CREATE POLICY "Nutritionists can delete form assignments"
ON form_assignments FOR DELETE
USING (
  nutritionist_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('nutritionist', 'admin')
  )
);

-- Allow nutritionists to delete form responses for assignments they manage
CREATE POLICY "Nutritionists can delete form responses"
ON form_responses FOR DELETE
USING (
  client_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM form_assignments fa
    WHERE fa.id = form_responses.assignment_id
    AND fa.nutritionist_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('nutritionist', 'admin')
  )
);

-- Allow nutritionists to delete edit requests for their assignments
CREATE POLICY "Nutritionists can delete form edit requests"
ON form_edit_requests FOR DELETE
USING (
  client_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM form_assignments fa
    WHERE fa.id = form_edit_requests.assignment_id
    AND fa.nutritionist_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('nutritionist', 'admin')
  )
);

-- Ensure RLS is enabled on these tables
ALTER TABLE form_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_edit_requests ENABLE ROW LEVEL SECURITY;
