import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Om Sigvik',
  description: 'Sigvik är en del av Norric AB — ett analysbolag med bas i Malmö som bygger beslutsunderlag för den svenska bostadsmarknaden.',
};

export default function OmPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">
        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          Om Sigvik
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight mb-8">
          Beslutsunderlag för Sveriges bostadsrättsköpare.
        </h1>
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-6 max-w-prose mb-12">
          <p>
            Sigvik är ett beslutsverktyg för den som köper, säljer eller förvaltar
            bostadsrätter i Sverige. Vi hämtar data direkt från Bolagsverket, Boverket
            och Lantmäteriet — och presenterar den på under en sekund.
          </p>
          <p>
            Sigvik ägs och drivs av Norric AB, ett analysbolag med bas i Malmö. Vi
            bygger infrastruktur för den svenska fastighetsmarknaden.
          </p>
        </div>
        <Link
          href="/"
          className="font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
        >
          ← Tillbaka till sökning
        </Link>
      </div>
    </main>
  );
}
