import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';

export const runtime = 'edge';
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
          background: '#0a0a0f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px',
        }}
      >
        {/* Left Side: Text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            marginRight: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '56px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.2,
              marginBottom: '20px',
            }}
          >
            {data.authorName}さんを構成する漫画9選
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              color: '#a0a0b0',
              marginBottom: '40px',
            }}
          >
            #9coma | My Top 9 Comics
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              fontWeight: 600,
              color: '#8b5cf6', // 9coma purple
              border: '2px solid #8b5cf6',
              padding: '8px 20px',
              borderRadius: '99px',
              alignSelf: 'flex-start',
            }}
          >
            9coma.com
          </div>
        </div>

        {/* Right Side: Square Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#14141e',
            padding: '16px',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }}
        >
          {[0, 1, 2].map((rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: rowIdx < 2 ? '8px' : '0px',
              }}
            >
              {[0, 1, 2].map((colIdx) => {
                const idx = rowIdx * 3 + colIdx;
                const manga = data.slots[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      width: '110px',
                      height: '155px', // Rectangular (Manga cover ratio)
                      background: '#1e1e2e',
                      borderRadius: '8px',
                      display: 'flex',
                      marginRight: colIdx < 2 ? '10px' : '0px',
                      overflow: 'hidden',
                    }}
                  >
                    {manga ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={manga.imageUrl}
                        alt={manga.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : null}
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
