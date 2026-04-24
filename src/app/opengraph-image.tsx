import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'GameHaru — Premium Sports Arena Management';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#020617',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #00d4ff 0%, #00ff88 100%)',
            width: 200,
            height: 200,
            borderRadius: 40,
            marginBottom: 40,
            boxShadow: '0 20px 50px rgba(0, 212, 255, 0.3)',
          }}
        >
           <div style={{ color: '#020617', fontSize: 100, fontWeight: 900 }}>GH</div>
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-2px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Game<span style={{ color: '#00ff88' }}>Haru</span>
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#94a3b8',
            marginTop: 20,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            fontWeight: 600,
          }}
        >
          Premium Arena Management
        </div>
      </div>
    ),
    { ...size }
  );
}
