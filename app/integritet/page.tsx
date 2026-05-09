import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Integritetspolicy — Sigvik',
  description: 'Sigvik samlar in minimalt med data. Vi säljer aldrig personuppgifter och trackar inte individer. Läs vår integritetspolicy.',
};

export default function IntegritetPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          Integritetspolicy
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-8">
          Vi samlar in minimalt. Vi säljer ingenting.
        </h1>
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-6 max-w-prose mb-8">
          <p>
            Sigvik behandlar enbart föreningsnivådata — aldrig data om enskilda
            styrelseledamöter eller boende. Rättslig grund: berättigat intresse (art. 6.1 f GDPR).
          </p>
          <p>
            Vi använder inga tredjepartsspårare. Webbanalys sker via Plausible Analytics,
            som är GDPR-kompatibelt och inte delar data med annonsörer.
          </p>
          <p>
            Fullständig integritetspolicy publiceras i samband med produktlansering.
            Frågor: <a href="mailto:hej@sigvik.com" className="text-accent hover:text-accent-hover underline underline-offset-2">hej@sigvik.com</a>
          </p>
        </div>
        <p className="font-sans text-body-sm text-ink-muted mb-8">
          Personuppgiftsansvarig: Norric AB · Org.nr 559XXX-XXXX · Malmö, Sverige
        </p>
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
