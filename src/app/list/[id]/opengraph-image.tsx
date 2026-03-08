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

  const topRowSlots = data.slots.slice(0, 4);
  const bottomRowSlots = data.slots.slice(4, 9);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #FFD600 0%, #FFB300 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Top Row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            {/* Text Cell */}
            <div
              style={{
                width: '208px',
                height: '278px',
                display: 'flex',
                flexDirection: 'column',
                padding: '10px 0',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '38px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1.1 }}>私を</div>
                <div style={{ fontSize: '38px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1.1 }}>構成する</div>
                <div style={{ fontSize: '38px', fontWeight: 900, color: '#1A1A1A', lineHeight: 1.1 }}>9冊</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '20px',
                  color: '#1A1A1A',
                  fontWeight: 800,
                  marginTop: '12px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                by {data.authorName}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex' }}>
                <div
                  style={{
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '99px',
                    fontSize: '18px',
                    fontWeight: 800,
                  }}
                >
                  9COMA.COM
                </div>
              </div>
            </div>

            {/* Top 4 Books */}
            {topRowSlots.map((manga, idx) => (
              <div
                key={`top-${idx}`}
                style={{
                  width: '208px',
                  height: '278px',
                  background: '#FFFFFF',
                  border: '4px solid #1A1A1A',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {manga ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={manga.imageUrl}
                      alt={manga.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: '#E0E0E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#CCCCCC',
                        fontSize: '60px',
                        fontWeight: 900,
                      }}
                    >
                      ?
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    padding: '0 8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    height: '32px',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {manga ? manga.title : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '20px' }}>
            {bottomRowSlots.map((manga, idx) => (
              <div
                key={`bottom-${idx}`}
                style={{
                  width: '208px',
                  height: '278px',
                  background: '#FFFFFF',
                  border: '4px solid #1A1A1A',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {manga ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={manga.imageUrl}
                      alt={manga.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: '#E0E0E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#CCCCCC',
                        fontSize: '60px',
                        fontWeight: 900,
                      }}
                    >
                      ?
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                    padding: '0 8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    height: '32px',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                    }}
                  >
                    {manga ? manga.title : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
