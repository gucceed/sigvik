'use client';

import { useEffect, useState } from 'react';
import { ProgressRing } from './ProgressRing';

const STRIP_KEY = 'sigvik-launch-strip-dismissed';

export function LaunchStrip({
  brfCount,
  municipalityCount,
  scoringPct,
}: {
  brfCount: number;
  municipalityCount: number;
  scoringPct: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STRIP_KEY);
    if (!dismissed && scoringPct < 100) {
      setVisible(true);
    }
  }, [scoringPct]);

  function dismiss() {
    localStorage.setItem(STRIP_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  const fmtSv = (n: number) => n.toLocaleString('sv-SE');

  return (
    <div
      className="w-full flex items-center justify-center gap-3 px-4"
      style={{
        height: 44,
        backgroundColor: '#1A1A1A',
        color: '#F6F2EB',
      }}
      role="banner"
      aria-label="Nationell täckning uppnådd"
    >
      <ProgressRing pct={scoringPct} size={22} stroke={2} />
      <p className="font-sans text-caption" style={{ letterSpacing: '0.04em' }}>
        Nationell täckning — {fmtSv(brfCount)} föreningar i {municipalityCount} kommuner
        {scoringPct < 100 && (
          <span className="opacity-60 ml-2">· Scoring pågår ({Math.round(scoringPct)} %)</span>
        )}
      </p>
      <button
        onClick={dismiss}
        className="ml-auto font-sans text-caption opacity-50 hover:opacity-100 transition-opacity px-2 py-1"
        aria-label="Stäng"
      >
        ×
      </button>
    </div>
  );
}
