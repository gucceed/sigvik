import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { DataCompletenessBar } from '../../components/DataCompletenessBar';
import { ShareButton } from './ShareButton';

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

// ── Types ─────────────────────────────────────────────────────────────────────

type BRF = {
  id: number;
  orgnr: string;
  name: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  fastighetsbeteckning: string | null;
  registration_year: number | null;
  building_year: number | null;
  num_apartments: number | null;
  last_arsredovisning_year: number | null;
  num_arsredovisningar_ingested: number;
  intent_score: number | null;
  intent_score_confidence: number | null;
  intent_score_updated_at: string | null;
  last_ingested_at: string | null;
  ingestion_errors: number;
  is_active_scb: boolean | null;
  is_deregistered: boolean;
  is_winding_up: boolean;
  score_status: string | null;
  municipality_name: string | null;
  kommunkod: string | null;
};

type ArsRecord = {
  fiscal_year: number;
  avgift_per_sqm: number | null;
  avgift_change_pct: number | null;
  total_lan: number | null;
  lan_change_pct: number | null;
  arsresultat: number | null;
  underhallsfond: number | null;
  underhallsfond_change_pct: number | null;
  mentions_tak: boolean;
  mentions_fasad: boolean;
  mentions_stammar: boolean;
  mentions_fonster: boolean;
  mentions_hiss: boolean;
  tak_year_mentioned: number | null;
  fasad_year_mentioned: number | null;
  stammar_year_mentioned: number | null;
  fonster_year_mentioned: number | null;
  maintenance_plan_raw: string | null;
  parse_confidence: number | null;
};

type Energideklaration = {
  energiklass: string | null;
  primarenergital: string | null;
  energiprestanda: string | null;
  byggnadsar: number | null;
  utford: string | null;
  giltig_till: string | null;
  eu_deadline_pressure: boolean;
};

type BrfDetail = {
  brf: BRF;
  arsredovisningar: ArsRecord[];
  energideklaration: Energideklaration | null;
};

// ── Data fetching ─────────────────────────────────────────────────────────────

async function fetchBrf(orgnr: string): Promise<BrfDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/brfs/${orgnr}`, {
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { orgnr: string };
}): Promise<Metadata> {
  const data = await fetchBrf(params.orgnr);
  if (!data) {
    return { title: 'Förening hittades inte — Sigvik' };
  }
  const { brf } = data;
  const location = brf.municipality_name ?? brf.city ?? 'Sverige';
  return {
    title: `${brf.name} — Sigvik`,
    description: `Ekonomi, avgiftstrend och underhållsrisk för ${brf.name} i ${location}. Beslutsunderlag direkt från Bolagsverket och Boverket.`,
    openGraph: {
      title: `${brf.name} — Sigvik`,
      description: `BRF-analys för ${brf.name}, ${location}. Org.nr ${brf.orgnr}.`,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type Persona = 'buyer' | 'contractor' | 'agent';

function inferPersona(searchParams: Record<string, string | undefined>): Persona {
  if (searchParams.persona === 'contractor') return 'contractor';
  if (searchParams.persona === 'agent') return 'agent';
  const referer = headers().get('referer') ?? '';
  if (referer.includes('/leverantorer') || referer.includes('/contractor') || referer.includes('/search')) {
    return 'contractor';
  }
  if (referer.includes('/maklare') || referer.includes('/agent')) return 'agent';
  return 'buyer';
}

function verdiktLabel(confidence: number | null | undefined): string {
  if (confidence == null) return 'Tidig indikation';
  if (confidence >= 0.7) return 'Stark signal';
  if (confidence >= 0.4) return 'Måttlig signal';
  return 'Tidig indikation';
}

// Count signals present in the actual data — mirrors scoring engine logic
function countSignals(brf: BRF, ars: ArsRecord[]): { count: number; total: number } {
  const latest = ars[ars.length - 1];
  let count = 0;
  if (brf.building_year) count++;
  if (latest?.avgift_change_pct != null) count++;
  if (latest?.total_lan != null) count++;
  if (latest?.underhallsfond != null) count++;
  if (brf.intent_score_confidence && ars.some(
    a => a.mentions_tak || a.mentions_fasad || a.mentions_stammar || a.mentions_fonster || a.mentions_hiss
  )) count++;
  if (brf.is_active_scb != null) count++;
  return { count, total: 6 };
}

function autoSummary(brf: BRF, ars: ArsRecord[], ed: Energideklaration | null): string {
  const parts: string[] = [];
  const latest = ars[ars.length - 1];

  // Maintenance mentions with years (most useful for buyers)
  const renovations: string[] = [];
  if (ars.some(a => a.mentions_stammar)) {
    const year = ars.find(a => a.stammar_year_mentioned)?.stammar_year_mentioned;
    renovations.push(year ? `stambyte planerat ${year}` : 'stambyte nämns');
  }
  if (ars.some(a => a.mentions_tak)) {
    const year = ars.find(a => a.tak_year_mentioned)?.tak_year_mentioned;
    renovations.push(year ? `takunderhåll planerat ${year}` : 'tak nämns');
  }
  if (ars.some(a => a.mentions_fasad)) {
    const year = ars.find(a => a.fasad_year_mentioned)?.fasad_year_mentioned;
    renovations.push(year ? `fasadrenovering planerad ${year}` : 'fasad nämns');
  }

  if (renovations.length > 0) {
    parts.push(renovations.slice(0, 2).join(', ').replace(/^\w/, c => c.toUpperCase()));
  }

  // Fee trend
  if (latest?.avgift_change_pct != null && latest.avgift_change_pct > 2) {
    parts.push(`avgiftshöjning ${latest.avgift_change_pct.toFixed(1)}% senaste år`);
  }

  // Energy
  const energiklass = ed?.energiklass ?? null;
  if (energiklass && ['E', 'F', 'G'].includes(energiklass)) {
    parts.push(`energiklass ${energiklass} — EU-krav på uppgradering 2033`);
  } else if (energiklass) {
    parts.push(`energiklass ${energiklass}`);
  }

  if (parts.length === 0) {
    if (ars.length === 0) return 'Begränsad data tillgänglig — baseras på fastighetsregister.';
    return 'Stabil ekonomi baserat på tillgängliga signaler.';
  }
  return parts.join(' · ') + '.';
}

function dateFmt(iso: string | null): string {
  if (!iso) return 'okänt';
  try {
    return new Date(iso).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function numFmt(n: number): string {
  return n.toLocaleString('sv-SE');
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BrfDetailPage({
  params,
  searchParams,
}: {
  params: { orgnr: string };
  searchParams: Record<string, string | undefined>;
}) {
  const data = await fetchBrf(params.orgnr);
  if (!data) notFound();

  const { brf, arsredovisningar, energideklaration } = data;
  const persona = inferPersona(searchParams);
  const signals = countSignals(brf, arsredovisningar);
  const summary = autoSummary(brf, arsredovisningar, energideklaration);
  const label = verdiktLabel(brf.intent_score_confidence);
  const pageUrl = `https://sigvik.com/brf/${brf.orgnr}`;

  // Persona block order
  const blocks = persona === 'contractor'
    ? ['contractor', 'buyer', 'agent']
    : persona === 'agent'
    ? ['agent', 'buyer', 'contractor']
    : ['buyer', 'contractor', 'agent'];

  // ── Structured data ──────────────────────────────────────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brf.name,
    identifier: brf.orgnr,
    url: pageUrl,
    address: {
      '@type': 'PostalAddress',
      streetAddress: brf.street ?? undefined,
      postalCode: brf.postal_code ?? undefined,
      addressLocality: brf.city ?? brf.municipality_name ?? undefined,
      addressCountry: 'SE',
    },
  };

  return (
    <main className="min-h-screen bg-paper">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 md:pt-10 border-b border-rule">
        <div className="max-w-7xl mx-auto flex items-center justify-between pb-6">
          <a
            href="/"
            className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors"
          >
            Sigvik
          </a>
          <div className="flex items-center gap-6">
            <a href="/" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
              ← Sök
            </a>
            <ShareButton url={pageUrl} name={brf.name} />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto pb-4">
          <nav aria-label="Brödsmula">
            <ol className="flex items-center gap-2 font-sans text-caption text-ink-muted">
              <li><a href="/" className="hover:text-ink transition-colors">Sigvik</a></li>
              {brf.municipality_name && (
                <>
                  <li aria-hidden>·</li>
                  <li>{brf.municipality_name}</li>
                </>
              )}
              <li aria-hidden>·</li>
              <li className="text-ink truncate max-w-xs">{brf.name}</li>
            </ol>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">

        {/* ── ABOVE FOLD — all personas ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 md:gap-12 mb-12 md:mb-16">

          {/* Identity */}
          <div>
            {/* Status badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              {brf.is_winding_up && (
                <span className="font-sans text-overline uppercase px-2 py-0.5 border border-signal text-signal">
                  Under likvidation
                </span>
              )}
              {brf.is_deregistered && (
                <span className="font-sans text-overline uppercase px-2 py-0.5 border border-rule text-ink-muted">
                  Avregistrerad
                </span>
              )}
              {!brf.is_deregistered && !brf.is_winding_up && (
                <span className="font-sans text-overline uppercase px-2 py-0.5 border border-rule text-ink-soft">
                  Aktiv förening
                </span>
              )}
            </div>

            <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight text-ink mb-3">
              {brf.name}
            </h1>

            {(brf.street || brf.city) && (
              <p className="font-sans text-body-lg text-ink-soft mb-4">
                {[brf.street, brf.postal_code, brf.city].filter(Boolean).join(' · ')}
              </p>
            )}

            {/* Auto-summary */}
            <p className="font-display text-body-lg text-ink-soft leading-relaxed max-w-prose border-l-2 border-rule pl-4 italic">
              {summary}
            </p>
          </div>

          {/* Verdict box */}
          <div className="border border-rule p-6 md:p-8 self-start">
            <p className="font-sans text-overline text-ink-muted uppercase mb-4">
              Underhållssignal
            </p>

            {brf.intent_score != null ? (
              <>
                <div className={`font-display text-display-xl font-normal tracking-tight leading-none mb-1 ${
                  label === 'Stark signal' ? 'text-amber'
                  : label === 'Måttlig signal' ? 'text-ink'
                  : 'text-ink-muted'
                }`}>
                  {label}
                </div>

                <p className="font-sans text-caption text-ink-muted mb-5">
                  {signals.count} av {signals.total} signaler tillgängliga
                </p>

                {brf.intent_score_confidence != null && (
                  <div className="h-px bg-rule overflow-hidden mb-5">
                    <div
                      className="h-full bg-ink-muted transition-all"
                      style={{ width: `${Math.round(brf.intent_score_confidence * 100)}%` }}
                    />
                  </div>
                )}

                <p className="font-sans text-caption text-ink-muted leading-relaxed">
                  Baseras på avgiftshöjningar, låneutveckling, underhållsplaner och energiklass.
                </p>
              </>
            ) : (
              <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
                Signal beräknas — ingestion pågår.
              </p>
            )}

            <div className="border-t border-rule mt-5 pt-4">
              <p className="font-sans text-caption text-ink-muted">
                {brf.last_ingested_at
                  ? `Uppdaterat ${dateFmt(brf.last_ingested_at)}`
                  : 'Uppdateringstid okänd'}
              </p>
              {brf.last_arsredovisning_year && (
                <p className="font-sans text-caption text-ink-muted mt-1">
                  Senaste årsredovisning: {brf.last_arsredovisning_year}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── KEY FACTS ─────────────────────────────────────────────────────── */}
        <section className="mb-12 md:mb-16" aria-label="Nyckeluppgifter">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-4">
            Nyckeluppgifter
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-3 border-t border-rule pt-4">
            <KeyFact label="Organisationsnummer" value={brf.orgnr} mono />
            {brf.municipality_name && <KeyFact label="Kommun" value={brf.municipality_name} />}
            {brf.registration_year && <KeyFact label="Registreringsår" value={String(brf.registration_year)} />}
            {brf.building_year && <KeyFact label="Byggår" value={String(brf.building_year)} />}
            {brf.num_apartments && <KeyFact label="Antal lägenheter" value={numFmt(brf.num_apartments)} />}
            {(energideklaration?.energiklass || null) && (
              <KeyFact
                label="Energiklass"
                value={energideklaration!.energiklass!}
                note={energideklaration?.eu_deadline_pressure ? 'EU-krav på uppgradering 2033' : undefined}
              />
            )}
            {brf.fastighetsbeteckning && <KeyFact label="Fastighetsbeteckning" value={brf.fastighetsbeteckning} />}
          </dl>
        </section>

        {/* ── DATA COMPLETENESS ─────────────────────────────────────────────── */}
        <section className="mb-12 md:mb-16" aria-label="Datakvalitet">
          <h2 className="font-sans text-overline text-ink-muted uppercase mb-4">
            Tillgängliga datasignaler
          </h2>
          <div className="border-t border-rule pt-4">
            <DataCompletenessBar brf={{
              is_active_scb: brf.is_active_scb,
              is_deregistered: brf.is_deregistered,
              is_winding_up: brf.is_winding_up,
              docs_fetched: brf.num_arsredovisningar_ingested,
              building_year: brf.building_year,
              energy_class: energideklaration?.energiklass ?? null,
            }} />
          </div>
        </section>

        {/* ── PERSONA BLOCKS ────────────────────────────────────────────────── */}
        <div className="space-y-12 md:space-y-16">
          {blocks.map((block) => {
            if (block === 'buyer') return (
              <BuyerBlock
                key="buyer"
                brf={brf}
                arsredovisningar={arsredovisningar}
                energideklaration={energideklaration}
                isLead={persona === 'buyer'}
              />
            );
            if (block === 'contractor') return (
              <ContractorBlock
                key="contractor"
                brf={brf}
                arsredovisningar={arsredovisningar}
                isLead={persona === 'contractor'}
              />
            );
            if (block === 'agent') return (
              <AgentBlock
                key="agent"
                brf={brf}
                arsredovisningar={arsredovisningar}
                energideklaration={energideklaration}
                pageUrl={pageUrl}
                isLead={persona === 'agent'}
              />
            );
            return null;
          })}
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────────── */}
        <div className="border-t border-rule mt-16 pt-8">
          <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
            Data hämtas från Bolagsverket (årsredovisningar, registreringsdata),
            Boverket (energideklarationer) och Skatteverket. Informationen tillhandahålls
            i informationssyfte och utgör inte finansiell rådgivning.{' '}
            <a href="/methodology" className="text-ink hover:text-accent underline underline-offset-4 decoration-1">
              Läs om vår metod →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KeyFact({
  label,
  value,
  mono = false,
  note,
}: {
  label: string;
  value: string;
  mono?: boolean;
  note?: string;
}) {
  return (
    <div className="flex flex-col py-3 border-b border-rule-soft">
      <dt className="font-sans text-caption text-ink-muted mb-1">{label}</dt>
      <dd className={`${mono ? 'font-mono' : 'font-sans'} text-body-sm text-ink`}>
        {value}
        {note && <span className="font-sans text-caption text-ink-muted ml-2">({note})</span>}
      </dd>
    </div>
  );
}

function SectionHeader({
  label,
  title,
  isLead,
}: {
  label: string;
  title: string;
  isLead: boolean;
}) {
  return (
    <div className="border-t border-rule pt-8 mb-6">
      <span className="font-sans text-overline text-ink-muted uppercase block mb-2">
        {label}
      </span>
      <h2 className={`font-display font-normal tracking-tight ${isLead ? 'text-display-sm' : 'text-body-lg'} text-ink`}>
        {title}
      </h2>
    </div>
  );
}

// ── Buyer block ───────────────────────────────────────────────────────────────

function BuyerBlock({
  brf,
  arsredovisningar,
  energideklaration,
  isLead,
}: {
  brf: BRF;
  arsredovisningar: ArsRecord[];
  energideklaration: Energideklaration | null;
  isLead: boolean;
}) {
  const latest = arsredovisningar[arsredovisningar.length - 1];
  const hasFinancialData = latest != null;

  return (
    <section aria-label="För köparen">
      <SectionHeader label="För köparen" title="Ekonomi och underhållsrisk" isLead={isLead} />

      {!hasFinancialData ? (
        <div className="border border-rule p-6 max-w-prose">
          <p className="font-sans text-body text-ink-soft leading-relaxed mb-3">
            Årsredovisningar för denna förening är ännu inte inlästa digitalt.
            Sigvik hämtar löpande dokument från Bolagsverket.
          </p>
          <p className="font-sans text-body-sm text-ink-muted">
            Beräknad signal baseras på byggår och fastighetsregisterdata.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fee trend */}
          <div>
            <h3 className="font-sans text-overline text-ink-muted uppercase mb-4">Avgiftsutveckling</h3>
            <div className="space-y-2">
              {arsredovisningar.slice(-5).reverse().map((a) => (
                <div key={a.fiscal_year} className="flex items-baseline justify-between py-2 border-b border-rule-soft">
                  <span className="font-mono text-caption text-ink-muted">{a.fiscal_year}</span>
                  {a.avgift_change_pct != null ? (
                    <span className={`font-sans text-body-sm ${a.avgift_change_pct > 5 ? 'text-amber' : a.avgift_change_pct > 0 ? 'text-ink' : 'text-sage'}`}>
                      {a.avgift_change_pct > 0 ? '+' : ''}{a.avgift_change_pct.toFixed(1)} %
                    </span>
                  ) : (
                    <span className="font-sans text-caption text-ink-muted">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Debt & fund */}
          <div>
            <h3 className="font-sans text-overline text-ink-muted uppercase mb-4">Finansiell hälsa</h3>
            <dl className="space-y-3">
              {latest.total_lan != null && (
                <div>
                  <dt className="font-sans text-caption text-ink-muted mb-1">Totala lån</dt>
                  <dd className="font-sans text-body-sm text-ink">{numFmt(Math.round(latest.total_lan))} kr</dd>
                </div>
              )}
              {latest.underhallsfond != null && (
                <div>
                  <dt className="font-sans text-caption text-ink-muted mb-1">Underhållsfond</dt>
                  <dd className="font-sans text-body-sm text-ink">{numFmt(Math.round(latest.underhallsfond))} kr</dd>
                </div>
              )}
              {latest.arsresultat != null && (
                <div>
                  <dt className="font-sans text-caption text-ink-muted mb-1">Årets resultat</dt>
                  <dd className={`font-sans text-body-sm ${latest.arsresultat < 0 ? 'text-signal' : 'text-ink'}`}>
                    {numFmt(Math.round(latest.arsresultat))} kr
                  </dd>
                </div>
              )}
              {!latest.total_lan && !latest.underhallsfond && !latest.arsresultat && (
                <p className="font-sans text-body-sm text-ink-muted">
                  Finansiella uppgifter saknas i senaste årsredovisning.
                </p>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Energy */}
      {energideklaration && (
        <div className="mt-8 border border-rule p-5">
          <h3 className="font-sans text-overline text-ink-muted uppercase mb-3">Energideklaration</h3>
          <div className="flex flex-wrap gap-8">
            {energideklaration.energiklass && (
              <div>
                <p className="font-sans text-caption text-ink-muted mb-1">Energiklass</p>
                <p className="font-display text-display-sm text-ink">{energideklaration.energiklass}</p>
              </div>
            )}
            {energideklaration.primarenergital && (
              <div>
                <p className="font-sans text-caption text-ink-muted mb-1">Primärenergital</p>
                <p className="font-sans text-body-sm text-ink">{energideklaration.primarenergital}</p>
              </div>
            )}
            {energideklaration.giltig_till && (
              <div>
                <p className="font-sans text-caption text-ink-muted mb-1">Giltig till</p>
                <p className="font-sans text-body-sm text-ink">{dateFmt(energideklaration.giltig_till)}</p>
              </div>
            )}
          </div>
          {energideklaration.eu_deadline_pressure && (
            <p className="font-sans text-body-sm text-amber mt-3 leading-relaxed">
              EU:s energidirektiv kräver uppgradering till energiklass D senast 2033 för
              byggnader med klass E, F eller G.
            </p>
          )}
        </div>
      )}

      {/* Planned work */}
      {arsredovisningar.length > 0 && (
        <div className="mt-8">
          <h3 className="font-sans text-overline text-ink-muted uppercase mb-4">Planerat underhåll</h3>
          {(() => {
            const mentions: { type: string; year: number | null }[] = [];
            if (arsredovisningar.some(a => a.mentions_stammar)) mentions.push({ type: 'Stambyte / VA-system', year: arsredovisningar.find(a => a.stammar_year_mentioned)?.stammar_year_mentioned ?? null });
            if (arsredovisningar.some(a => a.mentions_tak)) mentions.push({ type: 'Takunderhåll', year: arsredovisningar.find(a => a.tak_year_mentioned)?.tak_year_mentioned ?? null });
            if (arsredovisningar.some(a => a.mentions_fasad)) mentions.push({ type: 'Fasadrenovering', year: arsredovisningar.find(a => a.fasad_year_mentioned)?.fasad_year_mentioned ?? null });
            if (arsredovisningar.some(a => a.mentions_fonster)) mentions.push({ type: 'Fönsterbyte', year: arsredovisningar.find(a => a.fonster_year_mentioned)?.fonster_year_mentioned ?? null });
            if (arsredovisningar.some(a => a.mentions_hiss)) mentions.push({ type: 'Hiss', year: null });

            if (mentions.length === 0) {
              return <p className="font-sans text-body-sm text-ink-muted">Inget planerat underhåll nämns i tillgängliga årsredovisningar.</p>;
            }
            return (
              <ul className="space-y-2">
                {mentions.map((m, i) => (
                  <li key={i} className="flex items-baseline justify-between py-2 border-b border-rule-soft">
                    <span className="font-sans text-body-sm text-ink">{m.type}</span>
                    <span className="font-mono text-caption text-ink-muted">{m.year ?? 'År ej angivet'}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}
    </section>
  );
}

// ── Contractor block ──────────────────────────────────────────────────────────

function ContractorBlock({
  brf,
  arsredovisningar,
  isLead,
}: {
  brf: BRF;
  arsredovisningar: ArsRecord[];
  isLead: boolean;
}) {
  const buildingAge = brf.building_year ? new Date().getFullYear() - brf.building_year : null;

  const projectHints: string[] = [];
  if (arsredovisningar.some(a => a.mentions_stammar)) projectHints.push('Stambyte / VVS');
  if (arsredovisningar.some(a => a.mentions_tak)) projectHints.push('Takunderhåll');
  if (arsredovisningar.some(a => a.mentions_fasad)) projectHints.push('Fasadrenovering');
  if (arsredovisningar.some(a => a.mentions_fonster)) projectHints.push('Fönsterbyte');
  if (arsredovisningar.some(a => a.mentions_hiss)) projectHints.push('Hiss');

  // Lifecycle-based hints (deterministic)
  if (projectHints.length === 0 && buildingAge != null) {
    if (buildingAge >= 40) projectHints.push('Stambyte sannolikt (byggår)');
    if (buildingAge >= 25) projectHints.push('Tak/fasad möjligt (byggår)');
  }

  return (
    <section aria-label="För leverantörer">
      <SectionHeader label="För leverantörer" title="Signaltimeline och projektindikation" isLead={isLead} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Project hints */}
        <div>
          <h3 className="font-sans text-overline text-ink-muted uppercase mb-4">Projektindikation</h3>
          {projectHints.length > 0 ? (
            <ul className="space-y-2">
              {projectHints.map((h, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-rule-soft">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" aria-hidden />
                  <span className="font-sans text-body-sm text-ink">{h}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-body-sm text-ink-muted">
              Inga explicita signaler i tillgängliga årsredovisningar.
              Bedömning baseras på byggår.
            </p>
          )}
        </div>

        {/* Building lifecycle */}
        <div>
          <h3 className="font-sans text-overline text-ink-muted uppercase mb-4">Fastighetsdata</h3>
          <dl className="space-y-3">
            {brf.building_year && (
              <div>
                <dt className="font-sans text-caption text-ink-muted mb-1">Byggår</dt>
                <dd className="font-sans text-body-sm text-ink">
                  {brf.building_year}
                  {buildingAge != null && (
                    <span className="text-ink-muted ml-2">({buildingAge} år)</span>
                  )}
                </dd>
              </div>
            )}
            {brf.num_apartments && (
              <div>
                <dt className="font-sans text-caption text-ink-muted mb-1">Lägenheter</dt>
                <dd className="font-sans text-body-sm text-ink">{numFmt(brf.num_apartments)}</dd>
              </div>
            )}
            {brf.fastighetsbeteckning && (
              <div>
                <dt className="font-sans text-caption text-ink-muted mb-1">Fastighetsbeteckning</dt>
                <dd className="font-sans text-body-sm text-ink">{brf.fastighetsbeteckning}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 border border-rule-soft p-4">
        <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
          Styrelsekontakt: Bolagsverkets offentliga register innehåller styrelseuppgifter.
          Sigvik lagrar inte personuppgifter om styrelseledamöter.{' '}
          <a
            href={`https://www.bolagsverket.se/foretag/sok/foretagsinformation.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink hover:text-accent underline underline-offset-4 decoration-1"
          >
            Sök på Bolagsverket →
          </a>
        </p>
      </div>
    </section>
  );
}

// ── Agent block ───────────────────────────────────────────────────────────────

function AgentBlock({
  brf,
  arsredovisningar,
  energideklaration,
  pageUrl,
  isLead,
}: {
  brf: BRF;
  arsredovisningar: ArsRecord[];
  energideklaration: Energideklaration | null;
  pageUrl: string;
  isLead: boolean;
}) {
  const latest = arsredovisningar[arsredovisningar.length - 1];

  return (
    <section aria-label="För mäklare">
      <SectionHeader label="För mäklare" title="Dela och presentera" isLead={isLead} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Share & report */}
        <div className="space-y-4">
          <div className="border border-rule p-5">
            <h3 className="font-sans text-overline text-ink-muted uppercase mb-3">Dela med köpare</h3>
            <p className="font-sans text-body-sm text-ink-soft leading-relaxed mb-4">
              Kopiera länken nedan och skicka till din köpare. Sidan visar
              ekonomi, avgiftstrend och underhållsrisk för föreningen.
            </p>
            <ShareButton url={pageUrl} name={brf.name} />
          </div>

          <div className="border border-rule-soft p-5">
            <h3 className="font-sans text-overline text-ink-muted uppercase mb-2">Köparrapport PDF</h3>
            <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
              PDF-export med Sigvik-logotyp och källhänvisningar.
              Lanseras för mäklare under 2026.
            </p>
            <a
              href="mailto:hej@sigvik.com?subject=Mäklaråtkomst — PDF-rapport"
              className="font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1 mt-3 inline-block"
            >
              Anmäl intresse →
            </a>
          </div>
        </div>

        {/* Quick facts for buyer presentation */}
        <div>
          <h3 className="font-sans text-overline text-ink-muted uppercase mb-4">Snabbfakta för visning</h3>
          <dl className="space-y-3">
            {brf.building_year && (
              <div className="flex justify-between py-2 border-b border-rule-soft">
                <dt className="font-sans text-body-sm text-ink-muted">Byggår</dt>
                <dd className="font-sans text-body-sm text-ink">{brf.building_year}</dd>
              </div>
            )}
            {brf.num_apartments && (
              <div className="flex justify-between py-2 border-b border-rule-soft">
                <dt className="font-sans text-body-sm text-ink-muted">Lägenheter</dt>
                <dd className="font-sans text-body-sm text-ink">{numFmt(brf.num_apartments)}</dd>
              </div>
            )}
            {energideklaration?.energiklass && (
              <div className="flex justify-between py-2 border-b border-rule-soft">
                <dt className="font-sans text-body-sm text-ink-muted">Energiklass</dt>
                <dd className="font-sans text-body-sm text-ink">{energideklaration.energiklass}</dd>
              </div>
            )}
            {latest?.avgift_change_pct != null && (
              <div className="flex justify-between py-2 border-b border-rule-soft">
                <dt className="font-sans text-body-sm text-ink-muted">Avgiftsändring senaste år</dt>
                <dd className="font-sans text-body-sm text-ink">
                  {latest.avgift_change_pct > 0 ? '+' : ''}{latest.avgift_change_pct.toFixed(1)} %
                </dd>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-rule-soft">
              <dt className="font-sans text-body-sm text-ink-muted">Årsredovisningar inlästa</dt>
              <dd className="font-sans text-body-sm text-ink">{brf.num_arsredovisningar_ingested}</dd>
            </div>
            {brf.last_ingested_at && (
              <div className="flex justify-between py-2">
                <dt className="font-sans text-body-sm text-ink-muted">Senast uppdaterat</dt>
                <dd className="font-sans text-body-sm text-ink">{dateFmt(brf.last_ingested_at)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </section>
  );
}
