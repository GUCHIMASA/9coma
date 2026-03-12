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
        <div style={{ width: '720px', height: '1280px', display: 'flex', flexDirection: 'column', backgroundColor: themeBg, padding: '40px', color: textColor }}>
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '200px', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '32px', opacity: 0.8, marginBottom: '8px', fontWeight: 400 }}>{data.authorName}を構成する</h1>
            <h1 style={{ fontSize: '56px', fontWeight: 800, lineHeight: 1.1 }}>{data.theme || '9つのマンガ'}</h1>
          </div>

          {/* Grid Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '800px', justifyContent: 'center' }}>
            {/* Row 1 */}
            <div style={{ display: 'flex' }}>
              {[0, 1, 2].map((idx) => {
                const manga = data.slots[idx];
                return (
                  <div key={idx} style={{ width: '190px', height: '260px', margin: '6px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {manga?.imageUrl && <img src={manga.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4px 6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '12px', textAlign: 'center' }}>
                        {manga.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex' }}>
              {[3, 4, 5].map((idx) => {
                const manga = data.slots[idx];
                return (
                  <div key={idx} style={{ width: '190px', height: '260px', margin: '6px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {manga?.imageUrl && <img src={manga.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4px 6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '12px', textAlign: 'center' }}>
                        {manga.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Row 3 */}
            <div style={{ display: 'flex' }}>
              {[6, 7, 8].map((idx) => {
                const manga = data.slots[idx];
                return (
                  <div key={idx} style={{ width: '190px', height: '260px', margin: '6px', backgroundColor: '#333', display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '4px solid #000', position: 'relative' }}>
                    {manga?.imageUrl && <img src={manga.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {manga?.title && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '4px 6px', backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '12px', textAlign: 'center' }}>
                        {manga.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', width: '100%', height: '200px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <p style={{ fontSize: '64px', fontWeight: 800, margin: 0, padding: 0 }}>9coma</p>
              <p style={{ fontSize: '20px', opacity: 0.6, margin: 0, marginBottom: '8px' }}>https://9coma.com</p>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0, fontWeight: 700 }}>Data from Rakuten Books - Powered by 9coma.com</p>
            </div>
            <div style={{ display: 'flex', padding: '10px', backgroundColor: 'white', borderRadius: '16px', border: '4px solid #000' }}>
              <img src={qrCodeDataUrl} style={{ width: '140px', height: '140px' }} />
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
