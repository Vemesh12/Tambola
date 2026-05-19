import Link from "next/link";
import { Ticket } from "@/components/Ticket";

const mvpModes = [
  { label: "Early Five", mark: "5" },
  { label: "Corners", mark: "C" },
  { label: "Top Line", mark: "T" },
  { label: "Middle Line", mark: "M" },
  { label: "Bottom Line", mark: "B" },
  { label: "Full House", mark: "H" }
];

const sampleTicket = [
  [4, null, 12, null, 31, null, 61, null, 82],
  [null, 19, null, 42, null, 56, null, 74, 90],
  [7, null, null, 48, 35, null, 67, 78, null]
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <nav className="flex items-center justify-between gap-4 py-2">
        <div className="text-lg font-black tracking-wide text-ink">Tambola Online</div>
        <div className="rounded-full border border-ink/10 bg-white/70 px-3 py-1 text-sm font-semibold text-ink/70">
          Week 1 setup
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-saffron">
            Play Housie with friends
          </p>
          <h1 className="text-5xl font-black leading-[1.02] text-ink sm:text-6xl">
            Host a Tambola room from any phone.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink/72">
            Create a room, share a 6-digit code, call numbers live, and let
            players mark digital tickets in their browser.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/host"
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-6 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink/90"
            >
              Create Game
            </Link>
            <Link
              href="/join"
              className="inline-flex h-12 items-center justify-center rounded-md border border-ink/15 bg-white/75 px-6 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:bg-white"
            >
              Join With Code
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-ink/10 bg-white/78 p-4 shadow-soft backdrop-blur">
          <Ticket ticket={sampleTicket} />

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mvpModes.map((mode) => (
              <div
                key={mode.label}
                className="flex items-center gap-2 rounded-md border border-ink/10 bg-paper/80 p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gulal text-sm font-black text-white">
                  {mode.mark}
                </span>
                <span className="text-sm font-bold text-ink/76">{mode.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
