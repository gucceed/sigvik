'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrfCard, verdiktLabel } from '../components/SearchBar';

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

const SCORE_BANDS: { label: string; min: number; max: number }[] = [
  { label: 'Stark signal (≥ 60)', min: 60, max: 100 },
  { label: 'Stabil (35–59)', min: 35, max: 59 },
  { label: 'Bevakad (10–34)', min: 10, max: 34 },
  { label: 'Tidig indikation (< 10)', min: 0, max: 9 },
];

const PAGE_SIZE = 50;

export default function SearchPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [results, setResults] = useState<BrfRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);

  // Filters
  const [municipality, setMunicipality] = useState('');
  const [scoreBandIdx, setScoreBandIdx] = useState<number | null>(null);
  const [orderBy, setOrderBy] = useState<OrderBy>('intent_score');
  const [textQuery, setTextQuery] = useState('');

  // Pre-fetch municipalities once
  useEffect(() => {
    fetch(`${API_URL}/api/municipalities`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Municipality[]) => {
        // Only show municipalities with meaningful data (sort by name)
        setMunicipalities(data.sort((a, b) => a.name.localeCompare(b.name, 'sv')));
      })
      .catch(() => {});
  }, []);

  const fetchResults = useCallback(
    async (reset = false) => {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;

      try {
        let url: string;

        if (textQuery.trim().length >= 2) {
          // Text search path
          url = `${API_URL}/api/brfs/search?q=${encodeURIComponent(textQuery.trim())}&limit=${PAGE_SIZE}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error();
          const data = await res.json();
          const newResults: BrfRow[] = data.results ?? [];
          setResults(reset ? newResults : (prev) => [...prev, ...newResults]);
          setTotal(data.count ?? newResults.length);
          if (reset) setOffset(newResults.length);
        } else {
          // Filter path
          const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(currentOffset),
            order_by: orderBy,
          });
          if (municipality) params.set('municipality', municipality);
          if (scoreBandIdx !== null) {
            const band = SCORE_BANDS[scoreBandIdx];
            params.set('min_score', String(band.min));
            params.set('max_score', String(band.max));
          }
          const res = await fetch(`${API_URL}/api/brfs?${params}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          const newResults: BrfRow[] = data.brfs ?? [];
          setResults(reset ? newResults : (prev) => [...prev, ...newResults]);
          setTotal(data.total ?? 0);
          if (reset) setOffset(newResults.length);
          else setOffset((prev) => prev + newResults.length);
        }
      } catch {
        if (reset) setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [municipality, scoreBandIdx, orderBy, textQuery, offset],
  );

  // Initial load and filter changes
  useEffect(() => {
    setOffset(0);
    fetchResults(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipality, scoreBandIdx, orderBy]);

  function handleTextSearch(e: React.FormEvent) {
    e.preventDefault();
    setOffset(0);
    setMunicipality('');
    setScoreBandIdx(null);
    fetchResults(true);
  }

  function clearFilters() {
    setMunicipality('');
    setScoreBandIdx(null);
    setTextQuery('');
    setOrderBy('intent_score');
  }

  const hasFilters = municipality || scoreBandIdx !== null || textQuery.trim();

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
          <span className="font-sans text-overline text-ink-muted uppercase hidden md:inline">
            Sök bland {municipalities.length > 0 ? '33 706' : '…'} föreningar
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">

          {/* ── Filter sidebar ─────────────────────────────────────────────── */}
          <aside aria-label="Filter">
            {/* Text search */}
            <form onSubmit={handleTextSearch} className="mb-6">
              <label htmlFor="search-text" className="font-sans text-caption text-ink-muted uppercase tracking-widest block mb-2">
                Sök
              </label>
              <div className="flex gap-2">
                <input
                  id="search-text"
                  type="search"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="Namn eller org.nr"
                  className="flex-1 font-sans text-body-sm border border-rule bg-transparent px-3 py-2 focus:outline-none focus:border-ink transition-colors"
                />
                <button
                  type="submit"
                  className="font-sans text-caption uppercase border border-rule px-3 py-2 hover:bg-rule-soft transition-colors"
                >
                  Sök
                </button>
              </div>
            </form>

            <div className="space-y-5">
              {/* Municipality */}
              <div>
                <label htmlFor="filter-mun" className="font-sans text-caption text-ink-muted uppercase tracking-widest block mb-2">
                  Kommun
                </label>
                <select
                  id="filter-mun"
                  value={municipality}
                  onChange={(e) => { setMunicipality(e.target.value); setTextQuery(''); }}
                  className="w-full font-sans text-body-sm border border-rule bg-paper px-3 py-2 focus:outline-none focus:border-ink transition-colors appearance-none"
                >
                  <option value="">Alla kommuner</option>
                  {municipalities.map((m) => (
                    <option key={m.kommunkod} value={m.kommunkod}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Score band */}
              <div>
                <span className="font-sans text-caption text-ink-muted uppercase tracking-widest block mb-2">
                  Signalstyrka
                </span>
                <div className="space-y-1">
                  {SCORE_BANDS.map((band, i) => (
                    <button
                      key={i}
                      onClick={() => { setScoreBandIdx(scoreBandIdx === i ? null : i); setTextQuery(''); }}
                      className={`w-full text-left font-sans text-body-sm px-3 py-2 border transition-colors ${
                        scoreBandIdx === i
                          ? 'border-ink bg-ink text-paper'
                          : 'border-rule hover:border-ink-soft'
                      }`}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="filter-sort" className="font-sans text-caption text-ink-muted uppercase tracking-widest block mb-2">
                  Sortering
                </label>
                <select
                  id="filter-sort"
                  value={orderBy}
                  onChange={(e) => setOrderBy(e.target.value as OrderBy)}
                  className="w-full font-sans text-body-sm border border-rule bg-paper px-3 py-2 focus:outline-none focus:border-ink transition-colors appearance-none"
                >
                  <option value="intent_score">Signalstyrka</option>
                  <option value="name">Namn (A–Ö)</option>
                  <option value="updated">Senast uppdaterad</option>
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="font-sans text-body-sm text-ink-muted hover:text-ink underline underline-offset-4 decoration-1"
                >
                  Rensa filter
                </button>
              )}
            </div>

            {/* Contractor CTA */}
            <div className="mt-8 border-t border-rule pt-6">
              <p className="font-sans text-caption text-ink-muted leading-relaxed">
                Letar du som leverantör? Se{' '}
                <a href="/contractor" className="text-ink hover:text-accent underline underline-offset-4 decoration-1">
                  leverantörsläget
                </a>{' '}
                för förvalda filter.
              </p>
            </div>
          </aside>

          {/* ── Results ────────────────────────────────────────────────────── */}
          <div>
            {/* Result count */}
            <div className="flex items-baseline justify-between mb-5">
              <p className="font-sans text-body-sm text-ink-muted">
                {loading && results.length === 0
                  ? 'Söker…'
                  : `${total.toLocaleString('sv-SE')} föreningar`}
              </p>
              {municipality && municipalities.length > 0 && (
                <p className="font-sans text-caption text-ink-muted">
                  {municipalities.find((m) => m.kommunkod === municipality)?.name}
                </p>
              )}
            </div>

            {/* Skeleton */}
            {loading && results.length === 0 && (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border border-rule p-5 animate-pulse">
                    <div className="h-5 bg-rule rounded w-2/3 mb-3" />
                    <div className="h-3 bg-rule-soft rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((r) => (
                  <BrfCard key={r.orgnr} brf={r} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && results.length === 0 && (
              <div className="border border-rule p-6">
                <p className="font-sans text-body text-ink-soft leading-relaxed">
                  Inga föreningar matchar de valda filtren.
                </p>
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
                  {loading ? 'Laddar…' : `Ladda fler (${(total - results.length).toLocaleString('sv-SE')} kvar)`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
