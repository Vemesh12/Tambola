import { NextResponse } from "next/server";
import { triggerRoomEvent } from "@/lib/pusher";
import { checkPrize } from "@/lib/winCheck";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PlayerRecord, PrizeType, RoomRecord, WinnerRecord } from "@/lib/types";

type ClaimPrizeRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

type ClaimPrizeBody = {
  playerId?: string;
  prizeType?: PrizeType;
};

const validPrizeTypes: PrizeType[] = [
  "early_five",
  "corners",
  "top",
  "middle",
  "bottom",
  "full_house"
];

function isPrizeType(value: unknown): value is PrizeType {
  return typeof value === "string" && validPrizeTypes.includes(value as PrizeType);
}

export async function POST(request: Request, { params }: ClaimPrizeRouteProps) {
  const { code } = await params;
  const normalizedCode = code.trim().toUpperCase();
  let body: ClaimPrizeBody;

  try {
    body = (await request.json()) as ClaimPrizeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.playerId) {
    return NextResponse.json({ error: "Player is required" }, { status: 400 });
  }

  if (!isPrizeType(body.prizeType)) {
    return NextResponse.json({ error: "Choose a valid prize type" }, { status: 400 });
  }

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

    if (room.status !== "playing") {
      return NextResponse.json({ error: "Claims open after the game starts" }, { status: 409 });
    }

    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id, room_id, name, session_id, ticket, marked, joined_at")
      .eq("room_id", room.id)
      .eq("id", body.playerId)
      .maybeSingle<PlayerRecord>();

    if (playerError) {
      return NextResponse.json({ error: playerError.message }, { status: 500 });
    }

    if (!player) {
      return NextResponse.json({ error: "Player not found in this room" }, { status: 404 });
    }

    const called = new Set(room.called_numbers);
    const allMarksWereCalled = player.marked.every((number) => called.has(number));

    if (!allMarksWereCalled) {
      return NextResponse.json({ error: "Ticket has marks for uncalled numbers" }, { status: 409 });
    }

    if (!checkPrize(player.ticket.rows, player.marked, body.prizeType)) {
      return NextResponse.json({ error: "This ticket is not eligible for that prize yet" }, { status: 409 });
    }

    const { data: existingWinner, error: existingError } = await supabase
      .from("winners")
      .select("id, room_id, player_id, player_name, prize_type, claimed_at")
      .eq("room_id", room.id)
      .eq("prize_type", body.prizeType)
      .maybeSingle<WinnerRecord>();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existingWinner) {
      return NextResponse.json(
        { error: "This prize has already been claimed", winner: existingWinner },
        { status: 409 }
      );
    }

    const { data: winner, error: winnerError } = await supabase
      .from("winners")
      .insert({
        room_id: room.id,
        player_id: player.id,
        player_name: player.name,
        prize_type: body.prizeType
      })
      .select("id, room_id, player_id, player_name, prize_type, claimed_at")
      .single<WinnerRecord>();

    if (winnerError) {
      return NextResponse.json({ error: winnerError.message }, { status: 500 });
    }

    await triggerRoomEvent(room.code, "winner-claimed", {
      id: winner.id,
      name: winner.player_name,
      prize: winner.prize_type
    });

    return NextResponse.json({ winner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to claim prize";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
