"use client";

import { useRouter } from "next/navigation";

type PlayerWaitingActionsProps = {
  code: string;
  status: string;
};

export function PlayerWaitingActions({ code, status }: PlayerWaitingActionsProps) {
  const router = useRouter();

  return (
    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
      {status === "playing" ? (
        <button
          className="h-12 rounded-md bg-ink px-6 text-sm font-bold text-white transition hover:bg-ink/90"
          onClick={() => router.push(`/room/${code}/play`)}
          type="button"
        >
          Go To Game
        </button>
      ) : (
        <button
          className="h-12 rounded-md bg-ink px-6 text-sm font-bold text-white opacity-55"
          disabled
          type="button"
        >
          Waiting For Host
        </button>
      )}

      <button
        className="h-12 rounded-md border border-ink/12 bg-white/75 px-6 text-sm font-bold text-ink transition hover:bg-white"
        onClick={() => router.refresh()}
        type="button"
      >
        Refresh
      </button>
    </div>
  );
}
