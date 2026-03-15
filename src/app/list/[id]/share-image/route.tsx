import { ImageResponse } from 'next/og';
import { getListById } from '@/lib/list';
import QRCode from 'qrcode';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const data = await getListById(id);
    if (!data) return new Response('Not found', { status: 404 });

    // QRコードの生成
    const listUrl = `https://9coma.com/list/${id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(listUrl, { margin: 1, width: 200 });

    // ユーザー指定の「黄色背景・黒テキスト」を適用
    const themeBg = '#ffdd00'; 
    const textColor = '#000000';

    return new ImageResponse(
      (
        <div style={{ width: '720px', height: '1280px', display: 'flex', flexDirection: 'column', backgroundColor: themeBg, padding: '20px', color: textColor, justifyContent: 'space-between' }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '160px', justifyContent: 'center', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', opacity: 0.8, marginBottom: '4px', fontWeight: 400, margin: 0 }}>
              {data.authorName}を構成する9つのマンガ
            </h1>
            <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
              {data.theme || '9つのマンガ'}
            </h1>
          </div>

          {/* Grid Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '4px', justifyContent: 'center' }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2].map((idx) => {
                const manga = data.slots[idx];
                return (
                  <div key={idx} style={{ width: '224px', height: '304px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {manga?.imageUrl && <img src={manga.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4px 6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '13px', textAlign: 'center', lineHeight: 1.2 }}>
                        {manga.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[3, 4, 5].map((idx) => {
                const manga = data.slots[idx];
                return (
                  <div key={idx} style={{ width: '224px', height: '304px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {manga?.imageUrl && <img src={manga.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4px 6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '13px', textAlign: 'center', lineHeight: 1.2 }}>
                        {manga.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 3 */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[6, 7, 8].map((idx) => {
                const manga = data.slots[idx];
                return (
                  <div key={idx} style={{ width: '224px', height: '304px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {manga?.imageUrl && <img src={manga.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4px 6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '13px', textAlign: 'center', lineHeight: 1.2 }}>
                        {manga.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', width: '100%', height: '160px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: '64px', fontWeight: 800, margin: 0, padding: 0, lineHeight: 1 }}>9コマ</p>
              <p style={{ fontSize: '20px', opacity: 0.6, margin: '4px 0', marginBottom: '8px' }}>https://9coma.com</p>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, fontWeight: 700 }}>Data from Rakuten Books - Powered by 9coma.com</p>
            </div>
            <div style={{ display: 'flex', padding: '8px', backgroundColor: 'white', borderRadius: '12px', border: '3px solid #000' }}>
              <img src={qrCodeDataUrl} style={{ width: '120px', height: '120px' }} />
            </div>
          </div>
        </div>
      ),
      {
        width: 720,
        height: 1280,
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
