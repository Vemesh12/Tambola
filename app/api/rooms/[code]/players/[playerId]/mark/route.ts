import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PlayerRecord, RoomRecord } from "@/lib/types";

type MarkNumberRouteProps = {
  params: Promise<{
    code: string;
    playerId: string;
  }>;
};

type MarkNumberBody = {
  number?: number;
  ticketIndex?: number;
};

export async function POST(request: Request, { params }: MarkNumberRouteProps) {
  const { code, playerId } = await params;
  const normalizedCode = code.trim().toUpperCase();
  let body: MarkNumberBody;

  try {
    body = (await request.json()) as MarkNumberBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const number = body.number;
  const ticketIndex = typeof body.ticketIndex === "number" ? body.ticketIndex : 0;

  if (typeof number !== "number" || !Number.isInteger(number) || number < 1 || number > 90) {
    return NextResponse.json({ error: "Choose a valid Tambola number" }, { status: 400 });
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

    if (!room.called_numbers.includes(number)) {
      return NextResponse.json(
        { error: "You can only mark numbers after the host calls them" },
        { status: 409 }
      );
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

    const ticketField = player.ticket as any;
    const normalizedTickets = ticketField.tickets || [
      {
        rows: ticketField.rows,
        marked: player.marked || []
      }
    ];

    if (ticketIndex < 0 || ticketIndex >= normalizedTickets.length) {
      return NextResponse.json({ error: "Invalid ticket index" }, { status: 400 });
    }

    const targetTicket = normalizedTickets[ticketIndex];
    const ticketNumbers = targetTicket.rows.flat().filter((cell: any): cell is number => cell !== null);

    if (!ticketNumbers.includes(number)) {
      return NextResponse.json({ error: "That number is not on this ticket" }, { status: 400 });
    }

    const markedSet = new Set<number>(targetTicket.marked);
    if (markedSet.has(number)) {
      markedSet.delete(number);
    } else {
      markedSet.add(number);
    }
    targetTicket.marked = Array.from(markedSet).sort((a, b) => a - b);

    const mergedMarked = Array.from(
      new Set<number>(normalizedTickets.flatMap((t: any) => t.marked))
    ).sort((a, b) => a - b);

    const { data: updatedPlayer, error: updateError } = await supabase
      .from("players")
      .update({
        ticket: {
          rows: normalizedTickets[0].rows,
          tickets: normalizedTickets
        },
        marked: mergedMarked
      })
      .eq("id", player.id)
      .select("id, room_id, name, session_id, ticket, marked, joined_at")
      .single<PlayerRecord>();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ room, player: updatedPlayer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to mark number";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
