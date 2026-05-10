'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
  building_year: number | null;
  intent_score: number | null;
  intent_score_confidence: number | null;
  municipality_name: string | null;
  kommunkod: string | null;
  num_arsredovisningar_ingested?: number;
};

type OrderBy = 'intent_score' | 'name' | 'updated';

type BuildingEra = 'pre1960' | '1960_1985' | '1986_2000' | '2001plus';

const BUILDING_ERAS: { value: BuildingEra; label: string; min: number; max: number }[] = [
  { value: 'pre1960',    label: 'Före 1960',    min: 1800, max: 1959 },
  { value: '1960_1985',  label: '1960–1985',    min: 1960, max: 1985 },
  { value: '1986_2000',  label: '1986–2000',    min: 1986, max: 2000 },
  { value: '2001plus',   label: '2001 och senare', min: 2001, max: 2050 },
];

const PAGE_SIZE = 50;

// Compact signal dot — intent_score as a visual indicator
function SignalDot({ score }: { score: number | null }) {
  if (score == null) return <span className="w-2 h-2 rounded-full bg-rule flex-shrink-0" aria-hidden />;
  const color = score >= 60 ? 'var(--grade-c)' : score >= 30 ? 'var(--grade-b)' : '#9A8F85';
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} aria-hidden />;
}

// Enriched search result card
function SearchCard({ brf, contractor }: { brf: BrfRow; contractor: boolean }) {
  const age = brf.building_year ? new Date().getFullYear() - brf.building_year : null;
  const signalLabel = brf.intent_score != null
    ? brf.intent_score >= 60 ? 'Stark signal'
    : brf.intent_score >= 30 ? 'Måttlig signal'
    : 'Tidig indikation'
    : null;

  return (
    <a
      href={`/brf/${brf.orgnr}${contractor ? '?persona=contractor' : ''}`}
      className="block border border-rule p-5 md:p-6 hover:border-ink transition-colors group"
      style={{ backgroundColor: 'var(--surface-card)' }}
    >
      <div className="flex items-start gap-3">
        {brf.intent_score != null && (
          <div className="flex-shrink-0 mt-1">
            <SignalDot score={brf.intent_score} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-display text-display-sm font-normal text-ink leading-tight group-hover:text-accent transition-colors">
              {brf.name}
            </h3>
            {brf.municipality_name && (
              <span className="font-sans text-caption text-ink-muted whitespace-nowrap shrink-0 mt-1">
                {brf.municipality_name}
              </span>
            )}
          </div>

          {(brf.street || brf.city) && (
            <p className="font-sans text-body-sm text-ink-soft mb-2">
              {[brf.street, brf.postal_code, brf.city].filter(Boolean).join(' · ')}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {signalLabel && (
              <span className="font-sans text-caption text-ink-soft">{signalLabel}</span>
            )}
            {brf.building_year && (
              <span className="font-sans text-caption text-ink-muted">
                Byggår {brf.building_year}{age != null ? ` (${age} år)` : ''}
              </span>
            )}
            <span className="font-mono text-caption text-ink-muted">{brf.orgnr}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ── Main page (wrapped in Suspense for useSearchParams) ───────────────────────

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchSkeleton() {
  return (
    <main className="min-h-screen">
      <header className="w-full px-6 md:px-12 pt-8 pb-6 border-b border-rule">
        <div className="max-w-7xl mx-auto">
          <a href="/" className="font-display text-display-sm font-normal tracking-tight text-ink">Sigvik</a>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-rule p-5 animate-pulse">
            <div className="h-5 bg-rule rounded w-2/3 mb-3" />
            <div className="h-3 bg-rule-soft rounded w-1/2" />
          </div>
        ))}
      </div>
    </main>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [results, setResults] = useState<BrfRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter state — initialised from URL params
  const [municipality, setMunicipality] = useState(searchParams.get('mun') ?? '');
  const [buildingEra, setBuildingEra] = useState<BuildingEra | ''>(
    (searchParams.get('era') as BuildingEra) ?? ''
  );
  const [orderBy, setOrderBy] = useState<OrderBy>(
    (searchParams.get('sort') as OrderBy) ?? 'intent_score'
  );
  const [textQuery, setTextQuery] = useState(searchParams.get('q') ?? '');
  const [contractorMode, setContractorMode] = useState(searchParams.get('mode') === 'contractor');

  // Sync filter state → URL (debounced to avoid thrashing)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const p = new URLSearchParams();
      if (municipality)    p.set('mun', municipality);
      if (buildingEra)     p.set('era', buildingEra);
      if (orderBy !== 'intent_score') p.set('sort', orderBy);
      if (textQuery.trim()) p.set('q', textQuery.trim());
      if (contractorMode)  p.set('mode', 'contractor');
      const qs = p.toString();
      router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
    }, 300);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipality, buildingEra, orderBy, textQuery, contractorMode]);

  // Pre-fetch municipalities
  useEffect(() => {
    fetch(`${API_URL}/api/municipalities`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Municipality[]) =>
        setMunicipalities(data.sort((a, b) => a.name.localeCompare(b.name, 'sv')))
      )
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(async (reset = false) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    try {
      if (textQuery.trim().length >= 2) {
        const url = `${API_URL}/api/brfs/search?q=${encodeURIComponent(textQuery.trim())}&limit=${PAGE_SIZE}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const rows: BrfRow[] = data.results ?? [];
        setResults(reset ? rows : prev => [...prev, ...rows]);
        setTotal(data.count ?? rows.length);
        if (reset) setOffset(rows.length);
      } else {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(currentOffset),
          order_by: orderBy,
        });
        if (municipality) params.set('municipality', municipality);

        if (buildingEra) {
          const era = BUILDING_ERAS.find(e => e.value === buildingEra);
          if (era) {
            params.set('min_building_year', String(era.min));
            params.set('max_building_year', String(era.max));
          }
        }

        const res = await fetch(`${API_URL}/api/brfs?${params}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const rows: BrfRow[] = data.brfs ?? [];
        setResults(reset ? rows : prev => [...prev, ...rows]);
        setTotal(data.total ?? 0);
        if (reset) setOffset(rows.length);
        else setOffset(prev => prev + rows.length);
      }
    } catch {
      if (reset) setResults([]);
    } finally {
      setLoading(false);
    }
  }, [municipality, buildingEra, orderBy, textQuery, offset]);

  // Fetch on filter change
  useEffect(() => {
    setOffset(0);
    fetchResults(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipality, buildingEra, orderBy, contractorMode]);

  function handleTextSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    fetchResults(true);
  }

  function clearFilters() {
    setMunicipality('');
    setBuildingEra('');
    setTextQuery('');
    setOrderBy('intent_score');
    setContractorMode(false);
  }

  function toggleContractorMode() {
    const next = !contractorMode;
    setContractorMode(next);
    if (next) {
      // Contractor mode: sort by building age (oldest first = highest urgency)
      setOrderBy('updated');
    }
  }

  const hasFilters = municipality || buildingEra || textQuery.trim() || contractorMode;
  const munName = municipalities.find(m => m.kommunkod === municipality)?.name;

  const filterPanel = (
    <div className="space-y-5">
      {/* Contractor mode toggle */}
      <div>
        <button
          onClick={toggleContractorMode}
          className={`w-full flex items-center justify-between px-4 py-3 border font-sans text-body-sm transition-colors ${
            contractorMode
              ? 'border-ink bg-ink text-paper'
              : 'border-rule hover:border-ink-soft text-ink-soft'
          }`}
        >
          <span>Underhållssignaler</span>
          <span className="font-sans text-caption opacity-60">Leverantörsläge</span>
        </button>
        {contractorMode && (
          <p className="font-sans text-caption text-ink-muted mt-1.5 leading-relaxed px-1">
            Visar föreningar sorterade efter byggår. Äldst = högst underhållsrisk.
          </p>
        )}
      </div>

      {/* Text search */}
      <form onSubmit={handleTextSearch}>
        <label htmlFor="search-text" className="font-sans text-overline text-ink-muted uppercase block mb-2">
          Fritext
        </label>
        <div className="flex gap-0">
          <input
            id="search-text"
            type="search"
            value={textQuery}
            onChange={e => setTextQuery(e.target.value)}
            placeholder="Namn, adress eller org.nr"
            className="flex-1 font-sans text-body-sm border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-ink transition-colors"
          />
          <button
            type="submit"
            className="font-sans text-overline uppercase border border-l-0 border-rule px-3 hover:bg-rule-soft transition-colors"
          >
            →
          </button>
        </div>
      </form>

      {/* Municipality */}
      <div>
        <label htmlFor="filter-mun" className="font-sans text-overline text-ink-muted uppercase block mb-2">
          Kommun
        </label>
        <select
          id="filter-mun"
          value={municipality}
          onChange={e => { setMunicipality(e.target.value); setTextQuery(''); }}
          className="w-full font-sans text-body-sm border border-rule bg-paper px-3 py-2 focus:outline-none focus:border-ink transition-colors"
        >
          <option value="">Alla 289 kommuner</option>
          {municipalities.map(m => (
            <option key={m.kommunkod} value={m.kommunkod}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Building era */}
      <div>
        <span className="font-sans text-overline text-ink-muted uppercase block mb-2">
          Byggår
        </span>
        <div className="space-y-1">
          {BUILDING_ERAS.map(era => (
            <button
              key={era.value}
              onClick={() => { setBuildingEra(buildingEra === era.value ? '' : era.value); setTextQuery(''); }}
              className={`w-full text-left font-sans text-body-sm px-3 py-2 border transition-colors ${
                buildingEra === era.value
                  ? 'border-ink bg-ink text-paper'
                  : 'border-rule hover:border-ink-soft text-ink'
              }`}
            >
              {era.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="filter-sort" className="font-sans text-overline text-ink-muted uppercase block mb-2">
          Sortering
        </label>
        <select
          id="filter-sort"
          value={orderBy}
          onChange={e => setOrderBy(e.target.value as OrderBy)}
          className="w-full font-sans text-body-sm border border-rule bg-paper px-3 py-2 focus:outline-none focus:border-ink transition-colors"
        >
          <option value="intent_score">Signalstyrka</option>
          <option value="name">Alfabetiskt (A–Ö)</option>
          <option value="updated">Nyast data</option>
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="font-sans text-body-sm text-ink-muted hover:text-ink underline underline-offset-4 decoration-1 transition-colors"
        >
          Rensa filter
        </button>
      )}

      {/* Persona hint */}
      <div className="border-t border-rule pt-5">
        <p className="font-sans text-caption text-ink-muted leading-relaxed">
          Söker du som mäklare?{' '}
          <a href="/maklare" className="text-ink hover:text-accent underline underline-offset-4 decoration-1">
            Mäklarvy →
          </a>
        </p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="w-full px-6 md:px-12 pt-8 pb-6 border-b border-rule sticky top-0 bg-paper z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors">
            Sigvik
          </a>
          <div className="flex items-center gap-4">
            <span className="font-sans text-overline text-ink-muted uppercase hidden md:inline">
              33 706 föreningar · 289 kommuner
            </span>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(v => !v)}
              className="md:hidden font-sans text-body-sm border border-rule px-3 py-1.5 hover:bg-rule-soft transition-colors"
              aria-expanded={mobileFilterOpen}
              aria-controls="mobile-filter-drawer"
            >
              {hasFilters ? 'Filter ·' : 'Filter'}
              {hasFilters && (
                <span className="ml-1 font-mono" style={{ color: 'var(--grade-c)' }}>
                  {[municipality, buildingEra, textQuery.trim(), contractorMode ? '1' : ''].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile filter drawer (bottom sheet) ──────────────────────────── */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" id="mobile-filter-drawer">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-paper border-t border-rule px-6 py-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-sans text-overline uppercase text-ink-muted">Filter</span>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="font-sans text-body-sm text-ink-muted hover:text-ink transition-colors"
              >
                Klar →
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">

          {/* ── Desktop sidebar ───────────────────────────────────────────── */}
          <aside aria-label="Filter" className="hidden md:block sticky top-[73px]">
            {filterPanel}
          </aside>

          {/* ── Results ──────────────────────────────────────────────────── */}
          <div>
            {/* Result header */}
            <div className="flex items-baseline justify-between mb-5">
              <p className="font-sans text-body-sm text-ink-muted">
                {loading && results.length === 0
                  ? 'Söker…'
                  : `${total.toLocaleString('sv-SE')} föreningar`}
                {munName && <span className="ml-2">· {munName}</span>}
                {contractorMode && (
                  <span className="ml-2 font-sans text-caption px-2 py-0.5" style={{ color: 'var(--grade-c)', border: '0.5px solid var(--grade-c)' }}>
                    Leverantörsläge
                  </span>
                )}
              </p>
            </div>

            {/* Skeleton */}
            {loading && results.length === 0 && (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-rule p-5 animate-pulse" style={{ backgroundColor: 'var(--surface-card)' }}>
                    <div className="h-5 bg-rule rounded w-2/3 mb-3" />
                    <div className="h-3 bg-rule-soft rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-3">
                {results.map(r => (
                  <SearchCard key={r.orgnr} brf={r} contractor={contractorMode} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && results.length === 0 && (
              <div className="border border-rule p-8 text-center">
                <p className="font-display text-display-sm text-ink mb-3">
                  Inga föreningar matchar dina filter.
                </p>
                <p className="font-sans text-body-sm text-ink-soft mb-5">
                  Prova att justera kommunen eller ta bort ett filter.
                </p>
                <button
                  onClick={clearFilters}
                  className="font-sans text-body-sm border border-rule px-4 py-2 hover:bg-rule-soft transition-colors"
                >
                  Rensa filter
                </button>
              </div>
            )}

            {/* Load more */}
            {results.length > 0 && results.length < total && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => fetchResults(false)}
                  disabled={loading}
                  className="font-sans text-body-sm text-ink border border-rule px-6 py-3 hover:bg-rule-soft transition-colors disabled:opacity-40"
                >
                  {loading
                    ? 'Laddar…'
                    : `Visa fler (${(total - results.length).toLocaleString('sv-SE')} kvar)`
                  }
                </button>
                <p className="font-sans text-caption text-ink-muted mt-2">
                  Visar {results.length.toLocaleString('sv-SE')} av {total.toLocaleString('sv-SE')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
