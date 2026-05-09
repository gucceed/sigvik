import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Metod och datakällor — Sigvik',
  description:
    'Hur Sigvik beräknar underhållssignaler för bostadsrättsföreningar. Sex signaler, fyra primärkällor, daglig uppdatering.',
};

export default function MethodologyPage() {
  return (
    <main className="min-h-screen px-6 md:px-12 py-24">
      <div className="max-w-3xl mx-auto">

        <nav aria-label="Brödsmula" className="font-sans text-caption text-ink-muted mb-8">
          <Link href="/" className="hover:text-ink transition-colors">Sigvik</Link>
          <span className="mx-2">·</span>
          <span>Metod</span>
        </nav>

        <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
          Metod och datakällor
        </span>
        <h1 className="font-display text-display-lg font-normal tracking-tight text-ink mb-8">
          Hur Sigvik bygger BRF-profiler.
        </h1>

        {/* Principle */}
        <div className="font-display text-body-lg text-ink-soft leading-relaxed space-y-5 max-w-prose mb-14 border-l-2 border-rule pl-5">
          <p>
            Sigvik gör en sak: läser primärdata och presenterar den ofiltrerad.
            Vi rankar inte föreningar mot varandra. Vi bedömer inte om en
            förening är bra eller dålig. Vi identifierar tidiga signaler för
            kommande underhåll — baserat på vad styrelsen och verkligheten
            rapporterar.
          </p>
        </div>

        {/* Sources */}
        <section className="mb-12">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-6">Datakällor</h2>
          <div className="space-y-6">
            <SourceBlock
              name="Bolagsverket — Värdefulla datamängder"
              type="Primärkälla · uppdateras dagligen"
              items={[
                'Årsredovisningar: finansiella uppgifter, underhållsplaner, styrelsebeslut',
                'Registreringsdata: organisationsnummer, registreringsdatum, adress',
                'Låneregister: lånehändelser per förening',
                'Avregistreringar och likvidationer',
              ]}
            />
            <SourceBlock
              name="Boverket — Energideklarationer"
              type="Primärkälla · löpande"
              items={[
                'Officiell energiklass (A–G) per fastighetsbeteckning',
                'Primärenergital (kWh/m² och år)',
                'Giltighetsdatum och EU-fristanalys (krav: klass D senast 2033)',
              ]}
            />
            <SourceBlock
              name="SCB / Fastighetsregistret"
              type="Referensdata"
              items={[
                'Byggår per fastighet',
                'Fastighetsbeteckning för koppling till energideklarationer',
                'Kommungränser för regional normering',
              ]}
            />
          </div>
        </section>

        {/* Signals */}
        <section className="mb-12">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-6">De sex signalerna</h2>
          <p className="font-sans text-body-sm text-ink-soft leading-relaxed mb-6 max-w-prose">
            Underhållssignalen (0–100) beräknas från dessa sex faktorer. Ju fler
            som är tillgängliga, desto högre konfidensgrad. En signal utan
            konfidens visas inte — den utelämnas.
          </p>
          <div className="space-y-4">
            {[
              { signal: 'Avgiftshöjning', weight: 'Primär · upp till 25 p', desc: 'Procentuell höjning av månadsavgiften senaste räkenskapsår. Hög avgiftshöjning är historiskt den starkaste pre-capex-signalen.' },
              { signal: 'Låneutveckling', weight: 'Primär · upp till 20 p', desc: 'Förändring i totala lån. Ny upplåning kopplas till planerade projekt; amortering till finansiell konsolidering.' },
              { signal: 'Underhållsfond', weight: 'Primär · upp till 15 p', desc: 'Sjunkande underhållsfond indikerar att medel tas i anspråk. Stigande fond utan nyttjande är en lagrad signal.' },
              { signal: 'Underhållsplan', weight: 'Primär · upp till 20 p', desc: 'Omnämnanden av specifika projekt (tak, fasad, stambyte, hiss, fönster) i årsredovisningens förvaltningsberättelse, med eller utan årsangivelse.' },
              { signal: 'Energideklaration', weight: 'Sekundär · upp till 10 p', desc: 'Officiell energiklass från Boverket. EU-direktivet kräver uppgradering till klass D senast 2033 för klass E, F eller G. Om deklaration saknas: prediktion baserad på byggår med ~83% tillförlitlighet.' },
              { signal: 'Byggnadens livscykel', weight: 'Sekundär · upp till 15 p', desc: 'Deterministisk modell: stambyte vanligt 40–60 år, takunderhåll 25–40 år, fasad 30–50 år. Adderas när explicita signaler saknas.' },
            ].map((s) => (
              <div key={s.signal} className="border-t border-rule pt-4">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <span className="font-display text-body-lg text-ink">{s.signal}</span>
                  <span className="font-sans text-caption text-ink-muted whitespace-nowrap">{s.weight}</span>
                </div>
                <p className="font-sans text-body-sm text-ink-soft leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Confidence */}
        <section className="mb-12">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-6">Konfidensgrad</h2>
          <div className="font-sans text-body-sm text-ink-soft leading-relaxed space-y-3 max-w-prose">
            <p>
              Konfidensgraden mäter datatätheten, inte signalstyrkan. En förening
              med fem årsredovisningar och tre finansiella signaler har hög
              konfidensgrad. En förening med bara byggårsdata har låg.
            </p>
            <div className="space-y-2 border border-rule p-4 mt-4">
              <ConfidenceRow label="Stark signal" threshold="≥ 0.7" note="Minst 4 av 6 signaler tillgängliga" />
              <ConfidenceRow label="Måttlig signal" threshold="0.4–0.7" note="2–3 signaler tillgängliga" />
              <ConfidenceRow label="Tidig indikation" threshold="< 0.4" note="1–2 signaler, ofta bara byggår" />
            </div>
            <p>
              En signal visas aldrig utan angiven konfidensgrad.
              En förening med otillräcklig data visas med status{' '}
              <em>Tidig indikation</em> — inte gömd och inte falskt uppvärderad.
            </p>
          </div>
        </section>

        {/* What we don't do */}
        <section className="mb-12">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-6">Vad Sigvik inte gör</h2>
          <ul className="font-sans text-body-sm text-ink-soft leading-relaxed space-y-3 list-none max-w-prose">
            {[
              'Vi rankar inte föreningar. Det finns ingen "bästa BRF-lista".',
              'Vi lagrar inte uppgifter om enskilda styrelseledamöter eller boende.',
              'Vi gör inga juridiska eller finansiella bedömningar. All information är i informationssyfte.',
              'Vi säljer inte data till annonsörer eller tredjeparter.',
              'Vi predikterar inte marknadsvärde — det kräver transaktionsdata vi inte har.',
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-ink-muted flex-shrink-0">—</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Freshness */}
        <section className="mb-14">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-4">Datafärskhet</h2>
          <p className="font-sans text-body-sm text-ink-soft leading-relaxed max-w-prose">
            Bolagsverket ingesas dagligen kl. 03:00 CET. Energideklarationer
            uppdateras löpande när Boverket publicerar ny data. Varje BRF-sida
            visar datum för senast hämtad data. Om årsredovisning saknas
            för innevarande år är senaste tillgängliga år angivet.
          </p>
        </section>

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

function SourceBlock({ name, type, items }: { name: string; type: string; items: string[] }) {
  return (
    <div className="border-t border-rule pt-5">
      <div className="flex flex-wrap items-baseline gap-3 mb-3">
        <span className="font-display text-body-lg text-ink">{name}</span>
        <span className="font-sans text-caption text-ink-muted">{type}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="font-sans text-body-sm text-ink-soft flex gap-3">
            <span className="text-ink-muted flex-shrink-0">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfidenceRow({ label, threshold, note }: { label: string; threshold: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="font-sans text-body-sm text-ink">{label}</span>
      <span className="font-mono text-caption text-ink-muted whitespace-nowrap">{threshold}</span>
      <span className="font-sans text-caption text-ink-muted flex-1 text-right">{note}</span>
    </div>
  );
}
