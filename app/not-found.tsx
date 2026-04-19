import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <span className="text-overline text-ink-muted uppercase block mb-6">
          404 — ingen förening hittad
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-6">
          Den sidan finns inte.
        </h1>
        <p className="text-body-lg text-ink-soft mb-10 leading-relaxed">
          Sidan du letar efter finns inte eller har flyttats. Kanske sökte du
          efter en förening som inte är inlagd ännu — vi rullar just nu ut
          nationellt.
        </p>
        <Link
          href="/"
          className="inline-block text-overline uppercase text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
        >
          ← Tillbaka till start
        </Link>
      </div>
    </main>
  );
}
