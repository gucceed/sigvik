export function ProgressRing({
  pct,
  size = 28,
  stroke = 2.5,
}: {
  pct: number;  // 0–100
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const cx = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`${Math.round(pct)}% klar`}
      role="img"
      className="flex-shrink-0"
    >
      {/* Track */}
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke="rgba(246,242,235,0.25)"
        strokeWidth={stroke}
      />
      {/* Fill */}
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke="#F6F2EB"
        strokeWidth={stroke}
        strokeLinecap="butt"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
    </svg>
  );
}
