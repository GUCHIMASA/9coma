// Edge Runtime 互換の OGP ヘルパー
// Google Fonts API を利用した動的サブセット化により、メモリ消費を最小限に抑えます。

/**
 * Google Fonts API から指定された文字のみを含む軽量フォントデータを取得する。
 * 
 * @param text フォントに含める文字列（サブセット化用）
 * @returns フォントデータの ArrayBuffer または null
 */
export async function getFontData(text: string = '9coma'): Promise<ArrayBuffer | null> {
  // Satori が対応している TTF 形式を Google Fonts から取得するため、
  // WOFF2 をサポートしていない古い Safari の User-Agent を使用します。
  const UA = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';
  
  try {
    // 1. Google Fonts API から CSS を取得 (サブセット化された TTF の URL を含む)
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=${encodeURIComponent(text)}`,
      { headers: { 'User-Agent': UA } }
    );
    
    if (!cssRes.ok) {
      console.warn(`[og-helper] Google Fonts CSS fetch failed: ${cssRes.status}`);
      return null;
    }
    
    const cssText = await cssRes.text();
    
    // 2. CSS からフォント URL を抽出 (src: url(https://...) 形式)
    const fontUrlMatch = cssText.match(/src: url\((https:\/\/[^)]+)\)/);
    if (!fontUrlMatch) {
      console.warn('[og-helper] Failed to extract font URL from CSS');
      return null;
    }
    const fontUrl = fontUrlMatch[1];
    
    // 3. 実際のフォントバイナリを取得
    const fontRes = await fetch(fontUrl);
    if (!fontRes.ok) {
      console.warn(`[og-helper] Font file fetch failed: ${fontRes.status}`);
      return null;
    }
    
    return await fontRes.arrayBuffer();
  } catch (error) {
    console.error('[og-helper] Font subsetting error:', error);
    return null;
  }
}
