import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://mpkyfibccqwlhrwfhppy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wa3lmaWJjY3F3bGhyd2ZocHB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODYzNzcxNSwiZXhwIjoyMDQ0MjEzNzE1fQ.e0f5CrjpX77dP_S0HNEYjT4kU1WBZe_TuJqbF3AZkFk';

const supabase = createClient(supabaseUrl, supabaseKey);

const sql = fs.readFileSync('supabase/migrations/20251124_CREATE_MESSAGES_TABLE.sql', 'utf8');

(async () => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    console.log('✅ DATABASE MIGRATION COMPLETE');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
