import { createBrowserClient } from "@supabase/ssr";

let client;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase credentials missing. Local fallback active.");
    return null;
  }

  // Singleton pattern for the browser
  if (!client) {
    client = createBrowserClient(url, key);
  }

  return client;
}
