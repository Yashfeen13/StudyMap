import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Server-side client — used inside API routes only
export function createServerClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
