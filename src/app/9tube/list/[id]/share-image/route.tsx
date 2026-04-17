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

  // フォントデータの取得
  const fontData = await getFontData(request.url);

  // 全ての画像を Data URL 化 (並列・個別にエラー遮断)
  const imageUrls = await Promise.all(
    slots.map(async (slot) => {
      if (!slot?.imageUrl) return null;
      try {
        // 外部 Fetch タイムアウトを 3 秒に設定
        const result = await getBase64Image(slot.imageUrl, 3000);
        if (!result.success) {
          console.warn(`[9TUBE-Share] Image converted but success is false: ${slot.imageUrl}`);
        }
        return result.success ? result.dataUrl : null;
      } catch (error) {
        console.error(`[9TUBE-Share] Failed to fetch/convert image: ${slot.imageUrl}`, error);
        return null;
      }
    })
  );

  // --- [設定エリア: サイズ /余白] ---
  const width = 800;   // 1200 -> 800
  const height = 1000;  // 1500 -> 1000
  const padding = 20;   // 30 -> 20
  const gap = 14;       // 20 -> 14
  const gridWidth = width - padding * 2;
  const itemWidth = Math.floor((gridWidth - gap * 2) / 3); // 1コマの横幅
  const itemHeight = itemWidth; // 正方形を維持

  // テキスト切り捨て関数（表示崩れ防止用）
  const truncate = (str: string, len: number) => {
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: colorTheme.bg, // Firestoreで選択されたテーマの背景色
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: `${padding}px`,
          fontFamily: 'Noto Sans JP',
          fontWeight: 900,
          position: 'relative',
        }}
      >
        {/* --- [A. ヘッダー領域]: サービスロゴとテーマ名 --- */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px',
          width: '100%',
        }}>
          {/* サービスタイトル "9TUBE" */}
          <div style={{
            display: 'flex',
            fontSize: '32px', // 48 -> 32
            fontWeight: 900,
            color: colorTheme.text,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            marginBottom: '4px'
          }}>{truncate(authorName, 20)} を構成する9つのYouTube</div>

          {/* テーマ名バッジ: ユーザーが入力した「テーマ」を強調 */}
          <div style={{
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: '7px 32px',
            borderRadius: '11px',
            fontSize: '24px', // 40 -> 24
            fontWeight: 900,
            boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
            border: `1.5px solid ${colorTheme.accent}44`
          }}>
            {theme || '私を構成する9つのYouTube'}
          </div>
        </div>

        {/* --- [B. グリッド領域]: 3x3のメインコンテンツ --- */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
          width: `${gridWidth}px`,
          marginBottom: '20px'
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
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* [Layer 1]: 背面の引き伸ばし背景画像 / 178%に拡大して物理的にはみ出させることで隙間を完全に封殺 */}
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

                    {/* [Layer 2]: 背景の明度を下げる遮光レイヤー */}
                    {imageUrl && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${itemWidth}px`,
                        height: `${itemHeight}px`,
                        backgroundColor: 'rgba(0,0,0,0.6)', // 背景の主張を抑える
                      }} />
                    )}

                    {/* [Layer 3]: 前面の本体画像 / アスペクト比を維持(contain)して全体を表示 */}
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
                      // 画像がない場合の番号表示
                      <div style={{ display: 'flex', fontSize: '60px', color: 'rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}>{idx + 1}</div>
                    )}

                    {/* [Layer 4]: タイトルオーバーレイ / 下からグラデーションを敷いて文字の視認性を確保 */}
                    {slot?.title && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: `${itemWidth}px`,
                        padding: '10px 7px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}>
                        <div style={{
                          display: 'flex',
                          color: 'white',
                          fontSize: '12px', // 18 -> 12
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

        {/* --- [C. フッター領域]: 作者名とURLのクレジット --- */}
        <div style={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px'
        }}>


          {/* サイトURL: 控えめな半透明度で表示 */}
          <div style={{
            display: 'flex',
            fontSize: '21px', // 32 -> 21
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
