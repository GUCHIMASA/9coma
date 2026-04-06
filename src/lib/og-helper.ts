// Edge Runtime 互換の OGP ヘルパー
// Node.js 固有の fs, path に依存せず、fetch や URL でフォントと画像を処理します。

let cachedFontData: ArrayBuffer | null = null;

/**
 * フォントデータを取得し、メモリキャッシュして返却する。
 * Edge 環境では public 配下や外部 URL から fetch して取得します。
 */
export async function getFontData() {
  if (cachedFontData) return cachedFontData;

  // 1. 環境に応じてベースURLを取得（Vercel/Local/Cloudflare対応）
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  
  // 2. ブラウザ経由でもアクセス可能な公開パスからフォントを取得
  const fontUrl = `${baseUrl}/fonts/NotoSansJP-Black.otf`;
  
  try {
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error(`Font fetch failed: ${response.status}`);
    cachedFontData = await response.arrayBuffer();
    return cachedFontData;
  } catch (error) {
    console.error('[OGHelper] Failed to fetch font:', error);
    throw error;
  }
}

/**
 * 外部画像を Fetch して Base64 Data URL に変換する。
 * Node.js の Buffer ではなく、ブラウザ互換の方法で処理します。
 */
export async function getBase64Image(url: string, timeoutMs: number = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Node.js の Buffer ではなく、Uint8Array + btoa (または互換処理) で Base64化
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    return { 
      success: true, 
      dataUrl: `data:${contentType};base64,${base64}`, 
      size: arrayBuffer.byteLength 
    };
  } catch (e) {
    console.error(`[OGHelper] Failed to fetch image: ${url}`, e);
    return { success: false, error: String(e) };
  } finally {
    clearTimeout(timeoutId);
  }
}
