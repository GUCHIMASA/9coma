/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getFontData, getBase64Image } from '@/lib/og-helper';
import type { YouTubeSlot } from '@/types/youtube';
import { COLOR_THEMES } from '@/lib/colors';

export const runtime = 'edge';

async function getListData(id: string) {
  try {
    const { db } = await import('@/lib/firebase');
    const { doc, getDoc } = await import('firebase/firestore/lite');
    const docRef = doc(db, '9tube_lists', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error('Error fetching YouTube list for Share Image:', error);
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await getListData(params.id);
  if (!data) return new Response('Not found', { status: 404 });

  const slots = data.slots as (YouTubeSlot | null)[];
  const authorName = data.authorName || '私';
  const theme = data.theme || '';
  const colorThemeId = data.colorThemeId || '01';
  const colorTheme = COLOR_THEMES[colorThemeId] || COLOR_THEMES['01'];

  // フォントデータの取得 (ガード付き)
  const fontData = await getFontData(request.url);

  // 全ての画像を Data URL 化
  const imageUrls = await Promise.all(
    slots.map(async (slot) => {
      if (!slot?.imageUrl) return null;
      try {
        const result = await getBase64Image(slot.imageUrl, 3000);
        return result.success ? result.dataUrl : null;
      } catch (error) {
        console.error(`[9TUBE-Share] Failed to fetch image: ${slot.imageUrl}`, error);
        return null;
      }
    })
  );

  // --- [設定エリア: サイズ / 余白] --- (1200x1500 高品質復元)
  const width = 1200;
  const height = 1500;
  const padding = 30;
  const gap = 20;
  const gridWidth = width - padding * 2;
  const itemWidth = Math.floor((gridWidth - gap * 2) / 3);
  const itemHeight = itemWidth;

  const truncate = (str: string, len: number) => {
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

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
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: colorTheme.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: `${padding}px`,
          fontFamily: 'Noto Sans JP',
          fontWeight: 900,
          position: 'relative',
        }}
      >
        {/* A. ヘッダー領域 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '30px',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            fontSize: '48px',
            fontWeight: 900,
            color: colorTheme.text,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '6px'
          }}>{truncate(authorName, 20)} を構成する9つのYouTube</div>

          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '10px 48px',
            borderRadius: '16px',
            fontSize: '40px',
            fontWeight: 900,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            border: `2px solid ${colorTheme.accent}44`
          }}>
            {theme || '私を構成する9つのYouTube'}
          </div>
        </div>

        {/* B. グリッド領域 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
          width: `${gridWidth}px`,
          marginBottom: '30px'
        }}>
          {[0, 1, 2].map(row => (
            <div key={row} style={{ display: 'flex', gap: `${gap}px` }}>
              {[0, 1, 2].map(col => {
                const idx = row * 3 + col;
                const imageUrl = imageUrls[idx];
                const slot = slots[idx];
                return (
                  <div
                    key={col}
                    style={{
                      width: `${itemWidth}px`,
                      height: `${itemHeight}px`,
                      backgroundColor: '#000',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        style={{
                          position: 'absolute',
                          top: '-39%',
                          left: '-39%',
                          width: '178%',
                          height: '178%',
                          zIndex: 0,
                        }}
                        alt=""
                      />
                    )}

                    {imageUrl && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${itemWidth}px`,
                        height: `${itemHeight}px`,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                      }} />
                    )}

                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        style={{
                          position: 'relative',
                          width: `${itemWidth}px`,
                          height: `${itemWidth}px`,
                          objectFit: 'contain',
                          zIndex: 1,
                        }}
                        alt=""
                      />
                    ) : (
                      <div style={{ display: 'flex', fontSize: '100px', color: 'rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}>{idx + 1}</div>
                    )}

                    {slot?.title && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: `${itemWidth}px`,
                        padding: '14px 10px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}>
                        <div style={{
                          display: 'flex',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          textAlign: 'center',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                        }}>
                          {truncate(slot.title, 36)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* C. フッター領域 */}
        <div style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}>
          <div style={{
            display: 'flex',
            fontSize: '32px',
            color: colorTheme.text,
            opacity: 0.5,
            marginTop: 'auto',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            https://9coma.com/9tube
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts,
      headers: {
        'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate=59, max-age=31536000, immutable',
      },
    }
  );
}
