interface Signal {
  key: string;
  label: string;
  present: boolean;
  source: string;
}

interface Props {
  brf: {
    is_active_scb: boolean | null;
    is_deregistered: boolean | null;
    is_winding_up: boolean | null;
    docs_fetched: number | null;
    building_year?: number | null;
    energy_class?: string | null;
  };
}

export function DataCompletenessBar({ brf }: Props) {
  const signals: Signal[] = [
    { key: "registration", label: "Registrering", present: !brf.is_deregistered, source: "Bolagsverket" },
    { key: "scb_active", label: "SCB-status", present: !!brf.is_active_scb, source: "SCB" },
    { key: "building_year", label: "Byggår", present: !!brf.building_year, source: "Bolagsverket" },
    { key: "energy_class", label: "Energiklass", present: !!brf.energy_class, source: "Boverket / prediktion" },
    { key: "arsredovisning", label: "Årsredovisning", present: !!brf.docs_fetched, source: "Bolagsverket digital" },
  ];

  const presentCount = signals.filter((s) => s.present).length;
  const pct = Math.round((presentCount / signals.length) * 100);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-overline uppercase text-ink-muted">Datasignaler</span>
        <span className="text-caption text-ink-muted">{presentCount}/{signals.length} tillgängliga</span>
      </div>
      <div className="h-0.5 rounded-full bg-rule overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? "#16a34a" : pct >= 50 ? "#ca8a04" : "#dc2626",
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        {signals.map((signal) => (
          <span
            key={signal.key}
            title={`Källa: ${signal.source}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-caption border ${
              signal.present
                ? "border-rule text-ink-soft"
                : "border-rule text-ink-muted opacity-50"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${signal.present ? "bg-accent" : "bg-ink-muted"}`} />
            {signal.label}
          </span>
        ))}
      </div>
      {!brf.docs_fetched && (
        <p className="text-caption text-ink-muted leading-relaxed pt-1">
          Årsredovisning ej tillgänglig digitalt. Poäng baseras på övriga signaler.
        </p>
      )}
    </div>
  );
}
