/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { COLOR_THEMES } from '@/lib/colors';
import { getFontData } from '@/lib/og-helper';

export const runtime = 'edge';

export const alt = '9coma | 私を構成する9つのマンガ';
export const size = {
  width: 600,
  height: 315,
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

  // フォントのサブセット化用テキストの収集
  const allText = [
    data.theme,
    '＃',
    '私を構成する9つのマンガ',
    ...data.slots.map(s => s?.title || ''),
  ].join('');
  const subsetText = Array.from(new Set(allText)).join('');
  const fontData = await getFontData(subsetText);

  const centerSlot = data.slots[4];

  // レイアウト定数 (600x315)
  const padding = 16;
  const leftColWidth = 165;
  const horizontalGap = 16;
  const rightGridGap = 10;

  // フォントガード
  const fonts = fontData ? [
    {
      name: 'Noto Sans JP',
      data: fontData,
      style: 'normal' as const,
      weight: 900 as const,
    },
  ] : [];

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
          fontFamily: 'Noto Sans JP',
          fontWeight: 900,
        }}
      >
        {/* Left Column (Badge + Slot 5) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: `${leftColWidth}px` }}>
          {/* Badge (Header Area) */}
          <div
            style={{
              width: '100%',
              height: '25px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
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
              height: '235px',
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              display: 'flex',
              borderRadius: '4px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            {centerSlot?.imageUrl ? (
              <img
                src={centerSlot.imageUrl}
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
                  fontSize: '60px',
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
                padding: '20px 8px 6px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)',
                color: 'white',
                fontSize: '8px',
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
            {[0, 1, 2, 3].map((idx) => {
              const manga = data.slots[idx];
              const imageUrl = manga?.imageUrl;
              return (
                <div
                  key={idx}
                  style={{
                    width: '87px',
                    height: '130px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 2px 7px rgba(0,0,0,0.15)',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
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
                        fontSize: '24px',
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
                      padding: '15px 4px 4px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      fontSize: '5px',
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
            {[5, 6, 7, 8].map((actualIdx) => {
              const manga = data.slots[actualIdx];
              const imageUrl = manga?.imageUrl;
              return (
                <div
                  key={actualIdx}
                  style={{
                    width: '87px',
                    height: '130px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 2px 7px rgba(0,0,0,0.15)',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
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
                        fontSize: '24px',
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
                      padding: '15px 4px 4px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                      color: 'white',
                      fontSize: '5px',
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
      width: size.width,
      height: size.height,
      fonts,
      headers: {
        'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=59, max-age=31536000, immutable',
      },
    }
  );
}
