# プロジェクト: 9coma (私を構成する9つのマンガ) - YouTube版
## Phase YT-3 修正指示書: Satori および Client/Server コンポーネント制約エラーの解消

作業ワーカーへ。現在あなたが直面しているローカル開発サーバーのクラッシュ、および「chrome-error://chromewebdata/」のデッドロック原因は、Next.js (App Router) と画像生成ライブラリ (Satori) の厳格な仕様違反によるものです。

監督（Antigravity）からの指示に従い、以下の修正作業を【順番通りに】実行し、デッドロックから脱出してください。

---

### 【修正ステップ1：OGP生成 Satori クラッシュの解消】
ファイル: `src/app/yt/list/[id]/opengraph-image.tsx`

あなたが実装したコードには、Satori (ImageResponse) を強制終了（Empty reply from server）させる仕様違反が複数含まれています。以下のルールに沿って直ちにコードを修正してください。

1. **`borderRadius: '100%'` の禁止**:
   - Satori は CSSの `%` を解釈できずエラーになります。必ず数値で指定してください（例: `borderRadius: 60` ）。
2. **未提供の `fontWeight` の禁止**:
   - 現在のコードではフォントデータに `weight: 900` のみを提供しています。しかし、JSX内で `fontWeight: 700` などが存在するとレンダリングがパニックを起こします。JSX内のすべての `fontWeight` を `900` に統一するか、該当のプロパティを削除してください。
3. **`objectFit: 'cover'` の禁止**:
   - 特定のFlexレイアウト条件下で `objectFit: 'cover'` を使用すると内部のYogaエンジンがクラッシュします。`style={{ width: '100%', height: '100%' }}` で固定の短形を描画させるようにしてください。
4. **YouTube画像の直接参照の回避**:
   - Satori上で外部URLを直接描画しようとすると失敗率が高いです。必ず `src/lib/og-helper.ts` の `getBase64Image` と `Promise.all` を用いて、URLを事前にBase64データURLに変換してからSatoriに渡す処理を実装してください。

上記の仕様に準拠するよう `opengraph-image.tsx` を全面的にクリーンアップしてください。

---

### 【修正ステップ2：Shareボタン（onClick）による Next.js コンパイルエラーの解消】
ファイル: `src/app/yt/list/[id]/page.tsx` など

閲覧ページに「URLコピー」処理（`onClick` によるイベントハンドラや `navigator.clipboard` など）を直接書き込もうとした事で、サーバーコンポーネントである `page.tsx` がコンパイルエラーを起こしています。

以下の手順で進めてください。
1. **クライアントコンポーネントの分離作成**:
   - `src/components/youtube/YtShareButtons.tsx` というファイルを新規作成してください。
   - ファイルの先頭に必ず `'use client';` を宣言してください。
   - この中に「X(Twitter)でのシェアリンク生成ロジック」および「URLをクリップボードにコピーする `onClick` ロジック」を実装し、2つのボタンを返すコンポーネントを作成してください。
2. **`page.tsx` へのインポート**:
   - `src/app/yt/list/[id]/page.tsx` に先ほどの `YtShareButtons` をインポートし、画面の下部に配置してください。（`page.tsx` 自体には絶対に `onClick` や `use client` を入れないこと）

以上の【ステップ1】と【ステップ2】を完了後、開発サーバーを通じて表示・動作の再確認を行い、監督へ報告してください。
