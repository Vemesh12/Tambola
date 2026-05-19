import Link from "next/link";
import { HostCreateForm } from "@/components/HostCreateForm";

export default function HostPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-10">
      <Link href="/" className="mb-8 text-sm font-bold text-ink/62 hover:text-ink">
        Back to home
      </Link>

      <section className="rounded-lg border border-ink/10 bg-white/82 p-6 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-saffron">
          Host setup
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink">Create a Tambola room</h1>
        <p className="mt-3 leading-7 text-ink/70">
          Enter your name to create a real room in Supabase and get a shareable
          Tambola code.
        </p>

        <HostCreateForm />
      </section>
    </main>
  );
}
