/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getFontData, getBase64Image } from '@/lib/og-helper';
import type { YouTubeSlot } from '@/types/youtube';
import { COLOR_THEMES } from '@/lib/colors';

export const runtime = 'edge';

// --- [画像設定: 基本メタデータ] ---
export const alt = '9TUBE | 私を構成する9つのYouTube';
export const size = {
  width: 1200,
  height: 630, // OGP標準の1.91:1比率
};
const { width, height } = size;
export const contentType = 'image/png';

// Firestoreからデータを取得する関数 (Edge Runtime 対応: 動的インポート)
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
    console.error('Error fetching YouTube list for OGP:', error);
  }
  return null;
}

export default async function Image({ params }: { params: { id: string } }) {
  const data = await getListData(params.id);
  if (!data) return new Response('Not found', { status: 404 });

  const slots = data.slots as (YouTubeSlot | null)[];
  const authorName = data.authorName || '私';
  const theme = data.theme || '';
  const colorThemeId = data.colorThemeId || '01';
  const colorTheme = COLOR_THEMES[colorThemeId] || COLOR_THEMES['01'];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentUrl = `${baseUrl}/9tube/list/${params.id}/opengraph-image`;
  const fontData = await getFontData(currentUrl);

  // 全ての画像を Data URL 化 (並列処理で高速化)
  const imageUrls = await Promise.all(
    slots.map(async (slot) => {
      if (!slot?.imageUrl) return null;
      try {
        // 外部 Fetch タイムアウトを 3 秒に設定
        const result = await getBase64Image(slot.imageUrl, 3000);
        return result.success ? result.dataUrl : null;
      } catch (error) {
        console.error(`[OGP-Image] Failed to fetch ${slot.imageUrl}:`, error);
        return null;
      }
    })
  );

  // --- [設定エリア: 余白とサイズ] ---
  const padding = 24;  // 外周余白 (OGPは狭め)
  const gap = 12;      // コマ同士の隙間
  const gridWidth = width - padding * 2;
  const gridHeight = height - padding * 2;
  const itemWidth = Math.floor((gridWidth - gap * 2) / 3);
  const itemHeight = Math.floor((gridHeight - gap * 2) / 3);

  // テキスト切り捨て
  const truncate = (str: string, len: number) => {
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: colorTheme.bg,
          display: 'flex',
          padding: `${padding}px`,
          fontFamily: 'Noto Sans JP',
          fontWeight: 900,
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* --- [グリッド領域]: 3x3構成 --- */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${gap}px`,
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
        }}>
          {[0, 1, 2].map(row => (
            <div key={row} style={{ display: 'flex', gap: `${gap}px`, flex: 1 }}>
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
                    {/* [Layer 1: 画像本体] */}
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          zIndex: 1,
                        }}
                        alt=""
                      />
                    ) : (
                      <div style={{ display: 'flex', fontSize: '60px', color: 'rgba(255,255,255,0.1)', zIndex: 1 }}>{idx + 1}</div>
                    )}

                    {/* [Layer 4: タイトル] */}
                    {slot?.title && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        padding: '10px 8px',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}>
                        <div style={{
                          display: 'flex',
                          color: 'white',
                          fontSize: '15px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          textAlign: 'center',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                        }}>
                          {truncate(slot.title, 34)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* --- [オーバーレイ情報]: ヘッダーとフッターのエッセンスを凝縮 --- */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          padding: '0px',
          pointerEvents: 'none',
        }}>
          {/* OGP用のコンパクトなブランディングラベル */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colorTheme.bg,
            color: colorTheme.text,
            padding: '4px 24px',
            borderRadius: '99px',
            fontSize: '28px',
            lineHeight: 1,
            marginBottom: '12px'
          }}>
            {truncate(authorName, 15)}を構成する9つのYouTube │ {theme || '9TUBE'}
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
    }
  );
}
