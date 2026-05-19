import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PlayerRecord, RoomRecord, WinnerRecord } from "@/lib/types";

type PlayerStateRouteProps = {
  params: Promise<{
    code: string;
    playerId: string;
  }>;
};

export async function GET(_request: Request, { params }: PlayerStateRouteProps) {
  const { code, playerId } = await params;
  const normalizedCode = code.trim().toUpperCase();

  try {
    const supabase = createServerSupabaseClient();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, code, host_name, status, called_numbers, created_at")
      .eq("code", normalizedCode)
      .maybeSingle<RoomRecord>();

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, room_id, name, session_id, ticket, marked, joined_at")
      .eq("room_id", room.id)
      .eq("id", playerId)
      .maybeSingle<PlayerRecord>();

    if (playerError) {
      return NextResponse.json({ error: playerError.message }, { status: 500 });
    }

    if (!player) {
      return NextResponse.json({ error: "Player not found in this room" }, { status: 404 });
    }

    const { data: winners, error: winnersError } = await supabase
      .from("winners")
      .select("id, room_id, player_id, player_name, prize_type, claimed_at")
      .eq("room_id", room.id)
      .order("claimed_at", { ascending: true })
      .returns<WinnerRecord[]>();

    if (winnersError) {
      return NextResponse.json({ error: winnersError.message }, { status: 500 });
    }

    return NextResponse.json({ room, player, winners });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load player";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
