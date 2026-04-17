/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og';
import { getSelectionCountByAuthor, getListsByAuthor } from '@/lib/list';
import { ComicList } from '@/types';
import { getFontData, getBase64Image } from '@/lib/og-helper';

// 高速動作とコスト削減のため Edge Runtime を使用
export const runtime = 'edge';

export const alt = '9coma | 著者別ページ';
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { authorName: string } }) {
  // フォントとデータの取得 (ビルド時の環境変数またはリクエストURLから特定)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const currentUrl = `${baseUrl}/author/${params.authorName}/opengraph-image`;
  const fontData = await getFontData(currentUrl);

  try {
    const authorName = decodeURIComponent(params.authorName);

    // データの取得
    const [totalSelectionCount, lists] = await Promise.all([
      getSelectionCountByAuthor(authorName),
      getListsByAuthor(authorName, 3), // 複数表示用に3件取得
    ]);

    // 表示するリスト（最大3つ）
    const displayLists = lists.slice(0, 3);
    if (displayLists.length === 0) {
      displayLists.push({ id: 'dummy', slots: Array(9).fill(null), authorName: '', createdAt: Date.now() } as ComicList);
    }

    // すべてのリストのすべてのスロットの画像を Data URL 化（並列実行・個別にエラー遮断）
    const listsWithDataUrls = await Promise.all(
      displayLists.map(async (list) => {
        const slotsWithUrls = await Promise.all(
          (list.slots || Array(9).fill(null)).map(async (slot) => {
            const imageUrl = (slot && typeof slot === 'object' && slot.imageUrl) ? slot.imageUrl : null;
            if (imageUrl) {
              try {
                const result = await getBase64Image(imageUrl);
                return { ...slot, imageUrl: result.success ? result.dataUrl : null };
              } catch (e) {
                console.error(`[AuthorOG] Failed to fetch slot: ${imageUrl}`, e);
                return { ...slot, imageUrl: null };
              }
            }
            return slot;
          })
        );
        return { ...list, slots: slotsWithUrls };
      })
    );

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#FFD600', // サイトカラーの黄色
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            gap: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 背景装飾 */}
          <div style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: '600px',
            height: '600px',
            borderRadius: '300px',
            backgroundColor: '#FFEA00',
            opacity: 0.6,
            zIndex: 1,
          }} />

          {/* 固定配置：ロゴ */}
          <div style={{
            position: 'absolute',
            top: '48px',
            left: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '460px',
            gap: '12px',
            background: '#1A1A1A',
            padding: '10px 24px',
            borderRadius: '99px',
            color: '#FFFFFF',
            fontSize: '24px',
            fontWeight: 900,
            zIndex: 100,
          }}>
            9コマ (9coma.com)
          </div>

          {/* 固定配置：著者名エリア */}
          <div style={{
            position: 'absolute',
            top: '110px',
            left: '48px',
            display: 'flex',
            flexDirection: 'column',
            width: '460px',
            alignItems: 'flex-end',
            zIndex: 100,
          }}>
            <div style={{
              fontSize: authorName.length > 10 ? '48px' : authorName.length > 7 ? '64px' : '84px',
              fontWeight: 900,
              color: '#1A1A1A',
              lineHeight: 1.25,
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              maxHeight: authorName.length > 10 ? '130px' : authorName.length > 7 ? '175px' : '230px',
              overflow: 'hidden',
              wordBreak: 'break-all',
            }}>
              {authorName}
            </div>
            <div style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#333333',
              marginTop: '0px',
              textAlign: 'right',
            }}>
              先生
            </div>
          </div>

          {/* 固定配置：インサイトボックス */}
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '48px',
            display: 'flex',
            flexDirection: 'column',
            width: '460px',
            background: '#1A1A1A',
            color: '#FFFFFF',
            padding: '24px 32px',
            borderRadius: '24px',
            boxShadow: '0 12px 0 rgba(0,0,0,0.15)',
            zIndex: 100,
          }}>
            <div style={{ fontSize: '25px', fontWeight: 700, opacity: 0.8, marginBottom: '8px' }}>
              これまで投稿された皆さんの
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: '52px',
              fontWeight: 900,
            }}>
              <span style={{ color: '#FFD600', fontSize: '64px', marginRight: '12px' }}>{totalSelectionCount}</span> コマ
            </div>
            <div style={{ fontSize: '25px', fontWeight: 700, opacity: 0.8, marginTop: '8px', textAlign: 'right' }}>
              を構成しています。
            </div>
          </div>

          {/* 右側：複数コンテナのスタック表示 */}
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '32px',
            display: 'flex',
            width: '640px',
            height: '600px',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}>
            {listsWithDataUrls.map((list, index: number) => {
              const reverseIndex = listsWithDataUrls.length - 1 - index;
              const offsetX = reverseIndex * 100 - 40;
              const offsetY = reverseIndex * -24;
              const rotate = (reverseIndex === 0) ? 0 : (reverseIndex * 4);
              const slots = list.slots || Array(9).fill(null);

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '380px',
                    height: '560px',
                    background: '#1A1A1A',
                    padding: '8px',
                    borderRadius: '16px',
                    boxShadow: '12px 12px 24px rgba(0,0,0,0.3)',
                    transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotate}deg)`,
                    zIndex: index + 10,
                    opacity: 1,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    width: '364px',
                    height: '544px',
                    gap: '4px',
                  }}>
                    {slots.slice(0, 9).map((slot, i: number) => {
                      const imageUrl = (slot && typeof slot === 'object' && slot.imageUrl) ? slot.imageUrl : null;
                      return (
                        <div
                          key={i}
                          style={{
                            width: '118px',
                            height: '178px',
                            background: '#2A2A2A',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            display: 'flex',
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#555555',
                              fontSize: '24px',
                              fontWeight: 900,
                            }}>
                              {i + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '48px',
            width: '600px',
            fontSize: '20px',
            fontWeight: 700,
            color: '#1A1A1A',
            zIndex: 200,
            display: 'flex',
          }}>
            #9coma - 私を構成する9つのマンガ
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
    console.error('OGP Error:', error);
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', backgroundColor: '#FFD600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', fontWeight: 900 }}>9coma.com</div>,
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
      }
    );
  }
}
