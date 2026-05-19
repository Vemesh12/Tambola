import { NextResponse } from "next/server";
import { createUniqueRoomCode } from "@/lib/roomCode";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateTicket } from "@/lib/ticket";
import type { RoomRecord } from "@/lib/types";

type CreateRoomBody = {
  hostName?: string;
};

export async function POST(request: Request) {
  let body: CreateRoomBody;

  try {
    body = (await request.json()) as CreateRoomBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const hostName = body.hostName?.trim();

  if (!hostName || hostName.length < 2) {
    return NextResponse.json(
      { error: "Host name must be at least 2 characters" },
      { status: 400 }
    );
  }

  if (hostName.length > 40) {
    return NextResponse.json(
      { error: "Host name must be 40 characters or fewer" },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerSupabaseClient();
    const code = await createUniqueRoomCode(supabase);
    const previewTicket = generateTicket();

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_name: hostName,
        status: "waiting",
        called_numbers: []
      })
      .select("id, code, host_name, status, called_numbers, created_at")
      .single<RoomRecord>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        room: data,
        previewTicket
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
