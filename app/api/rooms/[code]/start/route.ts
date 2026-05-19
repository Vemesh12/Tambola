import { NextResponse } from "next/server";
import { triggerRoomEvent } from "@/lib/pusher";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { RoomRecord } from "@/lib/types";

type StartGameRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(_request: Request, { params }: StartGameRouteProps) {
  const { code } = await params;
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

    if (room.status === "finished") {
      return NextResponse.json({ error: "This game has already finished" }, { status: 409 });
    }

    if (room.status === "playing") {
      return NextResponse.json({ room });
    }

    const { data: updatedRoom, error: updateError } = await supabase
      .from("rooms")
      .update({ status: "playing" })
      .eq("id", room.id)
      .select("id, code, host_name, status, called_numbers, created_at")
      .single<RoomRecord>();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await triggerRoomEvent(updatedRoom.code, "game-started", {
      code: updatedRoom.code,
      hostName: updatedRoom.host_name
    });

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start game";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
