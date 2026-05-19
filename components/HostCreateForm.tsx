"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateRoomResponse = {
  room?: {
    code: string;
  };
  error?: string;
};

export function HostCreateForm() {
  const router = useRouter();
  const [hostName, setHostName] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function createRoom() {
    setError("");
    setIsCreating(true);

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hostName })
      });
      const payload = (await response.json()) as CreateRoomResponse;

      if (!response.ok || !payload.room) {
        throw new Error(payload.error ?? "Could not create room");
      }

      router.push(`/room/${payload.room.code}/host`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create room");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="mt-8">
      <label className="block text-sm font-bold text-ink" htmlFor="host-name">
        Host name
      </label>
      <input
        id="host-name"
        className="mt-2 h-12 w-full rounded-md border border-ink/15 bg-white px-4 outline-none ring-saffron/30 transition focus:ring-4"
        onChange={(event) => setHostName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !isCreating) {
            void createRoom();
          }
        }}
        placeholder="Enter your name"
        type="text"
        value={hostName}
      />

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <button
        className="mt-5 h-12 rounded-md bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={isCreating}
        onClick={() => void createRoom()}
        type="button"
      >
        {isCreating ? "Creating..." : "Create Room"}
      </button>
    </div>
  );
}
