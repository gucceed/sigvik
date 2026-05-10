type Size = 'sm' | 'md' | 'lg' | 'xl';

const GRADE_COLORS: Record<string, string> = {
  A: 'var(--grade-a)',
  B: 'var(--grade-b)',
  C: 'var(--grade-c)',
  D: 'var(--grade-d)',
  E: 'var(--grade-e)',
  F: 'var(--grade-f)',
};

const SIZE_CLASSES: Record<Size, { chip: string; dot: string; letter: string }> = {
  sm: { chip: 'gap-1.5 px-2 py-0.5', dot: 'w-1.5 h-1.5', letter: 'font-sans text-caption' },
  md: { chip: 'gap-2 px-2.5 py-1',   dot: 'w-2 h-2',     letter: 'font-sans text-body-sm' },
  lg: { chip: 'gap-2 px-3 py-1.5',   dot: 'w-2.5 h-2.5', letter: 'font-sans text-body font-medium' },
  xl: { chip: 'gap-2.5 px-4 py-2',   dot: 'w-3 h-3',     letter: 'font-sans text-body-lg font-medium' },
};

export function GradeChip({
  grade,
  size = 'md',
}: {
  grade: string | null;
  size?: Size;
}) {
  const color = grade ? (GRADE_COLORS[grade] ?? 'var(--grade-unknown)') : 'var(--grade-unknown)';
  const label = grade ?? '?';
  const s = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center border rounded-none ${s.chip}`}
      style={{ borderColor: color, color }}
      aria-label={`Grad ${label}`}
    >
      <span
        className={`rounded-full flex-shrink-0 ${s.dot}`}
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className={s.letter}>{label}</span>
    </span>
  );
}

export { GRADE_COLORS };
