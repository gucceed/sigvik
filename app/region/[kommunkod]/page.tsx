import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrfCard } from '../../components/SearchBar';

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

type Municipality = { kommunkod: string; name: string; county: string };

type BrfRow = {
  orgnr: string;
  name: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  registration_year: number | null;
  intent_score: number | null;
  intent_score_confidence: number | null;
  municipality_name: string | null;
  kommunkod: string | null;
  num_arsredovisningar_ingested?: number;
};

async function getMunicipality(kommunkod: string): Promise<Municipality | null> {
  try {
    const res = await fetch(`${API_URL}/api/municipalities`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const list: Municipality[] = await res.json();
    return list.find((m) => m.kommunkod === kommunkod) ?? null;
  } catch {
    return null;
  }
}

async function getBrfs(kommunkod: string): Promise<{ brfs: BrfRow[]; total: number }> {
  try {
    const res = await fetch(
      `${API_URL}/api/brfs?municipality=${kommunkod}&limit=50&order_by=intent_score`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return { brfs: [], total: 0 };
    const data = await res.json();
    return { brfs: data.brfs ?? [], total: data.total ?? 0 };
  } catch {
    return { brfs: [], total: 0 };
  }
}

type CoverageLevel = 'established' | 'building' | 'new';

function coverageLevel(brfs: BrfRow[]): CoverageLevel {
  if (brfs.length === 0) return 'new';
  const withDocs = brfs.filter((b) => (b.num_arsredovisningar_ingested ?? 0) > 0).length;
  const pct = withDocs / brfs.length;
  if (pct > 0.5) return 'established';
  if (pct > 0.1) return 'building';
  return 'new';
}

const COVERAGE_LABELS: Record<CoverageLevel, { sv: string; note: string }> = {
  established: { sv: 'Etablerad täckning', note: 'Årsredovisningar inlästa för majoriteten av föreningarna.' },
  building:    { sv: 'Växande täckning', note: 'Årsredovisningar ingesas löpande — fler signaler tillkommer.' },
  new:         { sv: 'Ny täckning', note: 'Registreringsdata komplett. Årsredovisningar ingesas löpande.' },
};

export async function generateMetadata({
  params,
}: {
  params: { kommunkod: string };
}): Promise<Metadata> {
  const mun = await getMunicipality(params.kommunkod);
  if (!mun) return { title: 'Kommun — Sigvik' };
  return {
    title: `Bostadsrättsföreningar i ${mun.name} — Sigvik`,
    description: `Alla bostadsrättsföreningar i ${mun.name}, ${mun.county}. Ekonomi, avgiftstrend och underhållsrisk — direkt från Bolagsverket.`,
  };
}

export default async function RegionPage({
  params,
}: {
  params: { kommunkod: string };
}) {
  const [mun, { brfs, total }] = await Promise.all([
    getMunicipality(params.kommunkod),
    getBrfs(params.kommunkod),
  ]);

  if (!mun) notFound();

  // Suppress regions with <20 scored BRFs from surfacing as full listings
  const scoredCount = brfs.filter((b) => b.intent_score != null).length;
  const isSparse = total < 20 || scoredCount < 5;

  const coverage = coverageLevel(brfs);
  const coverageInfo = COVERAGE_LABELS[coverage];

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 pb-6 border-b border-rule">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors"
          >
            Sigvik
          </a>
          <a href="/search" className="font-sans text-body-sm text-ink-soft hover:text-ink transition-colors">
            ← Alla kommuner
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">

        {/* Region identity */}
        <div className="mb-10 md:mb-14">
          <div className="flex flex-wrap items-baseline gap-4 mb-3">
            <nav aria-label="Brödsmula" className="font-sans text-caption text-ink-muted">
              <a href="/search" className="hover:text-ink transition-colors">Sverige</a>
              <span className="mx-2">·</span>
              <span>{mun.county}</span>
              <span className="mx-2">·</span>
              <span className="text-ink">{mun.name}</span>
            </nav>
          </div>

          <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight text-ink mb-2">
            {mun.name}
          </h1>
          <p className="font-sans text-body-sm text-ink-muted mb-6">{mun.county}</p>

          {/* Coverage badge */}
          <div className="inline-flex items-center gap-3 border border-rule px-4 py-2 mb-2">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                coverage === 'established' ? 'bg-sage'
                : coverage === 'building' ? 'bg-amber'
                : 'bg-ink-muted'
              }`}
              aria-hidden
            />
            <span className="font-sans text-caption text-ink">{coverageInfo.sv}</span>
          </div>
          <p className="font-sans text-caption text-ink-muted max-w-prose">{coverageInfo.note}</p>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-8 mb-10 border-t border-b border-rule py-5">
          <div>
            <div className="font-display text-display-sm text-ink">{total.toLocaleString('sv-SE')}</div>
            <div className="font-sans text-caption text-ink-muted">registrerade föreningar</div>
          </div>
          <div>
            <div className="font-display text-display-sm text-ink">{scoredCount.toLocaleString('sv-SE')}</div>
            <div className="font-sans text-caption text-ink-muted">med beräknad signal</div>
          </div>
          <div>
            <div className="font-display text-display-sm text-ink">
              {brfs.filter((b) => (b.num_arsredovisningar_ingested ?? 0) > 0).length.toLocaleString('sv-SE')}
            </div>
            <div className="font-sans text-caption text-ink-muted">med årsredovisningar</div>
          </div>
          <div>
            <div className="font-sans text-body-sm text-ink-muted uppercase font-mono">{params.kommunkod}</div>
            <div className="font-sans text-caption text-ink-muted">kommunkod</div>
          </div>
        </div>

        {/* Sparse data notice */}
        {isSparse && (
          <div className="border border-rule-soft p-5 mb-8 max-w-prose">
            <p className="font-sans text-body-sm text-ink-soft leading-relaxed">
              {mun.name} är en av de nyaste kommunerna i Sigviks täckning.
              Data ingesas löpande — fler signaler tillkommer de närmaste dagarna.
            </p>
          </div>
        )}

        {/* BRF list */}
        {brfs.length > 0 ? (
          <div>
            <h2 className="font-sans text-overline text-ink-muted uppercase mb-5">
              Föreningar i {mun.name}
              {total > brfs.length && (
                <span className="ml-2 normal-case">
                  — visar {brfs.length} av {total.toLocaleString('sv-SE')}
                </span>
              )}
            </h2>
            <div className="space-y-3 mb-6">
              {brfs.map((b) => (
                <BrfCard key={b.orgnr} brf={b} />
              ))}
            </div>
            {total > brfs.length && (
              <a
                href={`/search?municipality=${params.kommunkod}`}
                className="font-sans text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
              >
                Visa alla {total.toLocaleString('sv-SE')} föreningar i {mun.name} →
              </a>
            )}
          </div>
        ) : (
          <p className="font-sans text-body text-ink-muted">
            Inga föreningar hittades i {mun.name}.
          </p>
        )}
      </div>
    </main>
  );
}
