# TODO_NEXT (Vercel -> Cloudflare 移行：OGP画像生成の極限最適化)

## 🎯 目的
Cloudflare Pages（Workers無料枠: メモリ128MB / CPU時間50ms）の制限により発生している `Worker exceeded resource limits` エラーを解消し、**「画質を一切下げず」「画像を自社サーバーに保存せず」**に 600x750 の高画質9枚グリッド画像をオンザフライ生成できるようにする。

## 📁 対象ファイル
1. `src/lib/og-helper.ts`
2. `src/app/list/[id]/share-image/route.tsx`
3. `src/app/9tube/list/[id]/share-image/route.tsx`
4. `src/app/list/[id]/opengraph-image.tsx`
5. `src/app/9tube/list/[id]/opengraph-image.tsx`

---

## 🛠 具体的な実装プロンプト（作業者への指示）

### Task 1: 手動Base64変換の撤廃（ArrayBuffer直渡し）
**対象ファイル:** `src/lib/og-helper.ts`

JavaScript（V8）上での巨大な文字列展開によるメモリスパイクを防ぐため、`getBase64Image` を改修（または `getArrayBufferImage` を新設）してください。

*   **変更内容**: `TextDecoder("latin1")` と `btoa()` を使用したBase64文字列への変換処理を**完全に削除**します。
*   **戻り値**: `fetch` で取得したレスポンスから `await response.arrayBuffer()` を呼び出し、その生の `ArrayBuffer` をそのまま返却するようにしてください。
*   **注意**: Satori（`@vercel/og`）は `<img src={...}>` の `src` プロパティに生の `ArrayBuffer` を直接渡すことをサポートしています。

### Task 2: Fetchのチャンク化（並列ストールの回避）
**対象ファイル:** 各 `route.tsx` および `opengraph-image.tsx`

Cloudflare Workersの外部通信（コネクション）制限によるストール（CPUタイムアウト）を防ぐため、9枚同時の `Promise.all` を廃止します。

*   **変更内容**: `data.slots.map` を囲んでいる `Promise.all` を削除し、**「3枚ずつのチャンク（分割）並列取得」**または**「`for...of` による直列（1枚ずつ）取得」**に書き換えてください。
*   **メモリ解放**: 取得した `ArrayBuffer` を配列に格納し、Satori（ImageResponse）のJSXツリー内の `<img src={...}>` に渡します。

### Task 3: （必要に応じて）フォントの動的サブセット化
**対象ファイル:** `src/lib/og-helper.ts` (`getFontData`)

Task 1とTask 2を実装してもまだリソース制限に引っかかる場合のみ実行してください。
現在2.2MBの `NotoSansJP-Black.otf` を丸ごと読み込んでいますが、SatoriのWASMパース負荷を下げるため、動的に極小フォントを取得する仕組みを実装します。

*   **変更内容**: Google Fonts API (`https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@900&text=使用する文字群`) にアクセスしてサブセット化されたフォントを取得するロジックに変更します。
*   **TTF取得のコツ**: Google Fontsは通常WOFF2を返しますが、SatoriはTTF/OTFしか対応していません。Fetch時のヘッダーに `User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1` のような古いUAを指定することで、TTF形式のURLが返却されるようになります。これをパースして再度Fetchし、ArrayBufferを返却してください。

---

## ✅ 完了条件（検証項目）
1. ローカル、またはCloudflareプレビュー環境で `/share-image` エンドポイントにアクセスし、`Worker exceeded resource limits` などの500エラーが出ずに画像が表示されること。
2. 出力された画像が「文字化け」しておらず、9つのマンガ・YouTubeのカバー画像が欠けずに（意図しない空枠にならずに）高画質で表示されていること。
3. コードベースから、V8メモリを浪費する巨大な文字列変換（`TextDecoder`, `btoa`など）が排除されていること。
