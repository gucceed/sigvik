interface Signal {
  key: string;
  label: string;
  present: boolean;
  source: string;
}

interface Props {
  brf: {
    orgnr: string;
    name: string;
    is_active_scb: boolean;
    is_deregistered: boolean;
    is_winding_up: boolean;
    docs_fetched: number;
    building_year?: number | null;
    energy_class?: string | null;
    score: number;
    confidence: number;
  };
}

export function DataCompletenessBar({ brf }: Props) {
  const signals: Signal[] = [
    { key: "registration", label: "Registrering", present: !brf.is_deregistered, source: "Bolagsverket" },
    { key: "scb_active", label: "SCB-status", present: brf.is_active_scb, source: "SCB" },
    { key: "building_year", label: "Byggår", present: !!brf.building_year, source: "Bolagsverket" },
    { key: "energy_class", label: "Energiklass", present: !!brf.energy_class, source: "Boverket / prediktion" },
    { key: "arsredovisning", label: "Årsredovisning", present: brf.docs_fetched > 0, source: "Bolagsverket digital" },
  ];

  const presentCount = signals.filter((s) => s.present).length;
  const pct = Math.round((presentCount / signals.length) * 100);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Datasignaler</span>
        <span className="text-xs text-gray-400">{presentCount}/{signals.length} tillgängliga</span>
      </div>
      <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 80 ? "#16a34a" : pct >= 50 ? "#ca8a04" : "#dc2626",
          }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {signals.map((signal) => (
          <span
            key={signal.key}
            title={`Källa: ${signal.source}`}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
              signal.present
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${signal.present ? "bg-green-500" : "bg-gray-300"}`} />
            {signal.label}
          </span>
        ))}
      </div>
      {!brf.docs_fetched && (
        <p className="text-xs text-gray-400 leading-relaxed">
          Årsredovisning ej tillgänglig digitalt. Poäng baseras på övriga signaler.
        </p>
      )}
    </div>
  );
}
