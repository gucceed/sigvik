import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'För leverantörer — Sigvik',
  description: 'Hitta bostadsrättsföreningar med kommande underhållsbehov. Sigvik ger leverantörer och entreprenörer tidiga signaler om planerade projekt.',
};

export default function LeverantörerPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          För leverantörer
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-8">
          Hitta föreningar innan de vet att de letar.
        </h1>
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-6 max-w-prose mb-12">
          <p>
            Sigvik identifierar bostadsrättsföreningar med tidiga signaler för
            stambyte, takomläggning, fasadrenovering och energiuppgradering —
            baserat på byggår, årsredovisningar och underhållsplaner.
          </p>
          <p>
            Leverantörsläget är under uppbyggnad. Kontakta oss för tidig åtkomst.
          </p>
        </div>
        <a
          href="mailto:hej@sigvik.com?subject=Leverantörsåtkomst"
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
