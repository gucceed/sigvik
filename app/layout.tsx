import type { Metadata, Viewport } from 'next';
import { Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT', 'WONK'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sigvik.com'),
  title: {
    default: 'Sigvik — BRF-intelligens för Sverige',
    template: '%s · Sigvik',
  },
  description:
    'Ekonomi, avgift, energiklass och underhållsrisk för bostadsrättsföreningar i hela Sverige. Beslutsunderlag från Bolagsverket och Boverket — på under en sekund.',
  keywords: [
    'BRF',
    'bostadsrättsförening',
    'årsavgift',
    'energiklass',
    'stambyte',
    'Skåne',
    'Malmö',
    'Stockholm',
    'Göteborg',
    'Sverige',
  ],
  authors: [{ name: 'Norric AB' }],
  openGraph: {
    title: 'Sigvik — BRF-intelligens för Sverige',
    description:
      'Ekonomi, avgift, energiklass och underhållsrisk för bostadsrättsföreningar i hela Sverige.',
    url: 'https://sigvik.com',
    siteName: 'Sigvik',
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sigvik — BRF-intelligens för Sverige',
    description:
      'Ekonomi, avgift, energiklass och underhållsrisk för bostadsrättsföreningar i hela Sverige.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#F6F2EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" className={`${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
