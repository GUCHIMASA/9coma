/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { getFontData } from '@/lib/og-helper';
import { COLOR_THEMES } from '@/lib/colors';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const data = await getListById(id);
    if (!data) return new Response('Not found', { status: 404 });

    // フォントのサブセット化用テキストの収集
    const allText = [
      data.authorName,
      'を構成する9つのマンガ',
      data.theme,
      '編',
      '私を構成する9つのマンガ',
      ...data.slots.map(s => s?.title || ''),
      '9coma.com'
    ].join('');
    // 重複文字を削除して軽量化
    const subsetText = Array.from(new Set(allText)).join('');
    const fontData = await getFontData(subsetText);

    const theme = COLOR_THEMES[data.colorThemeId || '01'] || COLOR_THEMES['01'];
    const themeBg = theme.bg;
    const textColor = theme.text;
    const isDark = textColor === '#FFFFFF';

    // --- [設定エリア: サイズ / 余白] --- (600x750 段階テスト Step 3)
    const width = 600;
    const height = 750;
    const padding = 11;
    const gridGap = 6;
    const headerHeight = 30;
    const headerToGridGap = 5;

    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2 - headerHeight - headerToGridGap;

    const cellWidth = (innerWidth - gridGap * 2) / 3;
    const cellHeight = (innerHeight - gridGap * 2) / 3;

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
        <div style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: themeBg,
          color: textColor,
          padding: `${padding}px`,
          fontFamily: 'Noto Sans JP',
          fontWeight: 900,
          position: 'relative',
        }}>
          <div style={{
            width: '100%',
            height: `${headerHeight}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: `${headerToGridGap}px`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 900,
              color: textColor,
              letterSpacing: '0.02em',
            }}>
              {data.authorName && (
                <span style={{ fontSize: '17px', opacity: 0.8, fontWeight: 700, marginRight: '7px' }}>
                  {data.authorName}を構成する9つのマンガ
                </span>
              )}
              {data.theme ? `${data.theme}編` : (data.authorName ? '' : '私を構成する9つのマンガ')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: `${gridGap}px` }}>
            {[0, 1, 2].map(row => (
              <div key={row} style={{ display: 'flex', gap: `${gridGap}px` }}>
                {[0, 1, 2].map(col => {
                  const idx = row * 3 + col;
                  const manga = data.slots[idx];
                  const imageUrl = manga?.imageUrl;
                  return (
                    <div key={idx} style={{
                      width: `${cellWidth}px`,
                      height: `${cellHeight}px`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      display: 'flex',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                    }}>
                      {imageUrl ? (
                        <img src={imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '38px', fontWeight: 900, color: textColor, opacity: 0.2,
                        }}>{idx + 1}</div>
                      )}
                      {manga?.title && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, width: '100%',
                          padding: '30px 7px 9px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)',
                          color: 'white', fontSize: '11px', fontWeight: 800,
                          textAlign: 'center', display: 'flex',
                          justifyContent: 'center', alignItems: 'flex-end',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
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
            ))}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ display: 'flex', fontSize: '14px', fontWeight: 900, color: textColor, opacity: 0.4, letterSpacing: '0.05em' }}>
              9coma.com
            </div>
          </div>
        </div>
      ),
      {
        width, height, fonts,
        headers: { 'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=59, max-age=31536000, immutable' },
      }
    );
  } catch (error) {
    console.error(`[VerticalShare] Error:`, error);
    return new Response('Internal error', { status: 500 });
  }
}
