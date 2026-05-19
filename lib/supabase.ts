import { createClient } from "@supabase/supabase-js";
import { getClientEnv } from "@/lib/env";

const env = getClientEnv();

export const supabase =
  env.supabaseUrl && env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey)
    : null;
