import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client, for client components. Returns null when
// env vars aren't set yet so the app can fall back to demo data instead
// of crashing — see lib/api/lifecycle.ts.
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
