import Link from "next/link";
import { notFound } from "next/navigation";
import { PlayerList } from "@/components/PlayerList";
import { PlayerWaitingActions } from "@/components/PlayerWaitingActions";
import { RoomRealtimeRefresh } from "@/components/RoomRealtimeRefresh";
import { getRoomByCode } from "@/lib/rooms";

type PlayerWaitingPageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function PlayerWaitingPage({ params }: PlayerWaitingPageProps) {
  const { code } = await params;
  const room = await getRoomByCode(code);

  if (!room) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-10">
      <RoomRealtimeRefresh code={room.code} events={["player-joined", "game-started"]} />
      <Link href="/join" className="mb-8 text-sm font-bold text-ink/62 hover:text-ink">
        Back to join
      </Link>

      <section className="rounded-lg border border-ink/10 bg-white/82 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-mint">
              Player waiting
            </p>
            <h1 className="mt-3 text-4xl font-black text-ink">{room.code}</h1>
            <p className="mt-3 leading-7 text-ink/70">
              You are in the room. Refresh or enter the game when the host starts it.
            </p>
          </div>
          <div className="rounded-md border border-ink/10 bg-paper/80 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Host</p>
            <p className="mt-1 font-black text-ink">{room.host_name}</p>
          </div>
        </div>

        <PlayerWaitingActions code={room.code} status={room.status} />

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-ink">Players</h2>
            <span className="rounded-full bg-mint/12 px-3 py-1 text-sm font-black text-mint">
              {room.players.length}/20
            </span>
          </div>
          <PlayerList players={room.players} />
        </div>
      </section>
    </main>
  );
}
