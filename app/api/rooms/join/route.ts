import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { triggerRoomEvent } from "@/lib/pusher";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateTicket } from "@/lib/ticket";
import type { PlayerRecord, RoomRecord } from "@/lib/types";

type JoinRoomBody = {
  code?: string;
  name?: string;
  sessionId?: string;
};

function normalizeRoomCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export async function POST(request: Request) {
  let body: JoinRoomBody;

  try {
    body = (await request.json()) as JoinRoomBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const code = body.code ? normalizeRoomCode(body.code) : "";
  const name = body.name?.trim();
  const sessionId = body.sessionId?.trim() || uuidv4();

  if (!/^TM\d{4}$/.test(code)) {
    return NextResponse.json({ error: "Enter a valid room code like TM4829" }, { status: 400 });
  }

  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "Display name must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (name.length > 40) {
    return NextResponse.json(
      { error: "Display name must be 40 characters or fewer" },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, code, host_name, status, called_numbers, created_at")
      .eq("code", code)
      .maybeSingle<RoomRecord>();

    if (roomError) {
      return NextResponse.json({ error: roomError.message }, { status: 500 });
    }

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "This room is not accepting new players" },
        { status: 409 }
      );
    }

    const { count, error: countError } = await supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("room_id", room.id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) >= 20) {
      return NextResponse.json({ error: "This room is full" }, { status: 409 });
    }

    const ticket = generateTicket();
    const { data: player, error: playerError } = await supabase
      .from("players")
      .upsert(
        {
          room_id: room.id,
          name,
          session_id: sessionId,
          ticket: { rows: ticket },
          marked: []
        },
        {
          onConflict: "room_id,session_id"
        }
      )
      .select("id, room_id, name, session_id, ticket, marked, joined_at")
      .single<PlayerRecord>();

    if (playerError) {
      return NextResponse.json({ error: playerError.message }, { status: 500 });
    }

    await triggerRoomEvent(room.code, "player-joined", {
      id: player.id,
      name: player.name
    });

    return NextResponse.json(
      {
        room,
        player,
        sessionId
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to join room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
