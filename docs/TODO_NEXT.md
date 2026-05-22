# TODO_NEXT (Cloudflare 50ms制限突破：最適化の最終調整)

## 🎯 目的
Cloudflare PagesにおけるSatoriのWASMエンジンの負荷（PNG圧縮と画像デコードのCPU計算量）を下げるため、**最適な箇所だけをピンポイントで軽量化**します。
Share画像は画質を保つためにサイズを維持し、代わりに入力（外部取得画像）の解像度を適正化することでError 1102を防ぎます。

## 📁 対象ファイルと変更内容

### 1. OGP画像の解像度半減（1200x630 → 600x315）
SNSシェア用のOGPは引き伸ばされるため、計算負荷を減らすために**正確に半分（1/2）**にスケールダウンします。
以下のファイルのレイアウト（width, height, padding, gap, fontSize 等）を半減させてください。
*   `src/app/list/[id]/opengraph-image.tsx` （マンガ版 OGP）
*   `src/app/9tube/list/[id]/opengraph-image.tsx` （YouTube版 OGP）※現在テスト中。正式に適用すること。
*   `src/app/author/[authorName]/opengraph-image.tsx` （著者ページ OGP）

### 2. Share画像は「サイズ維持（600x750）」＋「テキスト制限」
スマホへのダウンロード用であるShare画像は、画質維持のためキャンバスサイズは変更しません。
代わりに長文による改行計算負荷を防ぐため、以下のファイルでタイトルの `truncate` 文字数を短く調整（例：34文字 → 18文字など）してください。
*   `src/app/list/[id]/share-image/route.tsx`
*   `src/app/9tube/list/[id]/share-image/route.tsx`

### 3. 楽天画像（入力側）の解像度適正化
マンガ版がクラッシュする最大の原因は「600x750のキャンバスに対して、400x400の巨大な画像を9枚もデコードしていること」です。（実際の枠サイズは188x188程度です）
*   `src/app/api/search/route.ts` 内の、`?_ex=200x200` を `?_ex=400x400` に強制置換している処理を削除し、デフォルトの **200x200** をそのまま使うように変更してください。（これによりデコード負荷が1/4になります）

---

## ✅ 完了条件
*   OGPは 600x315 に縮小され、Share画像は 600x750 を維持していること。
*   本番デプロイ後、最も重い「マンガ版の9枚フルリスト」で `/share-image` と `/opengraph-image` にアクセスし、50ms制限（Error 1102）で落ちずに画像が生成されること。
