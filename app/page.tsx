import type { Metadata } from 'next';
import { SearchBar } from './components/SearchBar';

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Sigvik — BRF-intelligens för hela Sverige',
  description:
    'Ekonomi, avgift, energiklass och underhållsrisk för 33 706 bostadsrättsföreningar i hela Sverige. Beslutsunderlag direkt från Bolagsverket och Boverket.',
};

// ── Stats fetch (server-side, revalidates hourly) ─────────────────────────────

type SigvikStats = {
  brfs_total: number;
  brfs_scored: number;
  avg_score: number | null;
  high_signal_count: number;
  medium_signal_count: number;
  ingested_today: number;
};

async function getStats(): Promise<SigvikStats | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function fmtSv(n: number): string {
  return n.toLocaleString('sv-SE');
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const stats = await getStats();
  const total = stats?.brfs_total ?? 33706;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 md:pt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-display-sm font-normal tracking-tight">
              Sigvik
            </span>
            <span className="hidden md:inline font-sans text-overline text-ink-muted uppercase">
              BRF-intelligens
            </span>
          </div>
          <nav aria-label="Huvudnavigation" className="flex items-center gap-6 md:gap-8">
            <a href="/om" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
              Om
            </a>
            <a href="/leverantorer" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
              För leverantörer
            </a>
            <a href="/maklare" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
              För mäklare
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 md:px-12 py-16 md:py-24">
        <div className="w-full max-w-3xl">
          <div className="reveal reveal-delay-1">
            <span className="font-sans text-overline text-ink-muted uppercase block mb-6">
              {fmtSv(total)} föreningar · hela Sverige · uppdaterat dagligen
            </span>
          </div>

          <h1 className="reveal reveal-delay-2 font-display text-display-md md:text-display-xl font-normal tracking-tight text-ink mb-6 md:mb-8">
            Vad är din{' '}
            <span className="italic" style={{ fontVariationSettings: '"WONK" 1' }}>
              förening
            </span>{' '}
            värd att veta?
          </h1>

          <p className="reveal reveal-delay-3 font-display text-body-lg text-ink-soft max-w-prose mb-10 md:mb-14 leading-relaxed">
            Skriv in en adress, föreningsnamn eller organisationsnummer.
            Få ekonomi, årsavgift, energiklass och underhållsrisk för
            bostadsrättsföreningen — på under en sekund.
          </p>

          <div className="reveal reveal-delay-4">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* What it answers */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="reveal reveal-delay-1 mb-12 md:mb-16">
            <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
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
              answer="Lån per kvm, årsavgift per kvm och trend mot jämförbara föreningar i samma kommun och byggår. Om avgiften är låg idag — räknar vi ut när den troligen höjs."
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
              <span className="font-sans text-overline uppercase opacity-60 block mb-3">
                Metod
              </span>
              <h3 className="font-display text-display-sm md:text-display-md font-normal tracking-tight">
                Data från källan — inte från ett andrahandssäljsregister.
              </h3>
            </div>
            <div className="md:col-span-7 md:col-start-6 space-y-6 font-display text-body-lg leading-relaxed opacity-90">
              <p>
                Sigvik läser årsredovisningar direkt från Bolagsverket, energideklarationer
                från Boverket och fastighetsdata från Lantmäteriet. All intelligens vi visar
                har en spårbar källa och ett datum.
              </p>
              <p>
                När vi predikterar — till exempel energiklass för en förening som saknar
                aktuell deklaration — märker vi det tydligt och redovisar tillförlitligheten.
                Ingen punkt på sidan saknar proveniens.
              </p>
              <a
                href="/methodology"
                className="font-sans text-body-sm underline underline-offset-4 decoration-1 opacity-70 hover:opacity-100 transition-opacity inline-block"
              >
                Läs mer om vår metod →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage — national numbers */}
      <section className="px-6 md:px-12 py-16 md:py-24 border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5">
              <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
                Täckning
              </span>
              <h3 className="font-display text-display-md font-normal tracking-tight mb-6">
                All Sveriges bostadsrättsföreningar. Direkt.
              </h3>
              <p className="font-display text-body-lg text-ink-soft leading-relaxed max-w-prose">
                Sigvik täcker nu samtliga registrerade bostadsrättsföreningar i Sverige —
                från Ystad till Kiruna. Data ingesas dagligen direkt från Bolagsverket och
                Boverket utan mellanhänder.
              </p>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <dl className="space-y-5">
                <CoverageRow
                  metric={fmtSv(total)}
                  label="föreningar i hela Sverige"
                  source="Bolagsverket · komplett"
                />
                <div className="rule-dashed" />
                <CoverageRow
                  metric="289"
                  label="kommuner täckta"
                  source="alla 290 svenska kommuner"
                />
                <div className="rule-dashed" />
                <CoverageRow
                  metric="Dagligen"
                  label="uppdatering från Bolagsverket"
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
              <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                En del av Norric AB.<br />Malmö, Sverige.
              </p>
            </div>
            <div>
              <h4 className="font-sans text-overline uppercase text-ink-muted mb-3">
                Produkt
              </h4>
              <ul className="space-y-2">
                <li><a href="/om" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">Om Sigvik</a></li>
                <li><a href="/methodology" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">Metod och källor</a></li>
                <li><a href="/priser" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">Priser</a></li>
                <li><a href="/sweden" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">Nationell lansering</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-overline uppercase text-ink-muted mb-3">
                Partners
              </h4>
              <ul className="space-y-2">
                <li><a href="/leverantorer" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">För leverantörer</a></li>
                <li><a href="/maklare" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">För mäklare</a></li>
                <li><a href="/api-access" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">API-åtkomst</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-overline uppercase text-ink-muted mb-3">
                Kontakt
              </h4>
              <ul className="space-y-2">
                <li><a href="mailto:hej@sigvik.com" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">hej@sigvik.com</a></li>
                <li><a href="/integritet" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">Integritet</a></li>
                <li><a href="/villkor" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">Villkor</a></li>
              </ul>
            </div>
          </div>
          <div className="rule-dashed mt-10 mb-6" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <span className="font-sans text-caption text-ink-muted">
              © {new Date().getFullYear()} Norric AB · Org.nr 559XXX-XXXX
            </span>
            <span className="font-mono text-caption text-ink-muted">
              {process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0, 7) || 'dev'}
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
      <p className="font-display text-body-lg text-ink-soft leading-relaxed pl-10">
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
        <div className="font-sans text-body text-ink">{label}</div>
        <div className="font-sans text-body-sm text-ink-muted mt-1">{source}</div>
      </div>
      <span className="font-display text-display-sm text-ink tabular-nums whitespace-nowrap">
        {metric}
      </span>
    </div>
  );
}
