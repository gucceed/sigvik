import type { Metadata } from 'next';

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

export const metadata: Metadata = {
  title: 'Sigvik täcker nu hela Sverige — 33 706 föreningar',
  description:
    '33 706 bostadsrättsföreningar. 289 kommuner. Data direkt från Bolagsverket och Boverket. Sigvik är nu nationellt.',
  openGraph: {
    title: 'Sigvik täcker nu hela Sverige',
    description:
      '33 706 bostadsrättsföreningar. 289 kommuner. Data direkt från Bolagsverket och Boverket.',
    url: 'https://sigvik.com/sweden',
  },
};

type Stats = {
  brfs_total: number;
  brfs_scored: number;
  ingested_today: number;
};

async function getStats(): Promise<Stats | null> {
  try {
    const res = await fetch(`${API_URL}/api/stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function fmtSv(n: number) {
  return n.toLocaleString('sv-SE');
}

export default async function SwedenPage() {
  const stats = await getStats();
  const total = stats?.brfs_total ?? 33706;
  const scored = stats?.brfs_scored ?? 22000;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 md:pt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors"
          >
            Sigvik
          </a>
          <a href="/" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
            Sök förening →
          </a>
        </div>
      </header>

      {/* ── Panel 1: The announcement ─────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-3xl mx-auto">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-8">
            9 maj 2026
          </span>

          <h1 className="font-display text-display-lg md:text-display-xl font-normal tracking-tight text-ink mb-8 md:mb-10">
            <span
              className="tabular-nums"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {fmtSv(total)}
            </span>{' '}
            <span className="italic" style={{ fontVariationSettings: '"WONK" 1' }}>
              föreningar.
            </span>
          </h1>

          <div className="font-display text-body-lg text-ink-soft leading-relaxed max-w-prose space-y-5">
            <p>
              Sigvik täcker nu samtliga registrerade bostadsrättsföreningar i
              Sverige — från Ystad i söder till Kiruna i norr. Databasen
              innehåller {fmtSv(total)} aktiva föreningar fördelade på 289
              kommuner. Data ingesas dagligen direkt från Bolagsverket och
              Boverket.
            </p>
            <p>
              Det är inte en prognos. Det är vad som finns i registret idag.
            </p>
          </div>
        </div>
      </section>

      {/* ── Panel 2: The numbers ──────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-t border-rule bg-ink text-paper">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 md:mb-20">
            <span className="font-sans text-overline opacity-50 uppercase block mb-4">
              Siffrorna
            </span>
            <h2 className="font-display text-display-md md:text-display-lg font-normal tracking-tight max-w-prose">
              Vad som är live idag.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-white/10">
            <StatPanel
              number={fmtSv(total)}
              label="bostadsrättsföreningar"
              note="aktiva i Bolagsverkets register"
            />
            <StatPanel
              number="289"
              label="kommuner"
              note="alla 290 svenska kommuner täckta"
            />
            <StatPanel
              number={fmtSv(scored)}
              label="föreningar med signal"
              note="underhållsintent beräknad"
            />
            <StatPanel
              number="< 1 sek"
              label="från adress till verdikt"
              note="p95 latens"
            />
          </div>

          <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t border-white/10 pt-12">
            <SourceItem
              source="Bolagsverket"
              type="Primärkälla"
              description="Årsredovisningar, registreringsdata, lån och stadgar. Ingestion via Värdefulla datamängder API."
            />
            <SourceItem
              source="Boverket"
              type="Primärkälla"
              description="Energideklarationer per fastighet. Klass A–G, primärenergital och EU-tidsgränsanalys."
            />
            <SourceItem
              source="Lantmäteriet / SCB"
              type="Referensdata"
              description="Byggår, fastighetsbeteckning och kommungränser för normering och regional jämförelse."
            />
          </div>
        </div>
      </section>

      {/* ── Panel 3: What's next ──────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-20 md:py-28 border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <span className="font-sans text-overline text-ink-muted uppercase block mb-4">
                Vad händer härnäst
              </span>
              <h2 className="font-display text-display-md font-normal tracking-tight">
                Infrastrukturen är på plats. Nu byggs produkten.
              </h2>
            </div>

            <div className="md:col-span-7 md:col-start-6 space-y-8">
              <RoadmapItem
                status="Nu"
                title="Nationell sökning och BRF-profil"
                description="Sök alla 33 706 föreningar direkt. Varje BRF-sida visar ekonomi, avgiftstrend, energiklass och underhållssignal baserat på tillgängliga årsredovisningar."
              />
              <RoadmapItem
                status="Nästa"
                title="Årsredovisningsparser — högre signaltäckning"
                description="Idag baseras signaler primärt på fastighetsregister och byggår. NLP-parsing av årsredovisningstexter aktiveras löpande och förbättrar signalkvaliteten per förening."
              />
              <RoadmapItem
                status="Kommande"
                title="Prisriktmärken och projekthistorik"
                description="Inrapporterade projektkostnader från föreningar och förvaltare — stambyte, fasad, fönster — ger köpare och leverantörer marknadspris per region och byggårsgrupp."
              />
              <RoadmapItem
                status="Framtid"
                title="Transaktionsplattform"
                description="Strukturerade förfrågningar från föreningar. Verifierade anbud från entreprenörer. Transparens i ett led som idag saknar det."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-16 md:py-20 border-t border-rule bg-paper">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-display text-display-sm font-normal tracking-tight mb-6">
            Sök din förening.
          </p>
          <a
            href="/"
            className="inline-block font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
          >
            sigvik.com →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-10 border-t border-rule">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span className="font-sans text-caption text-ink-muted">
            © {new Date().getFullYear()} Norric AB · Malmö, Sverige
          </span>
          <div className="flex items-center gap-6">
            <a href="/methodology" className="font-sans text-caption text-ink-muted hover:text-ink transition-colors">Metod</a>
            <a href="/integritet" className="font-sans text-caption text-ink-muted hover:text-ink transition-colors">Integritet</a>
            <a href="mailto:hej@sigvik.com" className="font-sans text-caption text-ink-muted hover:text-ink transition-colors">hej@sigvik.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatPanel({ number, label, note }: { number: string; label: string; note: string }) {
  return (
    <div className="bg-ink p-8 md:p-10">
      <div className="font-display text-display-lg font-normal tracking-tight text-paper tabular-nums leading-tight mb-2">
        {number}
      </div>
      <div className="font-sans text-body-sm text-paper/70 mb-1">{label}</div>
      <div className="font-sans text-caption text-paper/40">{note}</div>
    </div>
  );
}

function SourceItem({ source, type, description }: { source: string; type: string; description: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-display text-display-sm font-normal text-paper">{source}</span>
        <span className="font-sans text-caption text-paper/40 uppercase">{type}</span>
      </div>
      <p className="font-sans text-body-sm text-paper/60 leading-relaxed">{description}</p>
    </div>
  );
}

function RoadmapItem({ status, title, description }: { status: string; title: string; description: string }) {
  return (
    <div className="flex gap-6">
      <div className="shrink-0 w-16">
        <span className="font-sans text-overline text-ink-muted uppercase">{status}</span>
      </div>
      <div>
        <h3 className="font-display text-body-lg font-normal text-ink mb-2">{title}</h3>
        <p className="font-sans text-body-sm text-ink-soft leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
