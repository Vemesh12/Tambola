"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type HostWaitingActionsProps = {
  code: string;
  playerCount: number;
  status: string;
};

type ApiResponse = {
  error?: string;
};

export function HostWaitingActions({ code, playerCount, status }: HostWaitingActionsProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  async function startGame() {
    setError("");
    setIsStarting(true);

    try {
      const response = await fetch(`/api/rooms/${code}/start`, {
        method: "POST"
      });
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not start game");
      }

      router.push(`/room/${code}/host/game`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not start game");
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="mt-6">
      {status === "playing" ? (
        <button
          className="h-12 rounded-md bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90"
          onClick={() => router.push(`/room/${code}/host/game`)}
          type="button"
        >
          Go To Game
        </button>
      ) : (
        <button
          className="h-12 rounded-md bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isStarting || playerCount === 0}
          onClick={() => void startGame()}
          type="button"
        >
          {isStarting ? "Starting..." : "Start Game"}
        </button>
      )}

      {playerCount === 0 ? (
        <p className="mt-2 text-sm font-semibold text-ink/58">
          At least one player must join before starting.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
