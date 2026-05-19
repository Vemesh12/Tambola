"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type JoinRoomResponse = {
  room?: {
    code: string;
  };
  player?: {
    id: string;
  };
  sessionId?: string;
  error?: string;
};

const SESSION_STORAGE_KEY = "tambola-session-id";

function getStoredSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(SESSION_STORAGE_KEY) ?? "";
}

export function JoinRoomForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(() => searchParams.get("code")?.toUpperCase() ?? "");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function joinRoom() {
    setError("");
    setIsJoining(true);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code,
          name,
          sessionId: getStoredSessionId()
        })
      });
      const payload = (await response.json()) as JoinRoomResponse;

      if (!response.ok || !payload.room || !payload.player || !payload.sessionId) {
        throw new Error(payload.error ?? "Could not join room");
      }

      window.localStorage.setItem(SESSION_STORAGE_KEY, payload.sessionId);
      window.localStorage.setItem(
        `tambola-player-${payload.room.code}`,
        JSON.stringify({
          playerId: payload.player.id,
          sessionId: payload.sessionId
        })
      );
      router.push(`/room/${payload.room.code}/wait`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not join room");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="room-code">
            Room code
          </label>
          <input
            id="room-code"
            className="mt-2 h-12 w-full rounded-md border border-ink/15 bg-white px-4 uppercase outline-none ring-mint/30 transition focus:ring-4"
            maxLength={6}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="TM4829"
            type="text"
            value={code}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-ink" htmlFor="player-name">
            Display name
          </label>
          <input
            id="player-name"
            className="mt-2 h-12 w-full rounded-md border border-ink/15 bg-white px-4 outline-none ring-mint/30 transition focus:ring-4"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !isJoining) {
                void joinRoom();
              }
            }}
            placeholder="Your name"
            type="text"
            value={name}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 h-12 rounded-md bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={isJoining}
        onClick={() => void joinRoom()}
        type="button"
      >
        {isJoining ? "Joining..." : "Join Game"}
      </button>
    </div>
  );
}
