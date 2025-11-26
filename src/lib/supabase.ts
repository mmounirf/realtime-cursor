import { createClient } from "@supabase/supabase-js";

export function supabase() {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
  );
}
