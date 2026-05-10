'use client';

import { useEffect, useState } from 'react';
import { GRADE_COLORS } from './GradeChip';

export function ScoreBar({
  score,
  grade,
  className = '',
}: {
  score: number; // 0–100
  grade: string | null;
  className?: string;
}) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    // Defer one frame so transition fires
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const color = grade ? (GRADE_COLORS[grade] ?? 'var(--grade-unknown)') : 'var(--grade-unknown)';
  const pct = Math.max(0, Math.min(100, score));

  return (
    <div
      className={`h-1.5 w-full rounded-none overflow-hidden ${className}`}
      style={{ backgroundColor: 'var(--border-subtle)' }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Hälsopoäng: ${pct} av 100`}
    >
      <div
        className="h-full"
        style={{
          width: filled ? `${pct}%` : '0%',
          backgroundColor: color,
          transition: 'width 300ms ease-out',
        }}
      />
    </div>
  );
}
