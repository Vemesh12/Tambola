import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PlayerRecord, RoomRecord, WinnerRecord } from "@/lib/types";

export type RoomWithPlayers = RoomRecord & {
  players: Pick<PlayerRecord, "id" | "name" | "joined_at">[];
  winners: Pick<WinnerRecord, "id" | "player_name" | "prize_type" | "claimed_at">[];
};

export async function getRoomByCode(code: string): Promise<RoomWithPlayers | null> {
  const supabase = createServerSupabaseClient();
  const normalizedCode = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
        id,
        code,
        host_name,
        status,
        called_numbers,
        created_at,
        players (
          id,
          name,
          joined_at
        ),
        winners (
          id,
          player_name,
          prize_type,
          claimed_at
        )
      `
    )
    .eq("code", normalizedCode)
    .maybeSingle<RoomWithPlayers>();

  if (error) {
    throw error;
  }

  return data;
}
