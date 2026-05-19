import Link from "next/link";
import { Suspense } from "react";
import { JoinRoomForm } from "@/components/JoinRoomForm";

export default function JoinPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-8 text-sm font-bold text-ink/62 hover:text-ink">
        Back to home
      </Link>

      <section className="rounded-lg border border-ink/10 bg-white/82 p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-mint">
          Player join
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink">Join with a room code</h1>
        <p className="mt-3 leading-7 text-ink/70">
          Enter the host room code and your display name. You will get a
          digital Tambola ticket when the game flow starts.
        </p>

        <Suspense fallback={<p className="mt-8 text-sm font-semibold text-ink/60">Loading...</p>}>
          <JoinRoomForm />
        </Suspense>
      </section>
    </main>
  );
}
