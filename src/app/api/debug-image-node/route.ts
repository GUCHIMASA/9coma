import { NextResponse } from 'next/server';

// あえて Edge Runtime を使わない（Node.js Runtime）
export const runtime = 'nodejs';

export async function GET() {
  const testUrl = 'https://thumbnail.image.rakuten.co.jp/@0_mall/book/cabinet/0458/9784088700458.jpg?_ex=200x200';
  
  try {
    const response = await fetch(testUrl);
    if (!response.ok) {
      return NextResponse.json({ error: `Fetch failed: ${response.status}` }, { status: 500 });
    }
    
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(buffer).toString('base64');
    
    return NextResponse.json({
      success: true,
      runtime: 'nodejs',
      url: testUrl,
      contentType,
      size: buffer.byteLength,
      base64Length: base64.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unknown error in nodejs', detail: String(error) }, { status: 500 });
  }
}
