import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseServiceKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && (getSupabaseServiceKey() || getSupabasePublishableKey()));
}

/**
 * Server-side Supabase client for sessions/responses/admin.
 * Prefers service_role (bypasses RLS); falls back to publishable/anon key.
 */
export function createAdminClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey() || getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}
