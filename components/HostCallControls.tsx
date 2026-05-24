"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type HostCallControlsProps = {
  code: string;
  calledCount: number;
};

type CallNumberResponse = {
  number?: number;
  error?: string;
};

export function HostCallControls({ code, calledCount }: HostCallControlsProps) {
  const router = useRouter();
  const [latestNumber, setLatestNumber] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const allNumbersCalled = calledCount >= 90;

  async function callNumber() {
    setError("");
    setIsCalling(true);

    try {
      const response = await fetch(`/api/rooms/${code}/call`, {
        method: "POST"
      });
      const payload = (await response.json()) as CallNumberResponse;

      if (!response.ok || payload.number === undefined) {
        throw new Error(payload.error ?? "Could not call number");
      }

      setLatestNumber(payload.number);
      // Announce the number using Web Speech API for host and players to hear
      if (typeof window !== "undefined" && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`${payload.number}`);
        window.speechSynthesis.speak(utterance);
      }
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not call number");
    } finally {
      setIsCalling(false);
    }
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white/82 p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
        Host caller
      </p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink/58">Latest number</p>
          <p className="mt-1 text-5xl font-black text-ink">
            {latestNumber ?? "--"}
          </p>
        </div>
        <button
          className="h-12 rounded-md bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={isCalling || allNumbersCalled}
          onClick={() => void callNumber()}
          type="button"
        >
          {isCalling ? "Calling..." : "Call Number"}
        </button>
      </div>

      <p className="mt-3 text-sm font-semibold text-ink/58">
        {calledCount}/90 numbers called
      </p>

      {error ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
