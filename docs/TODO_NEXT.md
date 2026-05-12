# TODO_NEXT (Vercel -> Cloudflare 移行：OGP画像生成の抜本的シンプル化)

## 🎯 目的
複雑な画像事前フェッチやBase64変換などの「不要な自作ロジック」をすべて破棄し、Next.js (`@vercel/og`) 本来の標準仕様に沿った最もシンプルな構造にリファクタリングします。
これにより、画像の空白バグとメモリスパイクを同時に解決し、最後にフォントの最適化を行ってCloudflareの制限内に収めます。

## 📁 対象ファイル
1. `src/lib/og-helper.ts`
2. `src/app/list/[id]/share-image/route.tsx`
3. `src/app/9tube/list/[id]/share-image/route.tsx`
4. `src/app/list/[id]/opengraph-image.tsx`
5. `src/app/9tube/list/[id]/opengraph-image.tsx`
6. `src/app/author/[authorName]/opengraph-image.tsx`

---

## 🛠 具体的な実装プロンプト（作業者への指示）

### Task 1: 外部画像の事前取得ロジックの「完全削除」と「URL直渡し」
Satoriは標準で外部URLのFetchを内包しており、WASM内でバイナリを直接安全に処理します。私たちが自前でFetchしてArrayBufferやBase64にする必要は全くありませんでした。

*   **対象ファイル (`route.tsx`, `opengraph-image.tsx`)**:
    *   `getImageData` を用いた `Promise.all` やチャンク処理など、画像を事前に取得して配列に詰める処理を**すべて削除**してください。
    *   JSXツリー内の `<img src={...} />` には、Firestoreから取得した生の絶対URL（例: `manga.imageUrl` や `slot.imageUrl`）をそのまま渡してください。
*   **対象ファイル (`src/lib/og-helper.ts`)**:
    *   `getImageData` 関数（旧 `getBase64Image`）は不要になったため、関数ごと**完全に削除**してください。

### Task 2: Google Fonts API を用いたフォントの「動的サブセット化」
残る唯一の巨大負荷である「2.2MBのフォントファイル」のパース負荷を削るため、標準的な動的サブセット化を実装します。

*   **対象ファイル (`src/lib/og-helper.ts` の `getFontData`)**:
    1. 引数に `text?: string` を追加します（`requestUrl` は不要）。
    2. 以下の User-Agent を使用して Google Fonts API から TTF 形式の CSS を取得します。
       `const UA = 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';`
       `fetch(https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=${encodeURIComponent(text)}, { headers: { 'User-Agent': UA } })`
    3. レスポンスのCSSから `src: url(https://...)` を抽出し、そのURLを再度 fetch して `arrayBuffer()` を返却してください。

*   **対象ファイル (`route.tsx`, `opengraph-image.tsx` 側)**:
    *   `getFontData` を呼び出す際、画像内に描画されるすべての文字列（タイトル、著者名など）を結合し、重複文字を削除した軽量な文字列を `text` 引数として渡してください。

---

## ✅ 完了条件（検証項目）
1. 画像の事前Fetchロジック（`getImageData`）が全ファイルから完全に消滅していること。
2. 9TUBE版OGP・マンガ版OGPともに、画像が空白にならず、かつ `Worker exceeded resource limits` にならずに完全な高画質画像が生成されること。
