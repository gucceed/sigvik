export function TrendArrow({
  pct,
  yearRange,
}: {
  pct: number | null;
  yearRange?: string;
}) {
  if (pct == null) {
    return <span className="font-sans text-caption text-ink-muted">—</span>;
  }

  const isUp = pct > 1;
  const isDown = pct < -1;
  const isStable = !isUp && !isDown;

  const color = isUp ? 'var(--grade-d)' : isDown ? 'var(--grade-b)' : '#8A8580';
  const arrow = isUp ? '↑' : isDown ? '↓' : '→';
  const sign = pct > 0 ? '+' : '';

  return (
    <span className="inline-flex items-baseline gap-1 font-sans text-body-sm" style={{ color }}>
      <span aria-hidden>{arrow}</span>
      <span>{sign}{pct.toFixed(1)} %</span>
      {yearRange && (
        <span className="font-sans text-caption" style={{ color: '#8A8580' }}>
          {yearRange}
        </span>
      )}
      {isStable && <span className="sr-only">stabil</span>}
    </span>
  );
}
