import Link from "next/link";
import { notFound } from "next/navigation";
import { HostWaitingActions } from "@/components/HostWaitingActions";
import { PlayerList } from "@/components/PlayerList";
import { RoomRealtimeRefresh } from "@/components/RoomRealtimeRefresh";
import { getRoomByCode } from "@/lib/rooms";

type HostWaitingPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function HostWaitingPage({ params }: HostWaitingPageProps) {
  const { code } = await params;
  const room = await getRoomByCode(code);

  if (!room) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-10">
      <RoomRealtimeRefresh code={room.code} events={["player-joined", "game-started"]} />
      <Link href="/" className="mb-8 text-sm font-bold text-ink/62 hover:text-ink">
        Back to home
      </Link>

      <section className="rounded-lg border border-ink/10 bg-white/82 p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">
          Waiting room
        </p>
        <h1 className="mt-3 text-4xl font-black text-ink">{room.code}</h1>
        <p className="mt-3 leading-7 text-ink/70">
          Share this code with friends. Players who join will appear below.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="rounded-md border border-ink/10 bg-paper/80 p-4">
            <p className="text-sm font-bold text-ink">Share link</p>
            <p className="mt-1 break-all text-sm text-ink/68">
              /join?code={room.code}
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-white/75 p-4 text-left sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Host</p>
            <p className="mt-1 font-black text-ink">{room.host_name}</p>
          </div>
        </div>

        <HostWaitingActions
          code={room.code}
          playerCount={room.players.length}
          status={room.status}
        />

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-ink">Players</h2>
            <span className="rounded-full bg-saffron/14 px-3 py-1 text-sm font-black text-saffron">
              {room.players.length}/20
            </span>
          </div>
          <PlayerList players={room.players} />
          <p className="mt-1 text-sm text-ink/68">
            Refresh this page to see newly joined players until live sync is added.
          </p>
        </div>
      </section>
    </main>
  );
}
