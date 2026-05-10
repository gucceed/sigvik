'use client';

import { useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, GeoFeature } from 'react-simple-maps';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CoverageEntry = {
  brf_count: number;
  with_ars: number;
  name: string;
  county: string;
};

type TooltipState = {
  x: number;
  y: number;
  kommunkod: string;
  entry: CoverageEntry;
} | null;

// ── Color scale ───────────────────────────────────────────────────────────────
// Logarithmic paper→ink scale handles Stockholm (6 034) vs rural (1–5) spread.

const PAPER: [number, number, number] = [246, 242, 235];
const INK:   [number, number, number] = [ 26,  26,  26];

function choroplethColor(count: number, maxCount: number): string {
  if (count === 0) return `rgb(${PAPER[0]},${PAPER[1]},${PAPER[2]})`;
  const t = Math.log10(count + 1) / Math.log10(maxCount + 1);
  const r = Math.round(PAPER[0] + t * (INK[0] - PAPER[0]));
  const g = Math.round(PAPER[1] + t * (INK[1] - PAPER[1]));
  const b = Math.round(PAPER[2] + t * (INK[2] - PAPER[2]));
  return `rgb(${r},${g},${b})`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SwedenChoropleth({
  coverage,
}: {
  coverage: Record<string, CoverageEntry>;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const maxCount = Math.max(...Object.values(coverage).map(v => v.brf_count), 1);

  const handleGeoEnter = useCallback(
    (geo: GeoFeature, evt: React.MouseEvent<SVGPathElement>) => {
      const kod = geo.properties.id;
      const entry = coverage[kod];
      if (!entry) return;
      setTooltip({ x: evt.clientX, y: evt.clientY, kommunkod: kod, entry });
    },
    [coverage],
  );

  const handleGeoMove = useCallback(
    (_geo: GeoFeature, evt: React.MouseEvent<SVGPathElement>) => {
      setTooltip(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null);
    },
    [],
  );

  const handleGeoLeave = useCallback(() => setTooltip(null), []);

  const handleGeoClick = useCallback((geo: GeoFeature) => {
    window.location.href = `/region/${geo.properties.id}`;
  }, []);

  return (
    <div className="relative w-full select-none">

      {/* ── SVG map ── */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ rotate: [-17, -64, 0], scale: 950 }}
        style={{ width: '100%', height: 'auto' }}
        viewBox="0 0 400 620"
      >
        <Geographies geography="/sweden-municipalities.geojson">
          {({ geographies }) =>
            geographies.map(geo => {
              const kod = geo.properties.id;
              const entry = coverage[kod];
              const count = entry?.brf_count ?? 0;
              const isHovered = tooltip?.kommunkod === kod;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isHovered ? '#8B2E2E' : choroplethColor(count, maxCount)}
                  stroke="#F6F2EB"
                  strokeWidth={0.3}
                  style={{
                    default: { outline: 'none', cursor: count > 0 ? 'pointer' : 'default' },
                    hover:   { outline: 'none', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(evt) => handleGeoEnter(geo, evt)}
                  onMouseLeave={handleGeoLeave}
                  onClick={() => handleGeoClick(geo)}
                  aria-label={
                    entry ? `${entry.name}: ${entry.brf_count} föreningar` : geo.properties.name
                  }
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* ── Legend ── */}
      <div className="mt-5 space-y-2">
        <span className="font-sans text-overline text-ink-muted uppercase block">
          Antal registrerade föreningar
        </span>
        <div className="flex items-center gap-3">
          <div className="flex h-2 w-48 flex-shrink-0">
            {Array.from({ length: 10 }).map((_, i) => {
              const t = (i + 1) / 10;
              const count = Math.round(Math.pow(10, t * Math.log10(maxCount + 1)) - 1);
              return (
                <div
                  key={i}
                  className="flex-1 h-full"
                  style={{ backgroundColor: choroplethColor(count, maxCount) }}
                />
              );
            })}
          </div>
          <div className="flex w-48 justify-between font-sans text-caption text-ink-muted">
            <span>Få</span>
            <span>Många</span>
          </div>
        </div>
        <p className="font-sans text-caption text-ink-muted leading-relaxed max-w-sm">
          Logaritmisk skala. Klicka på en kommun för att se föreningarna.
        </p>
      </div>

      {/* ── Tooltip (fixed positioning, follows cursor) ── */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50"
          style={{ left: tooltip.x + 14, top: tooltip.y - 72 }}
        >
          <div
            className="border border-rule shadow-sm px-3 py-2"
            style={{ backgroundColor: '#F6F2EB', minWidth: 168 }}
          >
            <p className="font-display text-body-sm text-ink leading-tight mb-1">
              {tooltip.entry.name}
            </p>
            <p className="font-sans text-caption text-ink-muted">
              {tooltip.entry.brf_count.toLocaleString('sv-SE')} föreningar
            </p>
            {tooltip.entry.with_ars > 0 ? (
              <p className="font-sans text-caption text-ink-muted">
                {Math.round((tooltip.entry.with_ars / tooltip.entry.brf_count) * 100)} % med årsredovisning
              </p>
            ) : (
              <p className="font-sans text-caption text-ink-muted">
                Årsredovisningar inläses
              </p>
            )}
            <p className="font-sans text-caption mt-1" style={{ color: '#8B2E2E' }}>
              Visa föreningar →
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
