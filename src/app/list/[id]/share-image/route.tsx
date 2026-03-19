import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import { NextResponse } from 'next/server';
import { getFontData, getBase64Image } from '@/lib/og-helper';

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

    // フォントと画像データの取得
    const fontData = await getFontData();

    if (isDebug) {
      const testManga = data.slots.find(s => s?.imageUrl);
      if (!testManga) return NextResponse.json({ error: 'No manga with image found in this list' });
      const result = await getBase64Image(testManga.imageUrl!);
      return NextResponse.json({
        id,
        testUrl: testManga.imageUrl,
        fontDataSize: fontData.byteLength,
        result: result.success ? { success: true, size: result.size, base64Start: result.dataUrl?.substring(0, 50) + '...' } : result
      });
    }

    // ユーザー指定の「黄色背景・黒テキスト」を適用
    const themeBg = '#ffdd00'; 
    const textColor = '#000000';

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

    return new ImageResponse(
      (
        <div style={{ width: '720px', height: '1280px', display: 'flex', flexDirection: 'column', backgroundColor: themeBg, padding: '40px', color: textColor, justifyContent: 'space-between' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '150px', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', opacity: 0.8, marginBottom: '8px', fontWeight: 400, margin: 0, display: 'flex', justifyContent: 'center' }}>
              {data.theme ? `${data.authorName}を構成する9つのマンガ` : `${data.authorName}を構成する`}
            </div>
            <div style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1.1, margin: 0, display: 'flex', justifyContent: 'center' }}>
              {data.theme || '9つのマンガ'}
            </div>
          </div>

          {/* Grid Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '6px', justifyContent: 'center' }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0, 1, 2].map((idx) => {
                const manga = data.slots[idx];
                const imgUrl = imageUrls[idx];
                return (
                  <div key={idx} style={{ width: '220px', height: '300px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {imgUrl ? (
                      <img 
                        src={imgUrl} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt=""
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999', backgroundColor: '#222' }}>
                        {manga?.imageUrl ? 'FETCH FAILED' : 'NO IMAGE'}
                      </div>
                    )}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '14px', textAlign: 'center', lineHeight: 1.2, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manga.title}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[3, 4, 5].map((idx) => {
                const manga = data.slots[idx];
                const imgUrl = imageUrls[idx];
                return (
                  <div key={idx} style={{ width: '220px', height: '300px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {imgUrl ? (
                      <img 
                        src={imgUrl} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt=""
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999', backgroundColor: '#222' }}>
                        {manga?.imageUrl ? 'FETCH FAILED' : 'NO IMAGE'}
                      </div>
                    )}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '14px', textAlign: 'center', lineHeight: 1.2, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manga.title}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 3 */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[6, 7, 8].map((idx) => {
                const manga = data.slots[idx];
                const imgUrl = imageUrls[idx];
                return (
                  <div key={idx} style={{ width: '220px', height: '300px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {imgUrl ? (
                      <img 
                        src={imgUrl} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', textAlign: 'center', fontSize: '12px', color: '#999', backgroundColor: '#222' }}>
                        {manga?.imageUrl ? 'FETCH FAILED' : 'NO IMAGE'}
                      </div>
                    )}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '6px 8px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '14px', textAlign: 'center', lineHeight: 1.2, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{manga.title}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer - QRなしでシンプルに */}
          <div style={{ display: 'flex', width: '100%', height: '180px', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '72px', fontWeight: 900, margin: 0, padding: 0, lineHeight: 1 }}>9コマ</div>
              <div style={{ fontSize: '24px', opacity: 0.8, margin: '8px 0', fontWeight: 700 }}>https://9coma.com</div>
            </div>
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
