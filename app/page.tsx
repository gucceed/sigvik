'use client';

import { useState, useRef } from 'react';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitted(true);
    // Real resolve endpoint wired in Prompt 3
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 md:pt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-display-sm font-normal tracking-tight">
              Sigvik
            </span>
            <span className="hidden md:inline text-overline text-ink-muted uppercase">
              BRF-intelligens
            </span>
          </div>
          <nav className="flex items-center gap-6 md:gap-8 text-body-sm">
            <a href="/om" className="text-ink-soft hover:text-ink transition-colors">
              Om
            </a>
            <a
              href="/leverantorer"
              className="text-ink-soft hover:text-ink transition-colors"
            >
              För leverantörer
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-16 md:py-24">
        <div className="w-full max-w-3xl">
          <div className="reveal reveal-delay-1">
            <span className="text-overline text-ink-muted uppercase block mb-6">
              Hela Sveriges BRF-register · uppdaterat dagligen
            </span>
          </div>

          <h1 className="reveal reveal-delay-2 font-display text-display-md md:text-display-xl font-normal tracking-tight text-ink mb-6 md:mb-8">
            Vad är din{' '}
            <span className="italic" style={{ fontVariationSettings: '"WONK" 1' }}>
              förening
            </span>{' '}
            värd att veta?
          </h1>

          <p className="reveal reveal-delay-3 text-body-lg text-ink-soft max-w-prose mb-10 md:mb-14 leading-relaxed">
            Skriv in en adress var som helst i Sverige. Få ekonomi, årsavgift,
            energiklass och underhållsrisk för bostadsrättsföreningen — på
            under en sekund. Underlaget kommer direkt från Bolagsverket och
            Boverket.
          </p>

          {/* Search */}
          <form
            onSubmit={handleSubmit}
            className="reveal reveal-delay-4 relative"
            role="search"
            aria-label="Sök förening via adress"
          >
            <label htmlFor="address-search" className="sr-only">
              Skriv in adressen
            </label>
            <div className="relative group">
              <input
                ref={inputRef}
                id="address-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bondegatan 42, Stockholm"
                autoComplete="street-address"
                autoCapitalize="off"
                spellCheck="false"
                className="w-full bg-transparent border-0 border-b-2 border-ink pb-4 pt-2 font-display text-display-sm md:text-display-md font-normal text-ink placeholder:text-ink-muted placeholder:font-normal placeholder:italic focus:outline-none focus:border-accent transition-colors"
                aria-describedby="search-hint"
              />
              <button
                type="submit"
                className="absolute right-0 bottom-4 md:bottom-5 text-overline uppercase text-ink hover:text-accent transition-colors px-2 py-1"
                aria-label="Sök"
              >
                {submitted ? 'Söker…' : 'Sök →'}
              </button>
            </div>
            <p
              id="search-hint"
              className="text-body-sm text-ink-muted mt-4"
            >
              Datakälla: Bolagsverket · Boverket · Skatteverket
            </p>
          </form>

          {submitted && (
            <div className="reveal mt-8 border border-rule bg-paper/60 backdrop-blur p-5 md:p-6">
              <p className="text-body text-ink-soft leading-relaxed">
                <span className="font-semibold text-ink">
                  Söker i hela Sveriges BRF-register.
                </span>{' '}
                Cirka 45&nbsp;000 föreningar — från Kiruna till Ystad. Hittar vi
                inte din förening direkt, lämna din e-post så hör vi av oss inom
                24 timmar.
              </p>
              <a
                href="mailto:hej@sigvik.com?subject=Hittade inte min förening&body=Hej, jag letade efter följande förening: "
                className="inline-block mt-4 text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
              >
                hej@sigvik.com →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* What it answers */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="reveal reveal-delay-1 mb-12 md:mb-16">
            <span className="text-overline text-ink-muted uppercase block mb-4">
              Beslutsunderlag på fyra frågor
            </span>
            <h2 className="font-display text-display-md md:text-display-lg font-normal tracking-tight text-ink max-w-prose">
              Det köparen och säljaren behöver veta — utan att läsa
              årsredovisningen.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 md:gap-y-20 max-w-5xl">
            <FactBlock
              number="01"
              question="Är avgiften rimlig?"
              answer="Lån per kvm, årsavgift per kvm och trend mot jämförbara föreningar i samma kommun och byggår. Om avgiften är låg idag — räkna vi ut när den troligen höjs."
            />
            <FactBlock
              number="02"
              question="Närmar sig stambytet?"
              answer="Underhållsintent-score 0–100 för stambyte, tak, fasad och hiss. Baserad på byggår, senaste åtgärder och styrelsens egna signaler i årsredovisningen."
            />
            <FactBlock
              number="03"
              question="Vilken energiklass?"
              answer="Deklarerad klass från Boverket när den finns. När den saknas — en prediktion med cirka 83 % tillförlitlighet, tydligt märkt som prediktion."
            />
            <FactBlock
              number="04"
              question="Finns ekonomisk risk?"
              answer="Belåning, likviditet, avgiftstrend och tecken på att styrelsen skjuter underhåll framför sig. Allt läst direkt ur den senaste årsredovisningen."
            />
          </div>
        </div>
      </section>

      {/* Methodology strip */}
      <section className="px-6 md:px-12 py-14 md:py-20 border-t border-rule bg-ink text-paper">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4">
              <span className="text-overline uppercase opacity-60 block mb-3">
                Metod
              </span>
              <h3 className="font-display text-display-sm md:text-display-md font-normal tracking-tight">
                Data från källan — inte från ett andrahandssäljsregister.
              </h3>
            </div>
            <div className="md:col-span-7 md:col-start-6 space-y-6 text-body-lg leading-relaxed opacity-90">
              <p>
                Sigvik läser årsredovisningar direkt från Bolagsverket, energideklarationer från Boverket och lagfarter från Lantmäteriet. All intelligens vi visar har en spårbar källa och ett datum.
              </p>
              <p>
                När vi predikterar — till exempel energiklass för en förening som saknar aktuell deklaration — märker vi det tydligt och redovisar tillförlitligheten. Ingen punkt på sidan saknar proveniens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* National coverage */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <span className="text-overline text-ink-muted uppercase block mb-4">
                Täckning
              </span>
              <h3 className="font-display text-display-md font-normal tracking-tight mb-6">
                Hela Sverige. Från första dagen.
              </h3>
              <p className="text-body-lg text-ink-soft leading-relaxed max-w-prose">
                Ingen region är prioriterad. Ingen kommun väntar. Från Kiruna
                till Ystad — varje registrerad bostadsrättsförening i Sverige
                finns i Sigvik.
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <dl className="space-y-5">
                <CoverageRow
                  metric="~45 000"
                  label="föreningar i registret"
                  source="Bolagsverket"
                />
                <div className="rule-dashed" />
                <CoverageRow
                  metric="290"
                  label="kommuner täckta"
                  source="hela Sverige"
                />
                <div className="rule-dashed" />
                <CoverageRow
                  metric="Dagligen"
                  label="nya årsredovisningar inlästa"
                  source="automatisk ingestion"
                />
                <div className="rule-dashed" />
                <CoverageRow
                  metric="< 1 sek"
                  label="från adress till verdikt"
                  source="p95 latens"
                />
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 md:py-14 border-t border-rule bg-paper">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="font-display text-display-sm font-normal tracking-tight mb-2">
                Sigvik
              </div>
              <p className="text-body-sm text-ink-muted leading-relaxed">
                En del av Norric AB.<br />Malmö, Sverige.
              </p>
            </div>
            <div>
              <h4 className="text-overline uppercase text-ink-muted mb-3">
                Produkt
              </h4>
              <ul className="space-y-2 text-body-sm">
                <li><a href="/om" className="text-ink-soft hover:text-ink transition-colors">Om Sigvik</a></li>
                <li><a href="/metod" className="text-ink-soft hover:text-ink transition-colors">Metod och källor</a></li>
                <li><a href="/priser" className="text-ink-soft hover:text-ink transition-colors">Priser</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-overline uppercase text-ink-muted mb-3">
                Partners
              </h4>
              <ul className="space-y-2 text-body-sm">
                <li><a href="/leverantorer" className="text-ink-soft hover:text-ink transition-colors">För leverantörer</a></li>
                <li><a href="/maklare" className="text-ink-soft hover:text-ink transition-colors">För mäklare</a></li>
                <li><a href="/api" className="text-ink-soft hover:text-ink transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-overline uppercase text-ink-muted mb-3">
                Kontakt
              </h4>
              <ul className="space-y-2 text-body-sm">
                <li><a href="mailto:hej@sigvik.com" className="text-ink-soft hover:text-ink transition-colors">hej@sigvik.com</a></li>
                <li><a href="/integritet" className="text-ink-soft hover:text-ink transition-colors">Integritet</a></li>
                <li><a href="/villkor" className="text-ink-soft hover:text-ink transition-colors">Villkor</a></li>
              </ul>
            </div>
          </div>
          <div className="rule-dashed mt-10 mb-6" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-caption text-ink-muted">
            <span>© {new Date().getFullYear()} Norric AB · Org.nr 559XXX-XXXX</span>
            <span className="font-mono">
              {process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7) || 'dev'}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FactBlock({
  number,
  question,
  answer,
}: {
  number: string;
  question: string;
  answer: string;
}) {
  return (
    <div className="reveal reveal-delay-2">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="font-mono text-caption text-ink-muted tabular-nums">
          {number}
        </span>
        <h3 className="font-display text-display-sm font-normal tracking-tight">
          {question}
        </h3>
      </div>
      <p className="text-body-lg text-ink-soft leading-relaxed pl-10">
        {answer}
      </p>
    </div>
  );
}

function CoverageRow({
  metric,
  label,
  source,
}: {
  metric: string;
  label: string;
  source: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2">
      <div className="flex-1 min-w-0">
        <div className="font-display text-body-lg text-ink">{label}</div>
        <div className="text-body-sm text-ink-muted mt-1">{source}</div>
      </div>
      <span className="font-display text-display-sm text-ink tabular-nums whitespace-nowrap">
        {metric}
      </span>
    </div>
  );
}
