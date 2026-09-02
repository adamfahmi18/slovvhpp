"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client using the public anon key. Only used for reads
 * that are safe to expose (if any) — this project's default is that all
 * reads/writes go through server actions, so this client is provided for
 * completeness but is not used by default in the CRUD flows.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
