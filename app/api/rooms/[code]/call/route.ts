import { NextResponse } from "next/server";
import { pickNextNumber } from "@/lib/numbers";
import { triggerRoomEvent } from "@/lib/pusher";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { RoomRecord } from "@/lib/types";

type CallNumberRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function POST(_request: Request, { params }: CallNumberRouteProps) {
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

    if (room.status !== "playing") {
      return NextResponse.json(
        { error: "Start the game before calling numbers" },
        { status: 409 }
      );
    }

    const nextNumber = pickNextNumber(room.called_numbers);

    if (nextNumber === null) {
      return NextResponse.json({ error: "All numbers have already been called" }, { status: 409 });
    }

    const calledNumbers = [...room.called_numbers, nextNumber];
    const { data: updatedRoom, error: updateError } = await supabase
      .from("rooms")
      .update({ called_numbers: calledNumbers })
      .eq("id", room.id)
      .select("id, code, host_name, status, called_numbers, created_at")
      .single<RoomRecord>();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await triggerRoomEvent(updatedRoom.code, "number-called", {
      number: nextNumber,
      called: calledNumbers
    });

    return NextResponse.json({
      number: nextNumber,
      called: calledNumbers,
      room: updatedRoom
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to call number";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
