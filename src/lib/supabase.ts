import { type Database } from "@/database.types";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY!
);

export default supabase;
