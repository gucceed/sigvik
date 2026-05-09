'use client';

import { useState } from 'react';

export function ShareButton({ url, name }: { url: string; name: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the URL from an invisible input
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 font-sans text-body-sm text-ink-soft hover:text-ink border border-rule px-4 py-2 transition-colors"
      aria-label={`Kopiera länk till ${name}`}
    >
      {copied ? (
        <>
          <span className="text-sage">✓</span>
          Länk kopierad
        </>
      ) : (
        <>
          <span aria-hidden>↗</span>
          Dela förening
        </>
      )}
    </button>
  );
}
