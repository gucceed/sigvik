import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F2EB',
        ink: '#1A1A1A',
        'ink-soft': '#4A4A4A',
        'ink-muted': '#8A8580',
        rule: '#D8D2C4',
        'rule-soft': '#E8E2D4',
        accent: '#8B2E2E',
        'accent-hover': '#A03838',
        sage: '#5F7A5F',
        amber: '#C08B3C',
        signal: '#B04040',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['1.625rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        'caption': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'overline': ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.18em' }],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;
