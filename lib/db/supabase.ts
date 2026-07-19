import "server-only";

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
}

if (!key) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
}

/**
 * Returns a Supabase client using the service role key.
 * Server-only — never call this from client components.
 * Session persistence is disabled since this is a stateless server environment.
 */
export function getSupabaseAdmin() {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
