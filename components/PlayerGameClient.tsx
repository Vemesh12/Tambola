"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ClaimButton } from "@/components/ClaimButton";
import { NumberBoard } from "@/components/NumberBoard";
import { PlayerTicket } from "@/components/PlayerTicket";
import { WinnersList } from "@/components/WinnersList";
import { getPusherClient } from "@/lib/pusher-client";
import { getEligiblePrizes, PRIZE_ORDER } from "@/lib/winCheck";
import type { PlayerRecord, PrizeType, RoomRecord, WinnerRecord } from "@/lib/types";

type PlayerGameClientProps = {
  code: string;
};

type StoredPlayer = {
  playerId: string;
  sessionId: string;
};

type PlayerStateResponse = {
  room?: RoomRecord;
  player?: PlayerRecord;
  winners?: WinnerRecord[];
  error?: string;
};

type ClaimPrizeResponse = {
  winner?: WinnerRecord;
  error?: string;
};

const storageKey = (code: string) => `tambola-player-${code}`;

function readStoredPlayer(code: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(storageKey(code));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredPlayer;
  } catch {
    return null;
  }
}

export function PlayerGameClient({ code }: PlayerGameClientProps) {
  const [storedPlayer] = useState<StoredPlayer | null>(() => readStoredPlayer(code));

  if (!storedPlayer?.playerId) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-10">
        <section className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-soft">
          <h1 className="text-2xl font-black text-red-800">Could not open ticket</h1>
          <p className="mt-3 text-sm font-semibold text-red-700">
            This browser has not joined this room yet. Join again to continue.
          </p>
          <Link
            className="mt-5 inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-white"
            href={`/join?code=${code}`}
          >
            Join Again
          </Link>
        </section>
      </main>
    );
  }

  return <LoadedPlayerGame code={code} storedPlayer={storedPlayer} />;
}

function LoadedPlayerGame({
  code,
  storedPlayer
}: {
  code: string;
  storedPlayer: StoredPlayer;
}) {
  const [room, setRoom] = useState<RoomRecord | null>(null);
  const [player, setPlayer] = useState<PlayerRecord | null>(null);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [claimingPrize, setClaimingPrize] = useState<PrizeType | null>(null);

  const applyPlayerPayload = useCallback((payload: PlayerStateResponse) => {
    if (!payload.room || !payload.player) {
      throw new Error(payload.error ?? "Could not load your ticket");
    }

    setRoom(payload.room);
    setPlayer(payload.player);
    setWinners(payload.winners ?? []);
    setError("");
  }, []);

  const loadPlayer = useCallback((options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setIsLoading(true);
    }

    fetch(`/api/rooms/${code}/players/${storedPlayer.playerId}`, {
      cache: "no-store"
    })
      .then(async (response) => {
        const payload = (await response.json()) as PlayerStateResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Could not load your ticket");
        }

        applyPlayerPayload(payload);
      })
      .catch((caughtError) => {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load your ticket");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [applyPlayerPayload, code, storedPlayer.playerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlayer();
  }, [loadPlayer]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${code}`);

    const handleUpdate = () => {
      loadPlayer({ silent: true });
    };

    channel.bind("number-called", handleUpdate);
    channel.bind("winner-claimed", handleUpdate);
    channel.bind("game-started", handleUpdate);

    return () => {
      channel.unbind("number-called", handleUpdate);
      channel.unbind("winner-claimed", handleUpdate);
      channel.unbind("game-started", handleUpdate);
      pusher.unsubscribe(`room-${code}`);
    };
  }, [code, loadPlayer]);

  async function toggleNumber(number: number) {
    if (!player) {
      return;
    }

    setIsMarking(true);
    setError("");

    try {
      const response = await fetch(`/api/rooms/${code}/players/${player.id}/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ number })
      });
      const payload = (await response.json()) as PlayerStateResponse;

      if (!response.ok || !payload.room || !payload.player) {
        throw new Error(payload.error ?? "Could not mark number");
      }

      setRoom(payload.room);
      setPlayer(payload.player);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not mark number");
    } finally {
      setIsMarking(false);
    }
  }

  async function claimPrize(prizeType: PrizeType) {
    if (!player) {
      return;
    }

    setClaimingPrize(prizeType);
    setError("");

    try {
      const response = await fetch(`/api/rooms/${code}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          playerId: player.id,
          prizeType
        })
      });
      const payload = (await response.json()) as ClaimPrizeResponse;

      if (!response.ok || !payload.winner) {
        throw new Error(payload.error ?? "Could not claim prize");
      }

      setWinners((currentWinners) => [...currentWinners, payload.winner as WinnerRecord]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not claim prize");
    } finally {
      setClaimingPrize(null);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-5 py-10">
        <p className="font-bold text-ink/62">Loading your ticket...</p>
      </main>
    );
  }

  if (error && (!room || !player)) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-10">
        <section className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-soft">
          <h1 className="text-2xl font-black text-red-800">Could not open ticket</h1>
          <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>
          <Link
            className="mt-5 inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-white"
            href={`/join?code=${code}`}
          >
            Join Again
          </Link>
        </section>
      </main>
    );
  }

  if (!room || !player) {
    return null;
  }

  const claimedPrizeTypes = new Set(winners.map((winner) => winner.prize_type));
  const eligiblePrizeTypes = getEligiblePrizes(player.ticket.rows, player.marked).filter(
    (prizeType) => !claimedPrizeTypes.has(prizeType)
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={`/room/${code}/wait`} className="text-sm font-bold text-ink/62 hover:text-ink">
            Back to waiting room
          </Link>
          <h1 className="mt-3 text-4xl font-black text-ink">{room.code}</h1>
          <p className="mt-1 text-sm font-semibold text-ink/58">
            Playing as {player.name}
          </p>
        </div>
        <button
          className="h-11 rounded-md border border-ink/12 bg-white/80 px-5 text-sm font-bold text-ink transition hover:bg-white"
          onClick={() => loadPlayer({ silent: true })}
          type="button"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_24rem]">
        <section className="rounded-lg border border-ink/10 bg-white/82 p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">
                Your ticket
              </p>
              <h2 className="mt-1 text-xl font-black text-ink">Tap called numbers</h2>
            </div>
            <div className="rounded-md bg-paper px-4 py-2 text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Marked</p>
              <p className="text-2xl font-black text-gulal">{player.marked.length}/15</p>
            </div>
          </div>

          <PlayerTicket
            calledNumbers={room.called_numbers}
            markedNumbers={player.marked}
            onToggleNumber={toggleNumber}
            ticket={player.ticket.rows}
          />

          <p className="mt-4 text-sm font-semibold text-ink/58">
            Only numbers called by the host are tappable.
          </p>

          {isMarking ? (
            <p className="mt-3 text-sm font-bold text-mint">Saving mark...</p>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 border-t border-ink/10 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-black text-ink">Claims</h3>
              <span className="text-sm font-bold text-ink/52">
                {eligiblePrizeTypes.length} available
              </span>
            </div>
            {eligiblePrizeTypes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {PRIZE_ORDER.filter((prizeType) => eligiblePrizeTypes.includes(prizeType)).map(
                  (prizeType) => (
                    <ClaimButton
                      disabled={claimingPrize !== null}
                      key={prizeType}
                      onClaim={claimPrize}
                      prizeType={prizeType}
                    />
                  )
                )}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-ink/18 bg-white/60 p-4 text-sm font-semibold text-ink/58">
                No claim available yet.
              </p>
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-ink/10 bg-white/78 p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                Called board
              </p>
              <h2 className="mt-1 text-xl font-black text-ink">1-90</h2>
            </div>
            <div className="rounded-md bg-paper px-4 py-2 text-right">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Latest</p>
              <p className="text-2xl font-black text-gulal">
                {room.called_numbers.at(-1) ?? "--"}
              </p>
            </div>
          </div>
          <NumberBoard calledNumbers={room.called_numbers} />

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-black text-ink">Winners</h3>
            <WinnersList winners={winners} />
          </div>
        </aside>
      </div>
    </main>
  );
}
