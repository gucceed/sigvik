export function SourceBadge({ source, year }: { source: string; year?: string | number }) {
  return (
    <span
      className="inline-flex items-center gap-1 font-sans text-caption px-1.5 py-0.5 rounded-none"
      style={{
        backgroundColor: 'var(--surface-card)',
        color: '#8A8580',
        border: '0.5px solid var(--border-subtle)',
      }}
    >
      {source}
      {year && <span>· {year}</span>}
    </span>
  );
}
