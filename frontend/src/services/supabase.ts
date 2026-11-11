import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ktsgljggdnmurjzrllob.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ZPPqmxCLHG1ixn3n41SucA_tqwwENk6';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing! Check your .env file or environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

