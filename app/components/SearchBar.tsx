'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

// ── Types ─────────────────────────────────────────────────────────────────────

type Municipality = {
  kommunkod: string;
  name: string;
  county: string;
};

export type BrfSearchResult = {
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
};

type SearchState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'found'; results: BrfSearchResult[]; context?: string }
  | { phase: 'empty'; query: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

export function verdiktLabel(confidence: number | null | undefined): string {
  if (confidence == null) return 'Tidig indikation';
  if (confidence >= 0.7) return 'Stark signal';
  if (confidence >= 0.4) return 'Måttlig signal';
  return 'Tidig indikation';
}

// ── BrfCard ───────────────────────────────────────────────────────────────────

export function BrfCard({ brf }: { brf: BrfSearchResult }) {
  const label = verdiktLabel(brf.intent_score_confidence);

  return (
    <a
      href={`/brf/${brf.orgnr}`}
      className="block border border-rule bg-paper/60 p-5 md:p-6 hover:border-accent transition-colors group"
    >
      <div className="flex items-start justify-between gap-4 mb-1">
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
        <p className="font-sans text-body-sm text-ink-soft mb-3">
          {[brf.street, brf.postal_code, brf.city].filter(Boolean).join(' · ')}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {brf.intent_score != null && (
          <span className="font-sans text-caption text-ink-soft">{label}</span>
        )}
        <span className="font-mono text-caption text-ink-muted">{brf.orgnr}</span>
        {brf.registration_year && (
          <span className="font-sans text-caption text-ink-muted">
            Reg. {brf.registration_year}
          </span>
        )}
      </div>
    </a>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<SearchState>({ phase: 'idle' });
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [suggestions, setSuggestions] = useState<Municipality[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pre-fetch municipality list once — 289 items, ~8 KB
  useEffect(() => {
    fetch(`${API_URL}/api/municipalities`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Municipality[]) => setMunicipalities(data))
      .catch(() => {});
  }, []);

  // Update suggestions as query changes
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2 || municipalities.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const matches = municipalities
      .filter((m) => m.name.toLowerCase().startsWith(q) || m.name.toLowerCase().includes(q))
      .slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [query, municipalities]);

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const searchByMunicipality = useCallback(async (mun: Municipality) => {
    setQuery(mun.name);
    setShowSuggestions(false);
    setState({ phase: 'loading' });
    try {
      const resp = await fetch(
        `${API_URL}/api/brfs?municipality=${mun.kommunkod}&limit=20&order_by=intent_score`,
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const results: BrfSearchResult[] = data.brfs ?? [];
      setState(
        results.length > 0
          ? { phase: 'found', results, context: mun.name }
          : { phase: 'empty', query: mun.name },
      );
    } catch {
      setState({ phase: 'empty', query: mun.name });
    }
  }, []);

  const searchByQuery = useCallback(async (q: string) => {
    setState({ phase: 'loading' });
    try {
      const resp = await fetch(
        `${API_URL}/api/brfs/search?q=${encodeURIComponent(q)}&limit=20`,
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const results: BrfSearchResult[] = data.results ?? [];
      setState(
        results.length > 0
          ? { phase: 'found', results }
          : { phase: 'empty', query: q },
      );
    } catch {
      setState({ phase: 'empty', query: q });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setShowSuggestions(false);
    // Exact municipality match → municipality search
    const exactMun = municipalities.find(
      (m) => m.name.toLowerCase() === q.toLowerCase(),
    );
    if (exactMun) {
      await searchByMunicipality(exactMun);
    } else {
      await searchByQuery(q);
    }
  };

  const isLoading = state.phase === 'loading';

  return (
    <div>
      {/* Input */}
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Sök förening, adress, organisationsnummer eller kommun"
      >
        <label htmlFor="brf-search" className="sr-only">
          Sök förening, adress, organisationsnummer eller kommun
        </label>

        <div ref={containerRef} className="relative">
          <input
            ref={inputRef}
            id="brf-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Odengatan 10, Stockholm"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-controls={showSuggestions ? 'municipality-suggestions' : undefined}
            aria-describedby="search-hint"
            className="w-full bg-transparent border-0 border-b-2 border-ink pb-4 pt-2 font-display text-display-sm md:text-display-md font-normal text-ink placeholder:text-ink-muted placeholder:italic focus:outline-none focus:border-accent transition-colors"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-0 bottom-4 md:bottom-5 font-sans text-overline uppercase text-ink hover:text-accent disabled:opacity-40 transition-colors px-2 py-1"
            aria-label="Sök"
          >
            {isLoading ? 'Söker…' : 'Sök →'}
          </button>

          {/* Autocomplete dropdown */}
          {showSuggestions && (
            <ul
              id="municipality-suggestions"
              role="listbox"
              aria-label="Kommunförslag"
              className="absolute top-full left-0 right-0 z-20 bg-paper border border-rule shadow-md mt-1"
            >
              <li className="px-4 pt-3 pb-1">
                <span className="font-sans text-overline text-ink-muted uppercase">
                  Kommuner
                </span>
              </li>
              {suggestions.map((mun) => (
                <li key={mun.kommunkod} role="option" aria-selected="false">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 font-sans text-body-sm hover:bg-rule-soft transition-colors flex items-baseline justify-between gap-4"
                    onClick={() => searchByMunicipality(mun)}
                  >
                    <span className="text-ink">{mun.name}</span>
                    <span className="text-ink-muted text-caption shrink-0">{mun.county}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p id="search-hint" className="font-sans text-body-sm text-ink-muted mt-4">
          Datakälla: Bolagsverket · Boverket · Skatteverket
        </p>
      </form>

      {/* Results */}
      {state.phase === 'found' && (
        <div className="reveal mt-8 space-y-3">
          {state.results.map((r) => (
            <BrfCard key={r.orgnr} brf={r} />
          ))}
          <p className="font-sans text-body-sm text-ink-muted pt-2">
            {state.results.length} träff{state.results.length === 1 ? '' : 'ar'}
            {state.context ? ` i ${state.context}` : ''} · Data från Bolagsverket
          </p>
        </div>
      )}

      {state.phase === 'empty' && (
        <div className="reveal mt-8 border border-rule bg-paper/60 p-5 md:p-6">
          <p className="font-sans text-body text-ink-soft leading-relaxed">
            Inga träffar för{' '}
            <em className="font-display">&ldquo;{state.query}&rdquo;</em>.{' '}
            Prova föreningens namn, en gatuadress eller ett organisationsnummer (10 siffror).
          </p>
        </div>
      )}
    </div>
  );
}
