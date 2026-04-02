/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { COLOR_THEMES } from '@/lib/colors';
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

  // 配色システムの適用
  const themeId = data.colorThemeId || '01';
  const theme = COLOR_THEMES[themeId] || COLOR_THEMES['01'];
  const themeBg = theme.bg;
  const textColor = theme.text;
  const isDark = themeId === '02' || themeId === '03' || themeId === '05' || themeId === '07' || themeId === '09' || themeId === '11';

  // フォントとデータの取得
  const fontData = await getFontData();

  try {
    // すべてのスロットの画像を Data URL 化（並列実行）
    const imageUrls = await Promise.all(
      data.slots.map(async (manga, idx) => {
        if (manga?.imageUrl) {
          try {
            // タイムアウト3秒を設定し、エラー時は個別にnullを返す
            const result = await getBase64Image(manga.imageUrl, 3000);
            return result.success ? result.dataUrl : null;
          } catch (error) {
            console.error(`[Manga-OGP] Failed slot ${idx + 1}:`, error);
            return null;
          }
        }
        return null;
      })
    );

    const topRowImageUrls = imageUrls.slice(0, 4);
    const bottomRowImageUrls = imageUrls.slice(5, 9);
    const centerImageUrl = imageUrls[4];
    const centerSlot = data.slots[4];

    // レイアウト定数
    const padding = 32;
    const leftColWidth = 350;
    const horizontalGap = 30;
    const rightGridGap = 16;
    const rightColWidth = 1200 - padding * 2 - leftColWidth - horizontalGap; // 756
    
    const boxBorderRadius = '6px';
    const shadowColor = 'rgba(0,0,0,0.15)';

    // 垂直パッキングの再計算: 左側の全高 (Badge: 52 + Gap: 16 + Box5: 498 = 566)
    const leftTotalHeight = 52 + 16 + 498; 
    // 右側の各ボックスの高さ: (566 - gap) / 2 = 275px
    const rightBoxHeight = (leftTotalHeight - rightGridGap) / 2;

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: `${leftColWidth}px`, height: `${leftTotalHeight}px` }}>
            {/* Badge (Header Area) */}
            <div
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                borderRadius: '99px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
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
                height: '498px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                borderRadius: boxBorderRadius,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `0 8px 24px ${shadowColor}`,
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
                    fontSize: '120px',
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
                  padding: '50px 16px 16px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                  color: 'white',
                  fontSize: '18px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${rightGridGap}px`, width: `${rightColWidth}px`, height: `${leftTotalHeight}px` }}>
            {/* Top Row (1, 2, 3, 4) */}
            <div style={{ display: 'flex', gap: `${rightGridGap}px` }}>
              {topRowImageUrls.map((imgUrl, idx) => {
                const manga = data.slots[idx];
                return (
                  <div
                    key={idx}
                    style={{
                      width: '177px',
                      height: `${rightBoxHeight}px`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      display: 'flex',
                      borderRadius: boxBorderRadius,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: `0 6px 16px ${shadowColor}`,
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
                          fontSize: '48px',
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
                        padding: '30px 8px 8px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                        color: 'white',
                        fontSize: '11px',
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
                      width: '177px',
                      height: `${rightBoxHeight}px`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      display: 'flex',
                      borderRadius: boxBorderRadius,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: `0 6px 16px ${shadowColor}`,
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
                          fontSize: '48px',
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
                        padding: '30px 8px 8px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
                        color: 'white',
                        fontSize: '11px',
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
        ...size,
        fonts: fontData ? [
          {
            name: 'Noto Sans JP',
            data: fontData,
            style: 'normal' as const,
            weight: 900 as const,
          },
        ] : [],
        headers: {
          'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=59, max-age=31536000, immutable',
        },
      }
    );
  } catch (error) {
    console.error('[OGP-Manga] Fatal generation error:', error);
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
          9coma | 私を構成する9つのマンガ
        </div>
      ),
      { ...size }
    );
  }
}
