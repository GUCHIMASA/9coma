import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { THEME_GRADIENTS } from '@/lib/themes';

export const alt = '9coma | 私を構成する9つのマンガ';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const data = await getListById(params.id);

  const topRowSlots = data.slots.slice(0, 4);
  const bottomRowSlots = data.slots.slice(5, 9);
  const centerSlot = data.slots[4];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(180deg, #FFD600 0%, #FFB300 100%)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          gap: '16px',
        }}
      >
        {/* Left Column (Badge + Slot 5) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '352px' }}>
          {/* Badge */}
          <div
            style={{
              width: '100%',
              height: '52px',
              background: data.theme && THEME_GRADIENTS[data.theme] ? THEME_GRADIENTS[data.theme] : '#1A1A1A',
              borderRadius: '99px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '0.2em',
            }}
          >
            {data.theme ? `＃${data.theme}` : '9COMA.COM'}
          </div>

          {/* Large Box (Slot 5) */}
          <div
            style={{
              width: '100%',
              height: '498px',
              background: '#FFFFFF',
              border: '4px solid #1A1A1A',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {centerSlot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={centerSlot.imageUrl}
                  alt={centerSlot.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: '#FFA8B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#CCCCCC',
                    fontSize: '120px',
                    fontWeight: 900,
                  }}
                >
                  5
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                background: '#1A1A1A',
                color: '#FFFFFF',
                padding: '0 12px',
                fontSize: '18px',
                fontWeight: 600,
                height: '48px',
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
                {centerSlot ? centerSlot.title : '本のタイトル'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2x4 Grid) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '768px' }}>
          {/* Top Row: Slots 1, 2, 3, 4 */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            {topRowSlots.map((manga, idx) => (
              <div
                key={`top-${idx}`}
                style={{
                  width: '180px',
                  height: '275px',
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
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
                      {idx + 1}
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
                    {manga ? manga.title : '本のタイトル'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Row: Slots 6, 7, 8, 9 */}
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            {bottomRowSlots.map((manga, idx) => (
              <div
                key={`bottom-${idx}`}
                style={{
                  width: '180px',
                  height: '275px',
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
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
                      {idx + 6}
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
                    {manga ? manga.title : '本のタイトル'}
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
