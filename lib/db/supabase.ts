import "server-only";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

const supabaseUrl: string = url;
const supabaseKey: string = key;

/**
 * Returns a Supabase client using the service role key.
 * Server-only — never call this from client components.
 * Session persistence is disabled since this is a stateless server environment.
 */
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
