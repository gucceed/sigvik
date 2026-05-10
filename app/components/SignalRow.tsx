type Urgency = 'within_1yr' | '1_3yr' | '3_5yr' | '5yr_plus' | 'unknown';

const URGENCY_LABELS: Record<Urgency, string> = {
  within_1yr: 'Inom 1 år',
  '1_3yr':    '1–3 år',
  '3_5yr':    '3–5 år',
  '5yr_plus': '5+ år',
  unknown:    'Okänd tidshorisont',
};

const URGENCY_COLORS: Record<Urgency, string> = {
  within_1yr: 'var(--grade-e)',
  '1_3yr':    'var(--grade-d)',
  '3_5yr':    'var(--grade-c)',
  '5yr_plus': 'var(--grade-b)',
  unknown:    'var(--grade-unknown)',
};

const TYPE_ICONS: Record<string, string> = {
  stambyte:    '⌇',
  tak:         '△',
  fasad:       '□',
  fönster:     '⊡',
  hiss:        '↕',
  ventilation: '〜',
  default:     '·',
};

export function SignalRow({
  type,
  urgency = 'unknown',
  basis,
}: {
  type: string;
  urgency?: Urgency;
  basis?: string;
}) {
  const color = URGENCY_COLORS[urgency];
  const icon = TYPE_ICONS[type.toLowerCase()] ?? TYPE_ICONS.default;

  return (
    <div className="py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <span
          className="font-mono text-body-sm w-5 text-center flex-shrink-0"
          aria-hidden
          style={{ color }}
        >
          {icon}
        </span>
        <span className="font-sans text-body-sm text-ink capitalize flex-1">{type}</span>
        <span
          className="font-sans text-caption px-2 py-0.5 flex-shrink-0"
          style={{
            color,
            border: `0.5px solid ${color}`,
            backgroundColor: `${color}10`,
          }}
        >
          {URGENCY_LABELS[urgency]}
        </span>
      </div>
      {basis && (
        <p className="font-sans text-caption text-ink-muted mt-1.5 ml-8 leading-relaxed">
          {basis}
        </p>
      )}
    </div>
  );
}
