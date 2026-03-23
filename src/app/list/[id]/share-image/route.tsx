/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { NextResponse } from 'next/server';
import { getFontData, getBase64Image } from '@/lib/og-helper';
import { COLOR_THEMES } from '@/lib/colors';

export const runtime = 'nodejs';

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

    // フォントデータの取得
    const fontData = await getFontData();

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

    // すべてのスロットの画像を Data URL 化（並列実行）
    const imageUrls = await Promise.all(
      data.slots.map(async (manga) => {
        if (manga?.imageUrl) {
          const result = await getBase64Image(manga.imageUrl);
          return result.success ? result.dataUrl! : null;
        }
        return null;
      })
    );

    // レイアウト定数 (720x1280 の中で最高のバランスを追求)
    const headerHeight = 50;
    const headerToGridGap = 10;
    const gridGap = 12;
    const coverHeight = 285; 
    const coverWidth = 218;
    
    // 全体位置調整: 上部見切れを防ぐ 160px を維持しつつ、下辺を理想の位置へ
    const marginTop = 160; 

    return new ImageResponse(
      (
        <div style={{ 
          width: '720px', 
          height: '1280px', 
          display: 'flex', 
          flexDirection: 'column', 
          backgroundColor: themeBg, 
          color: textColor,
          position: 'relative'
        }}>
          {/* Main Content Area */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            marginTop: `${marginTop}px`
          }}>
            {/* Header (Single Line) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              height: `${headerHeight}px`, 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center',
              width: '678px',
              marginBottom: `${headerToGridGap}px`
            }}>
              <div style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1, margin: 0, display: 'flex', alignItems: 'center' }}>
                <span style={{ opacity: 0.8, fontWeight: 400, marginRight: '8px' }}>
                  {data.theme ? `${data.authorName}を構成する9つのマンガ` : `${data.authorName}を構成する`}
                </span>
                {data.theme || '9つのマンガ'}
              </div>
            </div>

            {/* Grid Area */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `${gridGap}px`,
              alignItems: 'center'
            }}>
              {[0, 1, 2].map(row => (
                <div key={row} style={{ display: 'flex', gap: `${gridGap}px` }}>
                  {[0, 1, 2].map(col => {
                    const idx = row * 3 + col;
                    const manga = data.slots[idx];
                    const imgUrl = imageUrls[idx];
                    const isCenter = idx === 4;
                    
                    return (
                      <div key={idx} style={{ 
                        width: `${coverWidth}px`, 
                        height: `${coverHeight}px`, 
                        backgroundColor: isCenter ? 'rgba(244, 143, 177, 0.15)' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'), 
                        display: 'flex', 
                        borderRadius: '4px', 
                        overflow: 'hidden', 
                        position: 'relative',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                        border: 'none'
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
                            padding: '10px', 
                            textAlign: 'center', 
                            fontSize: '18px', 
                            color: textColor,
                            opacity: 0.3
                          }}>
                            {manga?.imageUrl ? 'LOADING...' : (idx + 1)}
                          </div>
                        )}
                        {manga?.title && (
                          <div style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            width: '100%', 
                            padding: '40px 8px 12px', 
                            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0) 100%)',
                            color: 'white', 
                            fontSize: '14px', 
                            textAlign: 'center', 
                            lineHeight: 1.2, 
                            display: 'flex', 
                            justifyContent: 'center',
                            alignItems: 'flex-end'
                          }}>
                            <div style={{ 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                              fontWeight: 700
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
          </div>






          {/* Footer - Always at bottom */}
          <div style={{ 
            position: 'absolute',
            bottom: '40px',
            left: 0,
            width: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '48px', fontWeight: 900, margin: 0, padding: 0, lineHeight: 1 }}>9コマ</div>
            <div style={{ fontSize: '20px', opacity: 0.6, margin: '4px 0', fontWeight: 700 }}>https://9coma.com</div>
          </div>
        </div>
      ),
      {
        width: 720,
        height: 1280,
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

