import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sigvik för leverantörer — Hitta BRFs med kommande underhåll',
  description:
    'Sigvik identifierar bostadsrättsföreningar med tidiga signaler för stambyte, takunderhåll, fasadrenovering och energiuppgradering — innan projekten är beslutade.',
};

export default function ContractorPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 pb-6 border-b border-rule">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors">
            Sigvik
          </a>
          <a href="/search" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
            Sök föreningar →
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20">

        {/* Hero */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-4">För leverantörer</span>
          <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight text-ink mb-6">
            Hitta föreningar innan de vet att de letar.
          </h1>
          <p className="font-display text-body-lg text-ink-soft leading-relaxed max-w-prose">
            Sigvik läser årsredovisningar, energideklarationer och byggårsdata
            för alla 33 706 bostadsrättsföreningar i Sverige. Signalerna
            identifierar var i sin underhållscykel varje förening befinner sig
            — inte efter att ett beslut är fattat, utan när det fortfarande
            formas.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-16 md:mb-24">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-8">Så fungerar det</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule">
            {[
              {
                step: '01',
                title: 'Signaler identifieras',
                body: 'Avgiftshöjningar, låneutveckling, underhållsplansnämnanden och byggåldersanalys — sex signaler sammanvägs till ett underhållsintent per förening.',
              },
              {
                step: '02',
                title: 'Filtrera på din disciplin',
                body: 'Sök på projektyp (stambyte, fasad, tak, fönster, energi), byggår, antal lägenheter och geografi. Resultaten är sorterade efter signalstyrka.',
              },
              {
                step: '03',
                title: 'Kontakta rätt förening vid rätt tid',
                body: 'Varje BRF-sida visar underhållsplan, byggålder och kontaktinfo via Bolagsverkets register. Du kontaktar en förening som faktiskt planerar — inte en som just beslutat.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-paper p-8">
                <span className="font-mono text-caption text-ink-muted block mb-4">{s.step}</span>
                <h3 className="font-display text-body-lg text-ink mb-3">{s.title}</h3>
                <p className="font-sans text-body-sm text-ink-soft leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Project type quick links */}
        <section className="mb-16 md:mb-24">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-6">Sök per projekttyp</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Stambyte / VVS', hint: 'Föreningar med stammar nämnda i underhållsplan' },
              { label: 'Fasadrenovering', hint: 'Fasad eller puts nämnda, byggår 1960–1985' },
              { label: 'Takunderhåll', hint: 'Tak nämnda i årsredovisning senaste 3 år' },
              { label: 'Fönsterbyte', hint: 'Fönster nämnda, byggår pre-1990' },
              { label: 'Energiuppgradering', hint: 'Energiklass E/F/G, EU-tidsgräns 2033' },
              { label: 'Hissinstallation', hint: 'Hiss nämnda i underhållsplan' },
            ].map((t) => (
              <Link
                key={t.label}
                href="/search"
                className="border border-rule p-4 hover:border-ink-soft transition-colors group"
              >
                <div className="font-display text-body text-ink group-hover:text-accent transition-colors mb-1">
                  {t.label}
                </div>
                <div className="font-sans text-caption text-ink-muted leading-relaxed">{t.hint}</div>
              </Link>
            ))}
          </div>
          <p className="font-sans text-caption text-ink-muted mt-4">
            Fullt filter på projekttyp kräver årsredovisningsparser — aktiveras löpande.
            Byggårs- och regionsfilter fungerar idag.
          </p>
        </section>

        {/* Signal constraint */}
        <section className="border border-rule p-6 md:p-8 max-w-2xl mb-14">
          <h2 className="font-display text-body-lg text-ink mb-3">En viktig begränsning</h2>
          <p className="font-sans text-body-sm text-ink-soft leading-relaxed">
            Sigvik identifierar möjligheter — det är du som avgör om en kontakt
            är relevant. Direktkontakt med föreningar baserat på deras
            signalstyrka kräver ett affärsrelationsbyggande, inte ett massbrev.
            Vi förväntar oss att leverantörer som använder Sigvik kontaktar
            föreningar med ett genuint erbjudande och respekterar att tidssignalen
            är en indikation, inte ett beslut.
          </p>
        </section>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/search"
            className="font-sans text-body-sm text-paper bg-ink px-6 py-3 hover:bg-ink-soft transition-colors"
          >
            Sök föreningar →
          </Link>
          <a
            href="mailto:hej@sigvik.com?subject=Leverantörsåtkomst"
            className="font-sans text-body-sm text-accent border border-accent px-6 py-3 hover:bg-accent hover:text-paper transition-colors"
          >
            Kontakta oss
          </a>
        </div>
      </div>
    </main>
  );
}
