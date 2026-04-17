// Edge Runtime 互換の OGP ヘルパー
// Node.js 固有の fs, path に依存せず、fetch や URL でフォントと画像を処理します。

let cachedFontData: ArrayBuffer | null = null;

/**
 * フォントデータを取得し、メモリキャッシュして返却する。
 * 画像生成に使用するフォントデータを取得する。
 * Edge Runtime 上で実行されるため、絶対パスでの fetch が必要。
 * 
 * @param requestUrl 現在のリクエストURL。オリジンの特定に使用。
 * @returns フォントデータの ArrayBuffer
 */
export async function getFontData(requestUrl?: string): Promise<ArrayBuffer> {
  if (cachedFontData) return cachedFontData;

  // ベースURLの特定
  let baseUrl = '';

  if (requestUrl) {
    try {
      const url = new URL(requestUrl);
      baseUrl = url.origin;
    } catch (e) {
      console.warn('[og-helper] Failed to parse requestUrl:', e);
    }
  }

  // フォールバック: 環境変数
  if (!baseUrl) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  // 末尾の記号( / )を正規化
  baseUrl = baseUrl.replace(/\/$/, '');

  // 修正済みの正しいフォントパス (public/fonts 配下に配置したもの)
  const fontUrl = `${baseUrl}/fonts/NotoSansJP-Black.otf`;
  
  try {
    const res = await fetch(fontUrl);
    if (!res.ok) {
      console.warn(`[og-helper] Font fetch failed: ${fontUrl} (${res.status}). Using fallback font.`);
      return new ArrayBuffer(0); // 失敗時は空データを返して画像生成自体は継続
    }
    cachedFontData = await res.arrayBuffer();
    return cachedFontData;
  } catch (error) {
    console.error('[og-helper] Error fetching font:', error);
    return new ArrayBuffer(0); // ネットワークエラー時も継続
  }
}

/**
 * 外部画像を Fetch して Base64 Data URL に変換する。
 * Edge Runtime のスタックメモリ制限を回避するため、TextDecoder を使用します。
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
    
    // Cloudflare Edge Runtime に完全対応する、高速ネイティブ Base64 エンジン
    // TextDecoder("latin1") を使用して ArrayBuffer からバイナリ文字列を一括変換し、btoa する
    const uint8array = new Uint8Array(arrayBuffer);
    const binary = new TextDecoder("latin1").decode(uint8array);
    const base64 = btoa(binary);
    
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
