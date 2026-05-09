import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Priser — Sigvik',
  description: 'Sigvik är gratis för privatpersoner. Professionella planer för mäklare och leverantörer lanseras 2026.',
};

export default function PriserPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          Priser
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-8">
          Gratis för privatpersoner.
        </h1>
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-6 max-w-prose mb-12">
          <p>
            Sökning och grundläggande BRF-information är och förblir gratis för privatpersoner.
          </p>
          <p>
            Professionella planer för mäklare, leverantörer och fastighetsförvaltare
            är under uppbyggnad. Kontakta oss för att diskutera tidig åtkomst.
          </p>
        </div>
        <a
          href="mailto:hej@sigvik.com?subject=Prisförfrågan"
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
