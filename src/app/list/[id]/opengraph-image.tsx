import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';

export const alt = '9coma | 私を構成する漫画9選';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const data = await getListById(params.id);

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        {/* Left Side: Dynamic Text Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '450px',
            marginRight: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              fontWeight: 800,
              color: '#8b5cf6',
              letterSpacing: '0.1em',
              marginBottom: '12px',
              textTransform: 'uppercase',
            }}
          >
            My Top 9 Comics
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '52px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            私を構成する9本
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '24px', color: '#a0a0b0' }}>by</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>
              {data.authorName}
            </div>
          </div>
          
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              fontSize: '18px',
              color: '#4b5563',
              fontWeight: 500,
            }}
          >
            9coma.com
          </div>
        </div>

        {/* Right Side: Large Grid with Glassmorphism */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '24px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          }}
        >
          {[0, 1, 2].map((rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: rowIdx < 2 ? '12px' : '0px',
              }}
            >
              {[0, 1, 2].map((colIdx) => {
                const idx = rowIdx * 3 + colIdx;
                const manga = data.slots[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      width: '135px',
                      height: '190px',
                      background: '#1e1e2e',
                      borderRadius: '10px',
                      display: 'flex',
                      marginRight: colIdx < 2 ? '12px' : '0px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    }}
                  >
                    {manga ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={manga.imageUrl}
                        alt={manga.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1e1e2e, #2a2a3e)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
