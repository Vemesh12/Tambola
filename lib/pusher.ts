import Pusher from "pusher";

type RoomEventName = "player-joined" | "game-started" | "number-called" | "winner-claimed";

let pusher: Pusher | null = null;

function getPusherServer() {
  if (pusher) {
    return pusher;
  }

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error("Missing Pusher server environment variables");
  }

  pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true
  });

  return pusher;
}

export async function triggerRoomEvent(
  code: string,
  eventName: RoomEventName,
  payload: Record<string, unknown>
) {
  try {
    await getPusherServer().trigger(`room-${code}`, eventName, payload);
  } catch (error) {
    console.error("Pusher trigger failed", error);
  }
}
