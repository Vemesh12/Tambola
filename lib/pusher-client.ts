import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;

export function getPusherClient() {
  if (pusherClient) {
    return pusherClient;
  }

  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!key || !cluster) {
    throw new Error("Missing Pusher client environment variables");
  }

  pusherClient = new PusherClient(key, {
    cluster
  });

  return pusherClient;
}
