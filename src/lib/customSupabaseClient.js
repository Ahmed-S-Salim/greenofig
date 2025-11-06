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

// Mobile-friendly session persistence configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use localStorage for better mobile compatibility
    storage: window.localStorage,
    storageKey: 'greenofig-auth',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Force session to persist across page reloads on mobile
    flowType: 'pkce'
  },
  realtime: {
    // Configure realtime with proper WebSocket support
    params: {
      eventsPerSecond: 10
    }
    // Let Supabase auto-detect WebSocket availability
    // Don't force transport - it causes constructor errors on mobile
  },
  global: {
    headers: {
      'X-Client-Info': 'greenofig-web'
    }
  }
});