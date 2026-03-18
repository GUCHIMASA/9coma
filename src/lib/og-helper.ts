import fs from 'fs';
import path from 'path';

let cachedFontData: ArrayBuffer | null = null;

/**
 * ローカルの Noto Sans JP フォントデータを取得し、メモリキャッシュして返却する。
 */
export async function getFontData() {
  if (cachedFontData) return cachedFontData;

  const fontPath = path.join(process.cwd(), 'src/assets/fonts/NotoSansJP-Black.otf');
  
  if (!fs.existsSync(fontPath)) {
    throw new Error(`Font file not found: ${fontPath}`);
  }

  const fontBuffer = fs.readFileSync(fontPath);
  cachedFontData = fontBuffer.buffer.slice(fontBuffer.byteOffset, fontBuffer.byteOffset + fontBuffer.byteLength);
  
  return cachedFontData;
}

/**
 * 外部画像を Fetch して Base64 Data URL に変換する。
 * ブラウザの User-Agent を模倣してブロックを回避する。
 */
export async function getBase64Image(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64');
    
    return { 
      success: true, 
      dataUrl: `data:${contentType};base64,${base64}`, 
      size: arrayBuffer.byteLength 
    };
  } catch (e) {
    console.error(`[OGHelper] Failed to fetch image: ${url}`, e);
    return { success: false, error: String(e) };
  }
}
