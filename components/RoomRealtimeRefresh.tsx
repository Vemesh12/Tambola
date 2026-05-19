"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPusherClient } from "@/lib/pusher-client";

type RoomRealtimeRefreshProps = {
  code: string;
  events: string[];
};

export function RoomRealtimeRefresh({ code, events }: RoomRealtimeRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${code}`);
    const refresh = () => router.refresh();

    events.forEach((eventName) => {
      channel.bind(eventName, refresh);
    });

    return () => {
      events.forEach((eventName) => {
        channel.unbind(eventName, refresh);
      });
      pusher.unsubscribe(`room-${code}`);
    };
  }, [code, events, router]);

  return null;
}
