import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Användarvillkor — Sigvik',
  description: 'Användarvillkor för Sigvik — BRF-intelligens för Sverige.',
};

export default function VillkorPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          Användarvillkor
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-8">
          Villkor för användning av Sigvik.
        </h1>
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-6 max-w-prose mb-8">
          <p>
            Data som visas på Sigvik hämtas från offentliga register — Bolagsverket,
            Boverket och Lantmäteriet — och tillhandahålls i informationssyfte.
            Informationen utgör inte finansiell, juridisk eller värderingsrådgivning.
          </p>
          <p>
            Fullständiga användarvillkor publiceras i samband med produktlansering.
            Frågor: <a href="mailto:hej@sigvik.com" className="text-accent hover:text-accent-hover underline underline-offset-2">hej@sigvik.com</a>
          </p>
        </div>
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
