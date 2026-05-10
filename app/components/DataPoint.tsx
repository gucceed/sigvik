import { SourceBadge } from './SourceBadge';
import { UncertaintyNote } from './UncertaintyNote';

export function DataPoint({
  label,
  value,
  source,
  sourceYear,
  sub,
  missing,
  missingNote,
}: {
  label: string;
  value?: string | null;
  source?: string;
  sourceYear?: string | number;
  sub?: React.ReactNode;
  missing?: boolean;
  missingNote?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-sans text-overline text-ink-muted uppercase">{label}</span>
      {missing ? (
        <UncertaintyNote>
          {missingNote ?? 'Data saknas för detta fält.'}
        </UncertaintyNote>
      ) : (
        <>
          <span className="font-display text-display-sm text-ink tracking-tight">
            {value ?? '—'}
          </span>
          {sub && (
            <span className="font-sans text-body-sm text-ink-soft">{sub}</span>
          )}
          {source && (
            <SourceBadge source={source} year={sourceYear} />
          )}
        </>
      )}
    </div>
  );
}
