import Link from "next/link";
import { notFound } from "next/navigation";
import { HostCallControls } from "@/components/HostCallControls";
import { NumberBoard } from "@/components/NumberBoard";
import { PlayerList } from "@/components/PlayerList";
import { RoomRealtimeRefresh } from "@/components/RoomRealtimeRefresh";
import { WinnersList } from "@/components/WinnersList";
import { getRoomByCode } from "@/lib/rooms";

type HostGamePageProps = {
  params: Promise<{
    code: string;
  }>;
};

export default async function HostGamePage({ params }: HostGamePageProps) {
  const { code } = await params;
  const room = await getRoomByCode(code);

  if (!room) {
    notFound();
  }

  const latestNumber = room.called_numbers.at(-1);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
      <RoomRealtimeRefresh code={room.code} events={["number-called", "winner-claimed"]} />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href={`/room/${room.code}/host`} className="text-sm font-bold text-ink/62 hover:text-ink">
            Back to waiting room
          </Link>
          <h1 className="mt-3 text-4xl font-black text-ink">{room.code}</h1>
          <p className="mt-1 text-sm font-semibold text-ink/58">
            Host: {room.host_name}
          </p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white/82 px-4 py-3 text-left sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Status</p>
          <p className="mt-1 font-black capitalize text-ink">{room.status}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <section>
          <HostCallControls code={room.code} calledCount={room.called_numbers.length} />

          <div className="mt-5 rounded-lg border border-ink/10 bg-white/78 p-4 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">
                  Number board
                </p>
                <h2 className="mt-1 text-xl font-black text-ink">1-90</h2>
              </div>
              <div className="rounded-md bg-paper px-4 py-2 text-right">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink/48">Latest</p>
                <p className="text-2xl font-black text-gulal">{latestNumber ?? "--"}</p>
              </div>
            </div>
            <NumberBoard calledNumbers={room.called_numbers} />
          </div>
        </section>

        <aside className="rounded-lg border border-ink/10 bg-white/82 p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-ink">Players</h2>
            <span className="rounded-full bg-mint/12 px-3 py-1 text-sm font-black text-mint">
              {room.players.length}/20
            </span>
          </div>
          <PlayerList players={room.players} />

          <div className="mt-5">
            <h3 className="text-sm font-black text-ink">Called list</h3>
            <p className="mt-2 text-sm leading-7 text-ink/68">
              {room.called_numbers.length > 0 ? room.called_numbers.join(", ") : "No numbers called yet."}
            </p>
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-black text-ink">Winners</h3>
            <WinnersList winners={room.winners} />
          </div>
        </aside>
      </div>
    </main>
  );
}
