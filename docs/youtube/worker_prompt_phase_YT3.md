# プロジェクト: 9coma (私を構成する9つのマンガ) - YouTube版 (YouTube 9coma)
## Phase YT-3: SNS OGP画像生成 ＆ シェア機能の実装

あなたは「別AI（作業ワーカー）」として、監督AI（Antigravity）およびオーナーからの指示に基づき、このタスクを完遂してください。

### 【絶対順守事項：文脈保護ルール】
1. **既存マンガ版ファイルの絶対死守**:
   マンガ用 OGP 生成ロジック（`src/app/list/[id]/opengraph-image.tsx`）や共通フォントヘルパー(`src/lib/og-helper.ts`) を**改変してはいけません。** フォント読み込み（`fetchFont` など）は再利用して構いませんが、既存コードの削除や修正は厳禁です。
2. **ルーティング**:
   生成処理は `src/app/yt/list/[id]/opengraph-image.tsx` として作成してください。

---

### 【今回実装する各機能（順番通りに実行し、各ステップごとに確認をとること）】

#### ⚠️進捗報告ルール
以下のステップごとに必ず一旦処理を停止し、監督に報告してください。

---

#### Step 7: 動的OGP生成 (`src/app/yt/list/[id]/opengraph-image.tsx`) の作成
1. `src/app/yt/list/[id]/opengraph-image.tsx` を新規作成し、Next.js の `ImageResponse` (Satori) を用いて OGP 画像を生成するロジックを組むこと。
2. **キャンバスサイズについて:** YouTubeの動画（16:9）が3×3でピッタリはまるよう、X（Twitter）の標準比率に近い **1200 × 675 (または 1280 × 720)** 前後キャンバスをベースにすること。（マンガ版のような縦長 900x1600 ではありません）
3. `db` から `yt_lists` コレクション内の該当 `id` のデータを取得し、9つのスロットを描画すること。
4. ビデオの場合はサムネイル画像（16:9）を描画し、チャンネルの場合は指定した丸アイコンやブラー背景の代わりとなる簡略化デザイン（Satoriの制約上、直接CSSの `filter: blur()` が効かない可能性が高いため、背景は単色やグラデーションで代用し、中央に丸アイコンを配置するなど工夫）で描画すること。

---

#### Step 8: OGP画像のブラウザ確認
（このステップはあなたがコードを書くのではなく、あなたが「Step 7 が完了しました。ブラウザで `/yt/list/[id]/opengraph-image` にアクセスして画像が表示されるか確認してください」と監督に依頼するフェーズです）

---

#### Step 9: 閲覧ページへの「SNSシェアボタン」設置
1. 先んじて作成済みの `src/app/yt/list/[id]/page.tsx` に、以下の2つのシェアボタンを実装する。（既存のマンガ版 `src/app/list/[id]/ListViewClient.tsx` のようなデザイン）
   - **X（Twitter）でシェア**: `https://twitter.com/intent/tweet?text=...&url=...&hashtags=9coma,YouTube` へのリンク
   - **URLをコピー**: クリップボードAPI (`navigator.clipboard.writeText`) を使って現在のページのURLをコピーし、「コピーしました！」というトーストまたはアラートを出す機能
2. OGPをTwitter側が正しく読み込めるよう、`generateMetadata` の `metadataBase` や `alternates` が不足している場合は追加すること。

以上の Step 7, 8, 9 を順に実行してください。まずは Step 7「OGP画像の作成」から着手し、完了したら報告してください。
