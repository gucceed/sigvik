# Sigvik — Decisions Log

## 2026-05-10: PR5 choropleth — coverage coloring deferred to score coloring in PR6

Choropleth on /sweden is colored by BRF count per municipality (logarithmic
scale), not by median intent score.

Reason: intent scores at launch are lifecycle-only (building age model, no
årsredovisningar parsed nationally). Score variation is minimal — the map
would be visually uniform with no signal.

Deferred enhancement (PR6): swap choropleth to median intent score once
national årsredovisning parsing completes. Trigger: when
with_ars / brf_count > 0.3 nationally in app/sweden/coverage-data.json.

PR6 implementation: replace brf_count lookup with median_intent_score in
coverage data; update choroplethColor() to diverging sage→amber→signal-red
scale; update legend copy to "Median underhållssignal per kommun".

Coverage data: app/sweden/coverage-data.json — regenerate after ingestion:
  SELECT m.kommunkod, m.name, m.county,
    COUNT(b.id) AS brf_count,
    SUM(CASE WHEN b.num_arsredovisningar_ingested > 0 THEN 1 ELSE 0 END) AS with_ars
  FROM municipalities m
  LEFT JOIN brfs b ON b.municipality_id = m.id AND b.is_deregistered = false
  GROUP BY m.kommunkod, m.name, m.county

GeoJSON: public/sweden-municipalities.geojson — okfse source, simplified to
334KB raw / 86KB gzip. Regenerate only on municipal boundary changes.
