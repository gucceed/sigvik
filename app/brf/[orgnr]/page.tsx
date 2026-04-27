'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DataCompletenessBar } from '../../components/DataCompletenessBar';

const API_URL =
  process.env.NEXT_PUBLIC_SIGVIK_API_URL ||
  'https://sigvik-backend-production.up.railway.app';

type BRF = {
  orgnr: string;
  name: string;
  street: string | null;
  postal_code: string | null;
  city: string | null;
  registration_year: number | null;
  building_year: number | null;
  intent_score: number | null;
  intent_score_confidence: number | null;
  municipality_name: string | null;
  is_active_scb: boolean | null;
  is_deregistered: boolean | null;
  is_winding_up: boolean | null;
  energy_class: string | null;
  num_apartments: number | null;
  num_arsredovisningar_ingested: number | null;
  last_ingested_at: string | null;
};

type PageState =
  | { status: 'loading' }
  | { status: 'ok'; brf: BRF }
  | { status: 'not_found' }
  | { status: 'error'; message: string };

function confidenceLabel(c: number | null): string {
  if (c === null || c === undefined) return 'Tidig indikation';
  if (c >= 0.7) return 'Starkt signal';
  if (c >= 0.4) return 'Måttlig signal';
  return 'Tidig indikation';
}

function scoreColor(score: number | null): string {
  if (score === null) return 'text-ink-muted';
  if (score >= 60) return 'text-signal';
  if (score >= 35) return 'text-amber';
  return 'text-sage';
}

export default function BrfDetailPage() {
  const params = useParams();
  const orgnr = params?.orgnr as string;
  const [state, setState] = useState<PageState>({ status: 'loading' });

  useEffect(() => {
    if (!orgnr) return;

    let cancelled = false;
    setState({ status: 'loading' });

    fetch(`${API_URL}/api/brfs/${orgnr}`)
      .then(async (resp) => {
        if (cancelled) return;
        if (resp.status === 404) {
          setState({ status: 'not_found' });
          return;
        }
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          setState({ status: 'error', message: `HTTP ${resp.status}${text ? ': ' + text.slice(0, 120) : ''}` });
          return;
        }
        const data = await resp.json();
        // API returns { brf: {...}, arsredovisningar: [...], energideklaration: ... }
        const brf: BRF = data.brf ?? data;
        setState({ status: 'ok', brf });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ status: 'error', message: err?.message ?? 'Okänt fel' });
      });

    return () => { cancelled = true; };
  }, [orgnr]);

  return (
    <main className="min-h-screen flex flex-col bg-paper">
      {/* Header */}
      <header className="w-full px-6 md:px-12 pt-8 md:pt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <a
              href="/"
              className="font-display text-display-sm font-normal tracking-tight text-ink hover:text-accent transition-colors"
            >
              Sigvik
            </a>
            <span className="hidden md:inline text-overline text-ink-muted uppercase">
              BRF-intelligens
            </span>
          </div>
          <a
            href="/"
            className="text-body-sm text-ink-soft hover:text-ink transition-colors"
          >
            ← Tillbaka
          </a>
        </div>
      </header>

      {/* Content */}
      <section className="flex-1 px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">

          {state.status === 'loading' && (
            <div className="text-body text-ink-muted animate-pulse">
              Hämtar föreningsdata…
            </div>
          )}

          {state.status === 'not_found' && (
            <div className="border border-rule bg-paper/60 p-8 max-w-prose">
              <p className="text-overline uppercase text-ink-muted mb-3">Inte hittad</p>
              <h1 className="font-display text-display-sm font-normal text-ink mb-4">
                Förening saknas i databasen
              </h1>
              <p className="text-body text-ink-soft leading-relaxed">
                Org.nr <code className="font-mono text-body-sm">{orgnr}</code> finns
                inte i Sigviks databas. Sigvik täcker för närvarande 3&nbsp;582 BRF:er i Skåne.
              </p>
              <a
                href="/"
                className="inline-block mt-6 text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
              >
                Sök en annan förening →
              </a>
            </div>
          )}

          {state.status === 'error' && (
            <div className="border border-rule bg-paper/60 p-8 max-w-prose">
              <p className="text-overline uppercase text-ink-muted mb-3">Tillfälligt fel</p>
              <h1 className="font-display text-display-sm font-normal text-ink mb-4">
                Kunde inte hämta föreningsdata
              </h1>
              <p className="text-body text-ink-soft leading-relaxed mb-2">
                Försök igen om en stund.
              </p>
              {state.message && (
                <p className="text-caption text-ink-muted font-mono">{state.message}</p>
              )}
              <a
                href="/"
                className="inline-block mt-6 text-body-sm text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
              >
                ← Tillbaka till sökning
              </a>
            </div>
          )}

          {state.status === 'ok' && (
            <div>
              {/* Breadcrumb */}
              <p className="text-overline uppercase text-ink-muted mb-8">
                {state.brf.municipality_name ?? 'Skåne'} · BRF-rapport
              </p>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 md:gap-16 items-start">

                {/* Left: Identity */}
                <div>
                  <h1 className="font-display text-display-md md:text-display-lg font-normal tracking-tight text-ink mb-3">
                    {state.brf.name}
                  </h1>

                  {(state.brf.street || state.brf.city) && (
                    <p className="text-body-lg text-ink-soft mb-6">
                      {[state.brf.street, state.brf.postal_code, state.brf.city]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}

                  {/* Status flags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {state.brf.is_winding_up && (
                      <span className="text-overline uppercase px-2 py-0.5 border border-signal text-signal">
                        Under likvidation
                      </span>
                    )}
                    {state.brf.is_deregistered && (
                      <span className="text-overline uppercase px-2 py-0.5 border border-rule text-ink-muted">
                        Avregistrerad
                      </span>
                    )}
                    {!state.brf.is_deregistered && !state.brf.is_winding_up && (
                      <span className="text-overline uppercase px-2 py-0.5 border border-rule text-ink-soft">
                        Aktiv
                      </span>
                    )}
                  </div>

                  {/* Key facts */}
                  <dl className="space-y-3 border-t border-rule pt-6">
                    {state.brf.orgnr && (
                      <div className="flex justify-between gap-8">
                        <dt className="text-body-sm text-ink-muted">Organisationsnummer</dt>
                        <dd className="text-body-sm text-ink font-mono">{state.brf.orgnr}</dd>
                      </div>
                    )}
                    {state.brf.registration_year && (
                      <div className="flex justify-between gap-8">
                        <dt className="text-body-sm text-ink-muted">Registreringsår</dt>
                        <dd className="text-body-sm text-ink">{state.brf.registration_year}</dd>
                      </div>
                    )}
                    {state.brf.building_year && (
                      <div className="flex justify-between gap-8">
                        <dt className="text-body-sm text-ink-muted">Byggår</dt>
                        <dd className="text-body-sm text-ink">{state.brf.building_year}</dd>
                      </div>
                    )}
                    {state.brf.num_apartments && (
                      <div className="flex justify-between gap-8">
                        <dt className="text-body-sm text-ink-muted">Antal lägenheter</dt>
                        <dd className="text-body-sm text-ink">{state.brf.num_apartments}</dd>
                      </div>
                    )}
                    {state.brf.energy_class && (
                      <div className="flex justify-between gap-8">
                        <dt className="text-body-sm text-ink-muted">Energiklass</dt>
                        <dd className="text-body-sm text-ink">{state.brf.energy_class}</dd>
                      </div>
                    )}
                    {state.brf.municipality_name && (
                      <div className="flex justify-between gap-8">
                        <dt className="text-body-sm text-ink-muted">Kommun</dt>
                        <dd className="text-body-sm text-ink">{state.brf.municipality_name}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Data completeness */}
                  <div className="mt-8 border-t border-rule pt-6">
                    <DataCompletenessBar brf={{
                      is_active_scb: state.brf.is_active_scb,
                      is_deregistered: state.brf.is_deregistered,
                      is_winding_up: state.brf.is_winding_up,
                      docs_fetched: state.brf.num_arsredovisningar_ingested ?? 0,
                      building_year: state.brf.building_year,
                      energy_class: state.brf.energy_class,
                    }} />
                  </div>
                </div>

                {/* Right: Score */}
                <div className="md:min-w-[280px]">
                  <div className="border border-rule bg-paper/80 p-8">
                    <p className="text-overline uppercase text-ink-muted mb-4">Intent-signal</p>

                    {state.brf.intent_score != null ? (
                      <>
                        <div className={`font-display text-display-xl font-normal tracking-tight leading-none mb-2 ${scoreColor(state.brf.intent_score)}`}>
                          {state.brf.intent_score.toFixed(1)}
                        </div>
                        <p className="text-body-sm text-ink-muted mb-6">av 100</p>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-caption text-ink-muted">Konfidensgrad</span>
                            <span className="text-caption text-ink">
                              {confidenceLabel(state.brf.intent_score_confidence)}
                            </span>
                          </div>
                          {state.brf.intent_score_confidence != null && (
                            <div className="h-0.5 rounded-full bg-rule overflow-hidden">
                              <div
                                className="h-full rounded-full bg-accent transition-all"
                                style={{ width: `${Math.round(state.brf.intent_score_confidence * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-body-sm text-ink-muted">
                        Inte beräknad ännu — ingestion pågår.
                      </p>
                    )}

                    <div className="mt-8 pt-6 border-t border-rule">
                      <p className="text-caption text-ink-muted leading-relaxed">
                        Signalen baseras på avgiftshöjningar, låneutveckling,
                        underhållsplaner och energiklass. Uppdateras dagligen.
                      </p>
                    </div>
                  </div>

                  {/* Ingestion timestamp */}
                  {state.brf.last_ingested_at && (
                    <p className="text-caption text-ink-muted mt-3 text-right">
                      Senast uppdaterad:{' '}
                      {new Date(state.brf.last_ingested_at).toLocaleDateString('sv-SE')}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-16 pt-8 border-t border-rule">
                <p className="text-body-sm text-ink-muted">
                  Data hämtad från Bolagsverket och Boverket.{' '}
                  <a
                    href={`mailto:hej@sigvik.com?subject=Mer%20om%20${encodeURIComponent(state.brf.name)}`}
                    className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-1"
                  >
                    Kontakta oss för fullständig analys →
                  </a>
                </p>
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
