import { type Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const channel = supabase.channel("realtime-cursor", {
  config: { private: true },
});

export default supabase;
