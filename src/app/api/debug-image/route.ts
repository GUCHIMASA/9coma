import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const testUrl = 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0458/9784088700458.jpg?_ex=200x200';
  
  try {
    const response = await fetch(testUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    if (!response.ok) {
      return NextResponse.json({ error: `Fetch failed: ${response.status}` }, { status: 500 });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Test Buffer presence
    let base64 = '';
    try {
      base64 = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64');
    } catch (e) {
      return NextResponse.json({ error: 'Buffer failed', detail: String(e) }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      url: testUrl,
      contentType,
      size: arrayBuffer.byteLength,
      base64Start: base64.substring(0, 50) + '...',
      base64Length: base64.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unknown error', detail: String(error) }, { status: 500 });
  }
}
