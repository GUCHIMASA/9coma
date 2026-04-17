import { NextResponse } from 'next/server';
import { getFontData } from '@/lib/og-helper';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const fontData = await getFontData(request.url);
    
    return NextResponse.json({
      success: true,
      byteLength: fontData ? fontData.byteLength : 0,
      isNull: fontData === null,
      timestamp: new Date().toISOString(),
      userAgentUsed: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
