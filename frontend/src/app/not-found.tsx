import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <section className="glass-card max-w-xl p-8 text-center">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">404</p>
        <h1 className="mt-4 text-4xl font-black text-slate-50">Page not found</h1>
        <p className="mt-4 leading-7 text-slate-300">
          The page or file you are looking for is not available. Return to the portfolio home page and continue exploring.
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 transition hover:-translate-y-1">
          Back to Home
        </Link>
      </section>
    </main>
  );
}
