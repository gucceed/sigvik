import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { DataCompletenessBar } from '../../components/DataCompletenessBar';
import { ShareButton } from './ShareButton';
import { GradeChip } from '../../components/GradeChip';
import { ScoreBar } from '../../components/ScoreBar';
import { DataPoint } from '../../components/DataPoint';
import { TrendArrow } from '../../components/TrendArrow';
import { SignalRow } from '../../components/SignalRow';
import { UncertaintyNote } from '../../components/UncertaintyNote';
import { SourceBadge } from '../../components/SourceBadge';
import { AvgiftChart } from '../../components/AvgiftChart';

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

// ── Grade derivation ──────────────────────────────────────────────────────────
// Derived from financial data in årsredovisningar.
// This is Sigvik's own assessment — not from an external rating agency.

type GradeResult = {
  grade: string | null;
  score: number;            // 0–100 for ScoreBar
  confidence: 'high' | 'medium' | 'low' | 'insufficient';
  signalCount: number;
};

const GRADE_LABELS: Record<string, string> = {
  A: 'Stabil ekonomi',
  B: 'God ekonomi',
  C: 'Godtagbar ekonomi',
  D: 'Svag ekonomi — granska noggrant',
  E: 'Ansträngd ekonomi',
  F: 'Allvarliga signaler',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'Hög säkerhet',
  medium: 'Måttlig säkerhet — kontrollera årsredovisningen',
  low: 'Låg säkerhet — verifiera mot källorna',
  insufficient: 'Otillräcklig data för bedömning',
};

function deriveGrade(brf: BRF, ars: ArsRecord[]): GradeResult {
  if (ars.length === 0) {
    return { grade: null, score: 0, confidence: 'insufficient', signalCount: 0 };
  }

  const latest = ars[ars.length - 1];
  let score = 60; // start neutral
  let signals = 0;

  // Signal 1: Fee trend (most predictive for buyers)
  const recent = ars.slice(-3);
  const avgTrendPct = recent.filter(a => a.avgift_change_pct != null).length > 0
    ? recent.reduce((s, a) => s + (a.avgift_change_pct ?? 0), 0) / recent.filter(a => a.avgift_change_pct != null).length
    : null;

  if (avgTrendPct != null) {
    signals++;
    if (avgTrendPct > 12) score -= 25;
    else if (avgTrendPct > 7) score -= 15;
    else if (avgTrendPct > 3) score -= 7;
    else if (avgTrendPct < 0) score += 8;
    else score += 2; // stable is positive
  }

  // Signal 2: Debt per unit
  if (latest.total_lan != null && brf.num_apartments) {
    signals++;
    const debtPerUnit = latest.total_lan / brf.num_apartments;
    if (debtPerUnit > 150_000) score -= 20;
    else if (debtPerUnit > 100_000) score -= 10;
    else if (debtPerUnit > 60_000) score -= 3;
    else if (debtPerUnit < 30_000) score += 10;
  }

  // Signal 3: Net result per unit
  if (latest.arsresultat != null && brf.num_apartments) {
    signals++;
    const resultPerUnit = latest.arsresultat / brf.num_apartments;
    if (resultPerUnit < -8_000) score -= 18;
    else if (resultPerUnit < -3_000) score -= 8;
    else if (resultPerUnit > 2_000) score += 8;
  }

  // Signal 4: Underhållsfond per unit
  if (latest.underhallsfond != null && brf.num_apartments) {
    signals++;
    const fundPerUnit = latest.underhallsfond / brf.num_apartments;
    if (fundPerUnit > 20_000) score += 12;
    else if (fundPerUnit > 8_000) score += 5;
    else if (fundPerUnit < 2_000) score -= 10;
  }

  // Signal 5: Multiple consecutive increases (structural)
  const consecutiveIncreases = ars.slice(-4).filter(a => (a.avgift_change_pct ?? 0) > 5).length;
  if (consecutiveIncreases >= 3) { score -= 15; signals++; }

  if (signals < 2) {
    return { grade: null, score: 0, confidence: 'insufficient', signalCount: signals };
  }

  const clamped = Math.max(0, Math.min(100, score));
  const confidence: GradeResult['confidence'] =
    signals >= 4 ? 'high' : signals >= 3 ? 'medium' : 'low';

  let grade: string;
  if (clamped >= 75) grade = 'A';
  else if (clamped >= 65) grade = 'B';
  else if (clamped >= 52) grade = 'C';
  else if (clamped >= 40) grade = 'D';
  else if (clamped >= 28) grade = 'E';
  else grade = 'F';

  return { grade, score: clamped, confidence, signalCount: signals };
}

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
  if (!data) return { title: 'Förening hittades inte — Sigvik' };
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
  if (referer.includes('/leverantorer') || referer.includes('/contractor') || referer.includes('/search')) return 'contractor';
  if (referer.includes('/maklare') || referer.includes('/agent')) return 'agent';
  return 'buyer';
}

function dateFmt(iso: string | null): string {
  if (!iso) return 'okänt';
  try {
    return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso.slice(0, 10); }
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
  const persona  = inferPersona(searchParams);
  const gradeResult = deriveGrade(brf, arsredovisningar);
  const pageUrl = `https://sigvik.com/brf/${brf.orgnr}`;

  const latest  = arsredovisningar[arsredovisningar.length - 1] ?? null;
  const isRapport = searchParams.view === 'rapport';

  // Chart data: last 5 years
  const chartData = arsredovisningar
    .filter(a => a.avgift_per_sqm != null)
    .slice(-5)
    .map(a => ({ year: a.fiscal_year, avgift: a.avgift_per_sqm! }));

  // Latest avgift trend for summary sentence
  const latestTrend = latest?.avgift_change_pct ?? null;

  // Renovation signals from årsredovisningar
  type SignalEntry = { type: string; urgency: 'within_1yr' | '1_3yr' | '3_5yr' | '5yr_plus' | 'unknown'; basis: string };
  const renovationSignals: SignalEntry[] = [];
  const currentYear = new Date().getFullYear();

  function urgencyFromYear(yr: number | null): SignalEntry['urgency'] {
    if (!yr) return 'unknown';
    const delta = yr - currentYear;
    if (delta <= 1) return 'within_1yr';
    if (delta <= 3) return '1_3yr';
    if (delta <= 5) return '3_5yr';
    return '5yr_plus';
  }

  if (arsredovisningar.some(a => a.mentions_stammar)) {
    const yr = arsredovisningar.find(a => a.stammar_year_mentioned)?.stammar_year_mentioned ?? null;
    renovationSignals.push({
      type: 'Stambyte / VVS',
      urgency: urgencyFromYear(yr),
      basis: yr ? `Nämnt med planerat år ${yr} i årsredovisning` : 'Nämnt i årsredovisning — år ej angivet',
    });
  }
  if (arsredovisningar.some(a => a.mentions_tak)) {
    const yr = arsredovisningar.find(a => a.tak_year_mentioned)?.tak_year_mentioned ?? null;
    renovationSignals.push({
      type: 'Takunderhåll',
      urgency: urgencyFromYear(yr),
      basis: yr ? `Nämnt med planerat år ${yr}` : 'Nämnt i årsredovisning — år ej angivet',
    });
  }
  if (arsredovisningar.some(a => a.mentions_fasad)) {
    const yr = arsredovisningar.find(a => a.fasad_year_mentioned)?.fasad_year_mentioned ?? null;
    renovationSignals.push({
      type: 'Fasadrenovering',
      urgency: urgencyFromYear(yr),
      basis: yr ? `Nämnt med planerat år ${yr}` : 'Nämnt i årsredovisning — år ej angivet',
    });
  }
  if (arsredovisningar.some(a => a.mentions_fonster)) {
    renovationSignals.push({ type: 'Fönsterbyte', urgency: 'unknown', basis: 'Nämnt i årsredovisning' });
  }
  if (arsredovisningar.some(a => a.mentions_hiss)) {
    renovationSignals.push({ type: 'Hissinstallation/-byte', urgency: 'unknown', basis: 'Nämnt i årsredovisning' });
  }

  // Building age lifecycle fallback signals
  if (renovationSignals.length === 0 && brf.building_year) {
    const age = currentYear - brf.building_year;
    if (age >= 40) {
      renovationSignals.push({
        type: 'Stambyte / VVS',
        urgency: '1_3yr',
        basis: `Byggår ${brf.building_year} — stammar normalt ${age} år gamla. Inga årsredovisningssignaler, baseras på livscykelmodell.`,
      });
    }
    if (age >= 25) {
      renovationSignals.push({
        type: 'Tak / fasad',
        urgency: '3_5yr',
        basis: `Byggår ${brf.building_year} — tak och fasad normalt ${age} år. Baseras på livscykelmodell.`,
      });
    }
  }

  // Structured data
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

  if (isRapport) {
    return (
      <RapportView
        brf={brf}
        arsredovisningar={arsredovisningar}
        energideklaration={energideklaration}
        gradeResult={gradeResult}
        renovationSignals={renovationSignals}
        chartData={chartData}
        latest={latest}
        jsonLd={jsonLd}
      />
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className="w-full px-6 md:px-12 pt-10 pb-10 md:pt-12 md:pb-12"
        style={{ backgroundColor: '#1A1A1A', color: '#F6F2EB' }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Nav row */}
          <div className="flex items-center justify-between mb-8">
            <a
              href="/"
              className="font-display text-display-sm font-normal tracking-tight transition-opacity hover:opacity-70"
              style={{ color: '#F6F2EB' }}
            >
              Sigvik
            </a>
            <div className="flex items-center gap-5">
              <a href="/" className="font-sans text-body-sm opacity-60 hover:opacity-100 transition-opacity" style={{ color: '#F6F2EB' }}>
                ← Sök
              </a>
              <ShareButton url={pageUrl} name={brf.name} />
              <a
                href={`${pageUrl}?view=rapport`}
                className="font-sans text-body-sm opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: '#F6F2EB' }}
              >
                PDF →
              </a>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav aria-label="Brödsmula" className="mb-6">
            <ol className="flex items-center gap-2 font-sans text-caption opacity-50">
              <li>Sigvik</li>
              {brf.municipality_name && <><li aria-hidden>·</li><li>{brf.municipality_name}</li></>}
              <li aria-hidden>·</li>
              <li className="opacity-100 truncate max-w-xs" style={{ color: '#F6F2EB' }}>{brf.name}</li>
            </ol>
          </nav>

          {/* BRF identity */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {brf.is_winding_up && (
                  <span className="font-sans text-overline uppercase px-2 py-0.5 border border-signal text-signal">
                    Under likvidation
                  </span>
                )}
                {brf.is_deregistered && (
                  <span className="font-sans text-overline uppercase px-2 py-0.5" style={{ border: '0.5px solid rgba(246,242,235,0.3)', color: 'rgba(246,242,235,0.5)' }}>
                    Avregistrerad
                  </span>
                )}
              </div>

              {gradeResult.grade && gradeResult.confidence !== 'insufficient' ? (
                <div className="flex items-start gap-4 mb-4">
                  <GradeChip grade={gradeResult.grade} size="xl" />
                  <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight" style={{ color: '#F6F2EB' }}>
                    {brf.name}
                  </h1>
                </div>
              ) : (
                <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight mb-4" style={{ color: '#F6F2EB' }}>
                  {brf.name}
                </h1>
              )}

              {(brf.street || brf.city) && (
                <p className="font-sans text-body-sm mb-2" style={{ color: 'rgba(246,242,235,0.7)' }}>
                  {[brf.street, brf.postal_code, brf.city].filter(Boolean).join(' · ')}
                </p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 font-sans text-caption" style={{ color: 'rgba(246,242,235,0.5)' }}>
                {brf.building_year && <span>Byggår {brf.building_year}</span>}
                {brf.num_apartments && <span>{numFmt(brf.num_apartments)} lägenheter</span>}
                {energideklaration?.energiklass && <span>Energiklass {energideklaration.energiklass}</span>}
              </div>
            </div>

            {/* Grade label (desktop) */}
            {gradeResult.grade && (
              <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
                <span className="font-sans text-body-sm opacity-60">{GRADE_LABELS[gradeResult.grade]}</span>
                <span className="font-sans text-caption opacity-40">{CONFIDENCE_LABELS[gradeResult.confidence]}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14 space-y-14 md:space-y-20">

        {/* ── HEALTH SCORE ─────────────────────────────────────────── */}
        <section aria-label="Ekonomisk hälsa">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-5">Ekonomisk hälsa</span>
          <div className="border border-rule p-6 md:p-8" style={{ backgroundColor: 'var(--surface-card)' }}>

            {gradeResult.confidence === 'insufficient' ? (
              <UncertaintyNote>
                Otillräcklig data — ekonomisk hälsa kan inte beräknas för denna förening.
                Årsredovisningar kan saknas eller ha låg parsningskvalitet.
                Kontrollera direkt hos Bolagsverket.
              </UncertaintyNote>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-5">
                  <GradeChip grade={gradeResult.grade} size="lg" />
                  <span className="font-display text-display-sm text-ink">
                    {gradeResult.grade ? GRADE_LABELS[gradeResult.grade] : '—'}
                  </span>
                </div>

                <ScoreBar score={gradeResult.score} grade={gradeResult.grade} className="mb-3" />

                <div className="flex items-center justify-between">
                  <p className="font-sans text-caption text-ink-muted">
                    Baserat på {gradeResult.signalCount} datapunkter · {CONFIDENCE_LABELS[gradeResult.confidence]}
                  </p>
                  <a href="/methodology" className="font-sans text-caption text-ink-muted hover:text-ink underline underline-offset-2 decoration-1 transition-colors">
                    Metodiken →
                  </a>
                </div>

                {gradeResult.confidence === 'low' && (
                  <div className="mt-4">
                    <UncertaintyNote>
                      Låg säkerhet — betyget baseras på färre än tre datapunkter. Verifiera
                      mot föreningens senaste årsredovisning innan köpbeslut.
                    </UncertaintyNote>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── KEY METRICS 2×2 ──────────────────────────────────────── */}
        {latest && (
          <section aria-label="Nyckeltal">
            <span className="font-sans text-overline text-ink-muted uppercase block mb-5">Nyckeltal</span>
            <div className="grid grid-cols-2 gap-5 md:gap-8">

              <div className="border border-rule p-5 md:p-6">
                <DataPoint
                  label="Avgift per kvm"
                  value={latest.avgift_per_sqm != null ? `${numFmt(Math.round(latest.avgift_per_sqm))} kr/kvm/mån` : null}
                  source="Bolagsverket"
                  sourceYear={latest.fiscal_year}
                  sub={<TrendArrow pct={latest.avgift_change_pct} yearRange={`${latest.fiscal_year - 1}–${latest.fiscal_year}`} />}
                  missing={latest.avgift_per_sqm == null}
                  missingNote="Avgiftsuppgift saknas i senaste årsredovisning."
                />
              </div>

              <div className="border border-rule p-5 md:p-6">
                <DataPoint
                  label="Skuld per lägenhet"
                  value={latest.total_lan != null && brf.num_apartments
                    ? `${numFmt(Math.round(latest.total_lan / brf.num_apartments))} kr`
                    : null
                  }
                  source="Bolagsverket"
                  sourceYear={latest.fiscal_year}
                  missing={latest.total_lan == null || !brf.num_apartments}
                  missingNote="Låneuppgift saknas."
                />
              </div>

              <div className="border border-rule p-5 md:p-6">
                <DataPoint
                  label="Underhållsfond / lgh"
                  value={latest.underhallsfond != null && brf.num_apartments
                    ? `${numFmt(Math.round(latest.underhallsfond / brf.num_apartments))} kr`
                    : null
                  }
                  source="Bolagsverket"
                  sourceYear={latest.fiscal_year}
                  missing={latest.underhallsfond == null}
                  missingNote="Underhållsfond saknas i årsredovisning."
                />
              </div>

              <div className="border border-rule p-5 md:p-6">
                <DataPoint
                  label="Energiklass"
                  value={energideklaration?.energiklass ?? null}
                  source={energideklaration ? 'Boverket' : undefined}
                  sourceYear={energideklaration?.utford?.slice(0, 4)}
                  sub={energideklaration?.eu_deadline_pressure
                    ? <span className="font-sans text-caption" style={{ color: 'var(--grade-d)' }}>EU-krav 2033</span>
                    : undefined
                  }
                  missing={!energideklaration?.energiklass}
                  missingNote="Energideklaration saknas eller är inte inläst."
                />
              </div>
            </div>
          </section>
        )}

        {/* ── AVGIFT TREND ─────────────────────────────────────────── */}
        <section aria-label="Avgiftsutveckling">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-5">Avgiftsutveckling</span>

          {chartData.length < 2 ? (
            <UncertaintyNote>
              Historik saknas — avgiftstrend kan inte beräknas. Sigvik har färre än
              två årsredovisningar inlästa för denna förening.
            </UncertaintyNote>
          ) : (
            <>
              <AvgiftChart data={chartData} />
              <p className="font-sans text-body-sm text-ink-soft mt-4 leading-relaxed">
                {latestTrend != null && latestTrend > 5
                  ? `Avgiften steg med ${latestTrend.toFixed(1)} % det senaste redovisningsåret.`
                  : latestTrend != null && latestTrend < -2
                  ? `Avgiften sänktes med ${Math.abs(latestTrend).toFixed(1)} % det senaste redovisningsåret.`
                  : 'Avgiften har legat stabil det senaste redovisningsåret.'
                }
                {' '}<SourceBadge source="Bolagsverket" year={latest?.fiscal_year} />
              </p>
            </>
          )}
        </section>

        {/* ── UNDERHÅLLSSIGNALER ───────────────────────────────────── */}
        <section aria-label="Underhållssignaler">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-5">Underhållssignaler</span>

          {renovationSignals.length === 0 ? (
            <UncertaintyNote>
              Inga underhållssignaler identifierade i tillgängliga årsredovisningar.
              Det innebär inte att föreningen saknar underhållsbehov — data kan vara
              ofullständig. Se&nbsp;
              <a href="/methodology" className="underline">vår metodik</a>.
            </UncertaintyNote>
          ) : (
            <>
              <div className="border border-rule divide-y divide-rule-soft" style={{ backgroundColor: 'var(--surface-card)' }}>
                {renovationSignals.map((s, i) => (
                  <div key={i} className="px-5">
                    <SignalRow type={s.type} urgency={s.urgency} basis={s.basis} />
                  </div>
                ))}
              </div>
              <p className="font-sans text-caption text-ink-muted mt-3 leading-relaxed">
                Signaler baseras på årsredovisningsdata och byggnadsålder. Verifiera mot
                föreningens underhållsplan.{' '}
                <a href="/methodology" className="underline hover:text-ink transition-colors">Läs om metoden →</a>
              </p>
            </>
          )}
        </section>

        {/* ── PERSONA BLOCKS ───────────────────────────────────────── */}
        {persona !== 'contractor' && (
          <AgentBlock brf={brf} arsredovisningar={arsredovisningar} energideklaration={energideklaration} pageUrl={pageUrl} />
        )}

        {(persona === 'contractor' || persona === 'buyer') && (
          <ContractorBlock brf={brf} arsredovisningar={arsredovisningar} />
        )}

        {/* ── DATA SOURCES ─────────────────────────────────────────── */}
        <DataSourcesBlock brf={brf} energideklaration={energideklaration} />

        {/* ── DATA COMPLETENESS (legacy) ───────────────────────────── */}
        <section aria-label="Datakvalitet" className="border-t border-rule pt-8">
          <span className="font-sans text-overline text-ink-muted uppercase block mb-4">Tillgängliga datasignaler</span>
          <DataCompletenessBar brf={{
            is_active_scb: brf.is_active_scb,
            is_deregistered: brf.is_deregistered,
            is_winding_up: brf.is_winding_up,
            docs_fetched: brf.num_arsredovisningar_ingested,
            building_year: brf.building_year,
            energy_class: energideklaration?.energiklass ?? null,
          }} />
        </section>

        {/* ── CTAs ─────────────────────────────────────────────────── */}
        <section className="border-t border-rule pt-8 space-y-4">
          <a
            href={`mailto:hej@sigvik.com?subject=Köparrapport — ${brf.name}`}
            className="flex items-center justify-between w-full px-6 py-4 font-sans text-body-sm text-paper transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#8B2E2E' }}
          >
            <span>Ladda ner köparrapport (PDF)</span>
            <span className="opacity-70">49 kr · gratis för mäklare →</span>
          </a>
          <div
            className="flex items-center justify-between w-full px-6 py-4 border border-rule font-sans text-body-sm text-ink-soft"
            style={{ backgroundColor: 'var(--surface-card)' }}
          >
            <span>Dela med köpare</span>
            <ShareButton url={pageUrl} name={brf.name} />
          </div>
          <a
            href={`/leverantorer?brf=${brf.orgnr}`}
            className="block font-sans text-body-sm text-ink-muted hover:text-ink underline underline-offset-4 decoration-1 transition-colors text-center py-2"
          >
            Bevaka underhållssignaler för den här föreningen →
          </a>
        </section>

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <div className="border-t border-rule pt-8">
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

// ── Agent block ───────────────────────────────────────────────────────────────

function AgentBlock({
  brf, arsredovisningar, energideklaration, pageUrl,
}: {
  brf: BRF;
  arsredovisningar: ArsRecord[];
  energideklaration: Energideklaration | null;
  pageUrl: string;
}) {
  const latest = arsredovisningar[arsredovisningar.length - 1];
  return (
    <section aria-label="För mäklare" className="border-t border-rule pt-8">
      <span className="font-sans text-overline text-ink-muted uppercase block mb-5">För mäklare</span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="border border-rule p-5" style={{ backgroundColor: 'var(--surface-card)' }}>
            <span className="font-sans text-overline text-ink-muted uppercase block mb-3">Dela med köpare</span>
            <p className="font-sans text-body-sm text-ink-soft leading-relaxed mb-4">
              Kopiera länken nedan och skicka till din köpare.
            </p>
            <ShareButton url={pageUrl} name={brf.name} />
          </div>
          <div className="border border-rule-soft p-5">
            <span className="font-sans text-overline text-ink-muted uppercase block mb-2">Köparrapport PDF</span>
            <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
              PDF-export med Sigvik-logotyp och källhänvisningar.
            </p>
            <a
              href={`${pageUrl}?view=rapport`}
              target="_blank"
              rel="noopener"
              className="font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1 mt-3 inline-block"
            >
              Förhandsgranska rapport →
            </a>
          </div>
        </div>
        <div>
          <span className="font-sans text-overline text-ink-muted uppercase block mb-4">Snabbfakta för visning</span>
          <dl className="space-y-0">
            {brf.building_year && <QuickFact label="Byggår" value={String(brf.building_year)} />}
            {brf.num_apartments && <QuickFact label="Lägenheter" value={numFmt(brf.num_apartments)} />}
            {energideklaration?.energiklass && <QuickFact label="Energiklass" value={energideklaration.energiklass} />}
            {latest?.avgift_change_pct != null && (
              <QuickFact
                label="Avgiftsändring senaste år"
                value={`${latest.avgift_change_pct > 0 ? '+' : ''}${latest.avgift_change_pct.toFixed(1)} %`}
              />
            )}
            <QuickFact label="Årsredovisningar inlästa" value={String(brf.num_arsredovisningar_ingested)} />
            {brf.last_ingested_at && <QuickFact label="Senast uppdaterat" value={dateFmt(brf.last_ingested_at)} />}
          </dl>
        </div>
      </div>
    </section>
  );
}

// ── Contractor block ──────────────────────────────────────────────────────────

function ContractorBlock({ brf, arsredovisningar }: { brf: BRF; arsredovisningar: ArsRecord[] }) {
  const buildingAge = brf.building_year ? new Date().getFullYear() - brf.building_year : null;
  return (
    <section aria-label="För leverantörer" className="border-t border-rule pt-8">
      <span className="font-sans text-overline text-ink-muted uppercase block mb-5">För leverantörer</span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <span className="font-sans text-overline text-ink-muted uppercase block mb-4">Fastighetsdata</span>
          <dl className="space-y-0">
            {brf.building_year && (
              <QuickFact
                label="Byggår"
                value={`${brf.building_year}${buildingAge != null ? ` (${buildingAge} år)` : ''}`}
              />
            )}
            {brf.num_apartments && <QuickFact label="Lägenheter" value={numFmt(brf.num_apartments)} />}
            {brf.fastighetsbeteckning && <QuickFact label="Fastighetsbeteckning" value={brf.fastighetsbeteckning} />}
            {brf.municipality_name && <QuickFact label="Kommun" value={brf.municipality_name} />}
          </dl>
        </div>
        <div>
          <div className="border border-rule-soft p-4">
            <p className="font-sans text-body-sm text-ink-muted leading-relaxed">
              Styrelsekontakt: Bolagsverkets offentliga register innehåller styrelseuppgifter.
              Sigvik lagrar inte personuppgifter om styrelseledamöter.{' '}
              <a
                href="https://www.bolagsverket.se/foretag/sok/foretagsinformation.html"
                target="_blank" rel="noopener noreferrer"
                className="text-ink hover:text-accent underline underline-offset-4 decoration-1"
              >
                Sök på Bolagsverket →
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Data sources collapsible ──────────────────────────────────────────────────

function DataSourcesBlock({
  brf,
  energideklaration,
}: {
  brf: BRF;
  energideklaration: Energideklaration | null;
}) {
  return (
    <section aria-label="Datakällor" className="border-t border-rule pt-8">
      <details open={false}>
        <summary className="cursor-pointer list-none flex items-center justify-between select-none">
          <span className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
            Datakällor och aktualitet
          </span>
          <span className="font-sans text-caption text-ink-muted">▾</span>
        </summary>
        <div className="mt-4 space-y-0">
          <SourceRow source="Bolagsverket" note="Årsredovisningar, registreringsdata" date={brf.last_ingested_at} completeness={brf.num_arsredovisningar_ingested > 0 ? 'Inläst' : 'Ej inläst'} />
          <SourceRow source="Boverket" note="Energideklarationer" date={energideklaration?.utford ?? null} completeness={energideklaration ? 'Inläst' : 'Saknas'} />
          <SourceRow source="Skatteverket" note="Restanslängden" date={null} completeness="Löpande" />
        </div>
        <p className="font-sans text-caption text-ink-muted mt-4 leading-relaxed">
          Sigvik sammanställer offentliga myndighetstdata. Vi skapar inte ny information.{' '}
          <a href="/methodology" className="underline hover:text-ink transition-colors">Fullständig källförteckning →</a>
        </p>
      </details>
    </section>
  );
}

// ── Rapport view (print / PDF) ────────────────────────────────────────────────

function RapportView({
  brf, arsredovisningar, energideklaration, gradeResult, renovationSignals, chartData, latest, jsonLd,
}: {
  brf: BRF;
  arsredovisningar: ArsRecord[];
  energideklaration: Energideklaration | null;
  gradeResult: GradeResult;
  renovationSignals: { type: string; urgency: string; basis: string }[];
  chartData: { year: number; avgift: number }[];
  latest: ArsRecord | null;
  jsonLd: object;
}) {
  const today = new Date().toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <main
      className="min-h-screen"
      style={{ background: '#fff', maxWidth: 740, margin: '0 auto', padding: '48px 40px', fontFamily: 'var(--font-sans)' }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`@media print { button, a[href*="mailto"] { display: none !important; } }`}</style>

      {/* 1. Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-rule">
        <span className="font-display text-display-sm tracking-tight text-ink">Sigvik</span>
        <span className="font-sans text-caption text-ink-muted">Genererad {today}</span>
      </div>

      {/* 2. BRF identity */}
      <div className="mb-8">
        <h1 className="font-display text-display-md tracking-tight text-ink mb-2">{brf.name}</h1>
        <p className="font-sans text-body-sm text-ink-soft">
          {[brf.street, brf.postal_code, brf.city].filter(Boolean).join(' · ')}
        </p>
        <p className="font-mono text-caption text-ink-muted mt-1">Org.nr {brf.orgnr}</p>
      </div>

      {/* 3. Grade + score bar */}
      {gradeResult.grade && gradeResult.confidence !== 'insufficient' && (
        <div className="mb-8 p-5 border border-rule">
          <div className="flex items-center gap-3 mb-3">
            <GradeChip grade={gradeResult.grade} size="lg" />
            <span className="font-display text-display-sm text-ink">{GRADE_LABELS[gradeResult.grade]}</span>
          </div>
          <ScoreBar score={gradeResult.score} grade={gradeResult.grade} className="mb-2" />
          <p className="font-sans text-caption text-ink-muted">{CONFIDENCE_LABELS[gradeResult.confidence]}</p>
        </div>
      )}

      {/* 4. Key metrics */}
      {latest && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {latest.avgift_per_sqm != null && (
            <div className="p-4 border border-rule">
              <p className="font-sans text-caption text-ink-muted mb-1">Avgift per kvm</p>
              <p className="font-sans text-body text-ink">{numFmt(Math.round(latest.avgift_per_sqm))} kr/kvm/mån</p>
            </div>
          )}
          {latest.total_lan != null && brf.num_apartments && (
            <div className="p-4 border border-rule">
              <p className="font-sans text-caption text-ink-muted mb-1">Skuld per lägenhet</p>
              <p className="font-sans text-body text-ink">{numFmt(Math.round(latest.total_lan / brf.num_apartments))} kr</p>
            </div>
          )}
          {latest.underhallsfond != null && brf.num_apartments && (
            <div className="p-4 border border-rule">
              <p className="font-sans text-caption text-ink-muted mb-1">Underhållsfond / lgh</p>
              <p className="font-sans text-body text-ink">{numFmt(Math.round(latest.underhallsfond / brf.num_apartments))} kr</p>
            </div>
          )}
          {energideklaration?.energiklass && (
            <div className="p-4 border border-rule">
              <p className="font-sans text-caption text-ink-muted mb-1">Energiklass</p>
              <p className="font-sans text-body text-ink">{energideklaration.energiklass}</p>
            </div>
          )}
        </div>
      )}

      {/* 5. Chart */}
      {chartData.length >= 2 && (
        <div className="mb-8">
          <p className="font-sans text-overline text-ink-muted uppercase mb-3">Avgiftsutveckling</p>
          <AvgiftChart data={chartData} />
        </div>
      )}

      {/* 6. Renovation signals */}
      {renovationSignals.length > 0 && (
        <div className="mb-8">
          <p className="font-sans text-overline text-ink-muted uppercase mb-3">Underhållssignaler</p>
          <div className="border border-rule divide-y divide-rule-soft">
            {renovationSignals.map((s, i) => (
              <div key={i} className="px-4 py-3">
                <p className="font-sans text-body-sm text-ink">{s.type}</p>
                <p className="font-sans text-caption text-ink-muted mt-0.5">{s.basis}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Sources */}
      <div className="mb-8 pt-6 border-t border-rule">
        <p className="font-sans text-overline text-ink-muted uppercase mb-3">Datakällor</p>
        <table className="w-full font-sans text-body-sm" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr className="border-b border-rule-soft">
              <td className="py-2 text-ink-muted pr-8">Bolagsverket</td>
              <td className="py-2 text-ink">Årsredovisningar</td>
              <td className="py-2 text-ink-muted text-right">{brf.last_ingested_at?.slice(0, 10) ?? '—'}</td>
            </tr>
            <tr className="border-b border-rule-soft">
              <td className="py-2 text-ink-muted pr-8">Boverket</td>
              <td className="py-2 text-ink">Energideklarationer</td>
              <td className="py-2 text-ink-muted text-right">{energideklaration?.utford?.slice(0, 10) ?? '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 8. Disclaimer */}
      <div className="pt-6 border-t border-rule">
        <p className="font-sans text-caption text-ink-muted leading-relaxed">
          Sammanställning baserad på offentliga register. Verifiera mot föreningens senaste
          årsredovisning innan köpbeslut. Sigvik AB ansvarar inte för beslut fattade på
          basis av informationen på denna sida.
        </p>
      </div>

      {/* 9. Footer */}
      <div className="mt-8 pt-4 border-t border-rule flex justify-between">
        <span className="font-sans text-caption text-ink-muted">sigvik.com</span>
        <span className="font-mono text-caption text-ink-muted">{brf.orgnr}</span>
        <span className="font-sans text-caption text-ink-muted">Genererad {today}</span>
      </div>
    </main>
  );
}

// ── Shared small components ───────────────────────────────────────────────────

function QuickFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-rule-soft">
      <dt className="font-sans text-body-sm text-ink-muted">{label}</dt>
      <dd className="font-sans text-body-sm text-ink">{value}</dd>
    </div>
  );
}

function SourceRow({
  source, note, date, completeness,
}: {
  source: string; note: string; date: string | null; completeness: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-rule-soft">
      <span className="font-sans text-body-sm text-ink w-32 flex-shrink-0">{source}</span>
      <span className="font-sans text-caption text-ink-muted flex-1">{note}</span>
      <span className="font-mono text-caption text-ink-muted">{date?.slice(0, 10) ?? '—'}</span>
      <span className="font-sans text-caption text-ink-muted">{completeness}</span>
    </div>
  );
}
