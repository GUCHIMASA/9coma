/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from 'next/og';
import { getSelectionCountByAuthor, getListsByAuthor } from '@/lib/list';
import { ComicList } from '@/types';
import { getFontData } from '@/lib/og-helper';

// 高速動作とコスト削減のため Edge Runtime を使用
export const runtime = 'edge';

export const alt = '9coma | 著者別ページ';
export const size = {
  width: 600,
  height: 315,
};

export default async function Image({ params }: { params: { authorName: string } }) {
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

    // フォントのサブセット化用テキストの収集
    const allText = [
      authorName,
      '先生',
      'これまで投稿された皆さんの',
      totalSelectionCount.toString(),
      'コマを構成しています。',
      '9コマ (9coma.com)',
      '#9coma - 私を構成する9つのマンガ',
      ...displayLists.flatMap(l => (l.slots || []).map(s => (s as any)?.title || ''))
    ].join('');
    const subsetText = Array.from(new Set(allText)).join('');
    const fontData = await getFontData(subsetText);

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
            backgroundColor: '#FFD600', // サイトカラーの黄色
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: '300px',
            height: '300px',
            borderRadius: '150px',
            backgroundColor: '#FFEA00',
            opacity: 0.6,
            zIndex: 1,
          }} />

          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '230px',
            gap: '6px',
            background: '#1A1A1A',
            padding: '5px 12px',
            borderRadius: '99px',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 900,
            zIndex: 100,
          }}>
            9コマ (9coma.com)
          </div>

          <div style={{
            position: 'absolute',
            top: '55px',
            left: '24px',
            display: 'flex',
            flexDirection: 'column',
            width: '230px',
            alignItems: 'flex-end',
            zIndex: 100,
          }}>
            <div style={{
              fontSize: authorName.length > 10 ? '24px' : authorName.length > 7 ? '32px' : '42px',
              fontWeight: 900,
              color: '#1A1A1A',
              lineHeight: 1.25,
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              maxHeight: authorName.length > 10 ? '65px' : authorName.length > 7 ? '87px' : '115px',
              overflow: 'hidden',
              wordBreak: 'break-all',
            }}>
              {authorName}
            </div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#333333',
              marginTop: '0px',
              textAlign: 'right',
            }}>
              先生
            </div>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '24px',
            display: 'flex',
            flexDirection: 'column',
            width: '230px',
            background: '#1A1A1A',
            color: '#FFFFFF',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 6px 0 rgba(0,0,0,0.15)',
            zIndex: 100,
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8, marginBottom: '4px' }}>
              これまで投稿された皆さんの
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: '26px',
              fontWeight: 900,
            }}>
              <span style={{ color: '#FFD600', fontSize: '32px', marginRight: '6px' }}>{totalSelectionCount}</span> コマ
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8, marginTop: '4px', textAlign: 'right' }}>
              を構成しています。
            </div>
          </div>

          <div style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            display: 'flex',
            width: '320px',
            height: '300px',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}>
            {displayLists.map((list, index: number) => {
              const reverseIndex = displayLists.length - 1 - index;
              const offsetX = reverseIndex * 50 - 20;
              const offsetY = reverseIndex * -12;
              const rotate = (reverseIndex === 0) ? 0 : (reverseIndex * 4);
              const slots = list.slots || Array(9).fill(null);

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '190px',
                    height: '280px',
                    background: '#1A1A1A',
                    padding: '4px',
                    borderRadius: '8px',
                    boxShadow: '6px 6px 12px rgba(0,0,0,0.3)',
                    transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotate}deg)`,
                    zIndex: index + 10,
                    opacity: 1,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    width: '182px',
                    height: '272px',
                    gap: '2px',
                  }}>
                    {slots.slice(0, 9).map((slot, i: number) => {
                      const imageUrl = (slot as any)?.imageUrl;
                      return (
                        <div
                          key={i}
                          style={{
                            width: '59px',
                            height: '89px',
                            background: '#2A2A2A',
                            borderRadius: '2px',
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
                              fontSize: '12px',
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
            bottom: '16px',
            left: '24px',
            width: '300px',
            fontSize: '10px',
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
        fonts,
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
        fonts: [],
      }
    );
  }
}
