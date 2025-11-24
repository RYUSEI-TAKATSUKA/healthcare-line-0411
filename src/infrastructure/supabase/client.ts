import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const createSupabaseClient = (): SupabaseClient => {
  const supabaseUrl = getEnv('SUPABASE_URL');
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
};

export const supabaseClient = createSupabaseClient();
