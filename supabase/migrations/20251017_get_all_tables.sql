-- Create a function to get all tables from the public schema
CREATE OR REPLACE FUNCTION get_all_tables()
RETURNS TABLE (tablename text) AS $$
BEGIN
  RETURN QUERY
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  ORDER BY table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
