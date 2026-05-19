import { NextResponse } from "next/server";
import { getRoomByCode } from "@/lib/rooms";

type RoomStateRouteProps = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_request: Request, { params }: RoomStateRouteProps) {
  const { code } = await params;

  try {
    const room = await getRoomByCode(code);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load room";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
