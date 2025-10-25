import { createClient } from '@supabase/supabase-js';

// SECURITY: Always use environment variables for sensitive configuration
// Never hardcode URLs or API keys in source code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file'
  );
}

// Development logging (safe - only shows partial key)
if (import.meta.env.DEV) {
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);