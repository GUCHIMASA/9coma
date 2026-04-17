/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { NextResponse } from 'next/server';
import { getFontData, getBase64Image } from '@/lib/og-helper';
import { COLOR_THEMES } from '@/lib/colors';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const { searchParams } = new URL(request.url);
  const isDebug = searchParams.get('debug') === '1';

  try {
    const data = await getListById(id);
    if (!data) return new Response('Not found', { status: 404 });

    // フォントデータの取得 (リクエストURLからベースURLを自動特定)
    const fontData = await getFontData(request.url);

    if (isDebug) {
      return NextResponse.json({
        id,
        colorThemeId: data.colorThemeId,
        theme: data.theme,
        authorName: data.authorName
      });
    }

    // 配色の取得
    const theme = COLOR_THEMES[data.colorThemeId || '01'] || COLOR_THEMES['01'];
    const themeBg = theme.bg;
    const textColor = theme.text;
    const isDark = textColor === '#FFFFFF';

    // すべてのスロットの画像を Data URL 化（並列実行・個別にエラー遮断）
    const imageUrls = await Promise.all(
      data.slots.map(async (manga) => {
        if (!manga?.imageUrl) return null;
        try {
          // 個別の try-catch で保護し、1枚のエラーが全体を落とさないようにする
          const result = await getBase64Image(manga.imageUrl);
          return result.success ? result.dataUrl! : null;
        } catch (e) {
          console.error(`[ShareImage] Failed to fetch slot: ${manga.imageUrl}`, e);
          return null;
        }
      })
    );

    // --- [設定エリア: サイズ /余白] ---
    const width = 800;   // 1200 -> 800 (1MB制限回避)
    const height = 1000;  // 1500 -> 1000
    const padding = 14;   // 20 -> 14
    const gridGap = 8;    // 12 -> 8
    const headerHeight = 40; // 60 -> 40
    const headerToGridGap = 7; // 10 -> 7

    // グリッドエリアの計算
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2 - headerHeight - headerToGridGap;
    
    const cellWidth = (innerWidth - gridGap * 2) / 3;
    const cellHeight = (innerHeight - gridGap * 2) / 3;

    const boxBorderRadius = '3px';
    const shadowColor = 'rgba(0,0,0,0.2)';

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
        }}>
          {/* Header Area */}
          <div
            style={{
              width: '100%',
              height: `${headerHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: `${headerToGridGap}px`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px', // 36 -> 24
                fontWeight: 900,
                color: textColor,
                letterSpacing: '0.01em',
              }}
            >
              {data.authorName && (
                <span style={{ fontSize: '20px', opacity: 0.8, fontWeight: 700, marginRight: '10px' }}>
                  {data.authorName}を構成する9つのマンガ
                </span>
              )}
              {data.theme ? `${data.theme}編` : (data.authorName ? '' : '私を構成する9つのマンガ')}
            </div>
          </div>

          {/* 3x3 Grid Area */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${gridGap}px`,
          }}>
            {[0, 1, 2].map(row => (
              <div key={row} style={{ display: 'flex', gap: `${gridGap}px` }}>
                {[0, 1, 2].map(col => {
                  const idx = row * 3 + col;
                  const manga = data.slots[idx];
                  const imgUrl = imageUrls[idx];

                  return (
                    <div key={idx} style={{
                      width: `${cellWidth}px`,
                      height: `${cellHeight}px`,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      display: 'flex',
                      borderRadius: boxBorderRadius,
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: `0 5px 20px ${shadowColor}`,
                    }}>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          alt=""
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '7px',
                          textAlign: 'center',
                          fontSize: '50px', // 80 -> 50
                          fontWeight: 900,
                          color: textColor,
                          opacity: 0.2
                        }}>
                          {idx + 1}
                        </div>
                      )}
                      {manga?.title && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          padding: '40px 10px 14px', // 60 16 20 -> 40 10 14
                          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0) 100%)',
                          color: 'white',
                          fontSize: '13px', // 20 -> 13
                          fontWeight: 800,
                          textAlign: 'center',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        }}>
                          <div style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
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

          {/* Footer */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            <div style={{
              display: 'flex',
              fontSize: '18px',
              fontWeight: 900,
              color: textColor,
              opacity: 0.3,
              letterSpacing: '0.05em'
            }}>9coma.com</div>
          </div>
        </div>
      ),
      {
        width,
        height,
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
  } catch (error) {
    console.error(`[VerticalShare] Error:`, error);
    return new Response('Internal error', { status: 500 });
  }
}
