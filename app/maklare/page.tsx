import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'För mäklare — Sigvik',
  description: 'Ge dina köpare ett starkare beslutsunderlag. Sigvik ger mäklare snabb tillgång till BRF-ekonomi, energiklass och underhållsrisk.',
};

export default function MäklarePage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          För mäklare
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-8">
          Stärk köparens förtroende. På under en sekund.
        </h1>
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-6 max-w-prose mb-12">
          <p>
            Sigvik ger mäklare ett delbart beslutsunderlag för varje BRF — ekonomi,
            avgiftstrend, energiklass och underhållsrisk. Direkt från Bolagsverket
            och Boverket, inte andrahandskällor.
          </p>
          <p>
            Mäklarläget är under uppbyggnad. Kontakta oss för tidig åtkomst.
          </p>
        </div>
        <a
          href="mailto:hej@sigvik.com?subject=Mäklaråtkomst"
          className="font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1 block mb-4"
        >
          hej@sigvik.com →
        </a>
        <Link
          href="/"
          className="font-sans text-body-sm text-ink-muted hover:text-ink underline underline-offset-4 decoration-1"
        >
          ← Tillbaka till sökning
        </Link>
      </div>
    </main>
  );
}
