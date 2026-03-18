import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { THEME_GRADIENTS } from '@/lib/themes';
import { getFontData, getBase64Image } from '@/lib/og-helper';

export const runtime = 'nodejs';

export const alt = '9coma | 私を構成する9つのマンガ';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const data = await getListById(params.id);
  if (!data) return new Response('Not found', { status: 404 });

  // フォントとデータの取得
  const fontData = await getFontData();

  // すべてのスロットの画像を Data URL 化（並列実行）
  const imageUrls = await Promise.all(
    data.slots.map(async (manga) => {
      if (manga?.imageUrl) {
        const result = await getBase64Image(manga.imageUrl);
        return result.success ? result.dataUrl : null;
      }
      return null;
    })
  );

  const topRowImageUrls = imageUrls.slice(0, 4);
  const bottomRowImageUrls = imageUrls.slice(5, 9);
  const centerImageUrl = imageUrls[4];
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
              letterSpacing: '0.1em',
            }}
          >
            {data.theme ? `＃${data.theme}` : '私を構成する9つのマンガ'}
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
              {centerImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={centerImageUrl}
                  alt={centerSlot?.title}
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
                height: '40px',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
              }}
            >
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {centerSlot?.title || '本のタイトル'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Grid 2x4) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '768px' }}>
          {/* Top Row (1, 2, 3, 4) */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {topRowImageUrls.map((imgUrl, idx) => {
              const manga = data.slots[idx];
              return (
                <div
                  key={idx}
                  style={{
                    width: '180px',
                    height: '241px',
                    background: '#FFFFFF',
                    border: '3px solid #1A1A1A',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={manga?.title}
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
                          color: '#999',
                          fontSize: '48px',
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
                      padding: '2px 8px',
                      height: '32px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {manga?.title || '本のタイトル'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Row (6, 7, 8, 9) */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {bottomRowImageUrls.map((imgUrl, idx) => {
              const actualIdx = idx + 5;
              const manga = data.slots[actualIdx];
              return (
                <div
                  key={actualIdx}
                  style={{
                    width: '180px',
                    height: '241px',
                    background: '#FFFFFF',
                    border: '3px solid #1A1A1A',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={manga?.title}
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
                          color: '#999',
                          fontSize: '48px',
                          fontWeight: 900,
                        }}
                      >
                        {actualIdx + 1}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      background: '#1A1A1A',
                      color: '#FFFFFF',
                      padding: '2px 8px',
                      height: '32px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {manga?.title || '本のタイトル'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          style: 'normal',
          weight: 900,
        },
      ],
      headers: {
        'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=59, max-age=31536000, immutable',
      },
    }
  );
}
