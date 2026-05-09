import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Sigvik — 33 706 föreningar · hela Sverige';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1A1A1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '80px',
          justifyContent: 'space-between',
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Wordmark */}
        <div style={{ color: '#8A8580', fontSize: '20px', letterSpacing: '0.15em' }}>
          SIGVIK
        </div>

        {/* Number */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              color: '#F6F2EB',
              fontSize: '140px',
              fontWeight: '400',
              lineHeight: '1',
              letterSpacing: '-0.04em',
            }}
          >
            33 706
          </div>
          <div style={{ color: '#8A8580', fontSize: '26px', letterSpacing: '-0.01em' }}>
            bostadsrättsföreningar · hela Sverige
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ color: '#4A4A4A', fontSize: '16px' }}>sigvik.com</div>
          <div style={{ color: '#4A4A4A', fontSize: '16px' }}>
            Uppdaterat dagligen · Bolagsverket · Boverket
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
