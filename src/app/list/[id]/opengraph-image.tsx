/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { COLOR_THEMES } from '@/lib/colors';
import { getFontData, getBase64Image } from '@/lib/og-helper';

export const runtime = 'edge';

export const alt = '9coma | 私を構成する9つのマンガ';
export const size = {
  width: 800,  // 1200 -> 800
  height: 420, // 630 -> 420
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const data = await getListById(params.id);
  if (!data) return new Response('Not found', { status: 404 });

  // 配色システムの適用
  const themeId = data.colorThemeId || '01';
  const theme = COLOR_THEMES[themeId] || COLOR_THEMES['01'];
  const themeBg = theme.bg;
  const textColor = theme.text;
  const isDark = themeId === '02' || themeId === '03' || themeId === '05' || themeId === '07' || themeId === '09' || themeId === '11';

  // フォントとデータの取得
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentUrl = `${baseUrl}/list/${params.id}/opengraph-image`;
  const fontData = await getFontData(currentUrl);

  // すべてのスロットの画像を Data URL 化（並列実行・個別にエラー遮断）
  const imageUrls = await Promise.all(
    data.slots.map(async (manga) => {
      if (!manga?.imageUrl) return null;
      try {
        const result = await getBase64Image(manga.imageUrl);
        return result.success ? result.dataUrl : null;
      } catch (e) {
        console.error(`[OGImage] Failed to fetch slot: ${manga.imageUrl}`, e);
        return null;
      }
    })
  );

  const topRowImageUrls = imageUrls.slice(0, 4);
  const bottomRowImageUrls = imageUrls.slice(5, 9);
  const centerImageUrl = imageUrls[4];
  const centerSlot = data.slots[4];

  // レイアウト定数 (1200 -> 800 向けに 0.66倍程度に調整)
  const padding = 20; // 32 -> 20
  const leftColWidth = 220; // 330 -> 220
  const horizontalGap = 20; // 32 -> 20
  const rightGridGap = 12; // 20 -> 12

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: themeBg,
          color: textColor,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${padding}px`,
          gap: `${horizontalGap}px`,
        }}
      >
        {/* Left Column (Badge + Slot 5) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: `${leftColWidth}px` }}>
          {/* Badge (Header Area) */}
          <div
            style={{
              width: '100%',
              height: '34px', // 50 -> 34
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px', // 20 -> 13
              fontWeight: 900,
              color: textColor,
            }}
          >
            {data.theme ? `＃${data.theme}` : '私を構成する9つのマンガ'}
          </div>

          {/* Large Box (Slot 5) */}
          <div
            style={{
              width: '100%',
              height: '310px', // 470 -> 310
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              display: 'flex',
              borderRadius: '6px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            }}
          >
            {centerImageUrl ? (
              <img
                src={centerImageUrl}
                alt={centerSlot?.title || ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: textColor,
                  opacity: 0.2,
                  fontSize: '80px', // 120 -> 80
                  fontWeight: 900,
                }}
              >
                5
              </div>
            )}
            {centerSlot?.title && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                padding: '28px 10px 8px', // 40 16 12 -> 28 10 8
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                color: 'white',
                fontSize: '10px', // 16 -> 10
                fontWeight: 800,
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {centerSlot.title}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Grid 2x4) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${rightGridGap}px` }}>
          {/* Top Row (1, 2, 3, 4) */}
          <div style={{ display: 'flex', gap: `${rightGridGap}px` }}>
            {topRowImageUrls.map((imgUrl, idx) => {
              const manga = data.slots[idx];
              return (
                <div
                  key={idx}
                  style={{
                    width: '116px', // 175 -> 116
                    height: '172px', // 260 -> 172
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={manga?.title || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: textColor,
                        opacity: 0.2,
                        fontSize: '32px', // 48 -> 32
                        fontWeight: 900,
                      }}
                    >
                      {idx + 1}
                    </div>
                  )}
                  {manga?.title && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '20px 6px 6px', // 30 8 8 -> 20 6 6
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      fontSize: '8px', // 11 -> 8
                      fontWeight: 700,
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                    }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {manga.title}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Row (6, 7, 8, 9) */}
          <div style={{ display: 'flex', gap: `${rightGridGap}px` }}>
            {bottomRowImageUrls.map((imgUrl, idx) => {
              const actualIdx = idx + 5;
              const manga = data.slots[actualIdx];
              return (
                <div
                  key={actualIdx}
                  style={{
                    width: '116px', // 175 -> 116
                    height: '172px', // 260 -> 172
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                  }}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={manga?.title || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: textColor,
                        opacity: 0.2,
                        fontSize: '32px', // 48 -> 32
                        fontWeight: 900,
                      }}
                    >
                      {actualIdx + 1}
                    </div>
                  )}
                  {manga?.title && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      padding: '20px 6px 6px', // 30 8 8 -> 20 6 6
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      fontSize: '8px', // 11 -> 8
                      fontWeight: 700,
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'flex-end',
                    }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {manga.title}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      width: 800,  // size.width
      height: 420, // size.height
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
