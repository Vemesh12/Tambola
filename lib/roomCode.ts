import type { SupabaseClient } from "@supabase/supabase-js";

export function generateRoomCode() {
  return `TM${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createUniqueRoomCode(supabase: SupabaseClient) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return code;
    }
  }

  throw new Error("Unable to generate a unique room code");
}
