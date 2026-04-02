# 9TUBE 安定化・高速化・OGP 正常化 実装計画書

## 1. 概要 (Goal)
現在 9TUBE プラットフォームにおいて発生している「OGP（リンクプレビュー画像）が表示されない」「サイト全体の動作が極端に重い」という 2 つの致命的な問題を、サイト基盤の修正と 9TUBE 固有の実装修正によって根本から解決する。

## 2. 現状の課題と原因分析 (Root Cause Analysis)

### 2.1 OGP が表示されない問題 (OGP Failure)
- **原因1: MetadataBase の不整合 (Global)**
  - `src/app/layout.tsx` の `metadataBase` の計算が、本番環境で `http://localhost:3000` を指してしまっている可能性が高い。これにより、OGP 画像の絶対 URL が外部から参照不可能になっている。
- **原因2: 明示的な画像メタデータの欠落 (9TUBE)**
  - マンガ版 (`src/app/(manga)/list/[id]/page.tsx`) では `og:image` や `twitter:image` を明示的に指定しているが、9TUBE 版では Next.js の自動検出に頼っている。動的レンダリングを行う現在の構成では、クローラーが画像を見つけられない。
- **原因3: 画像生成のタイムアウト (Performance)**
  - `opengraph-image.tsx` 内で 9 枚の YouTube サムネイルを並列 Fetch しているが、外部通信の遅延により Twitter のタイムアウト内に画像が生成されず、表示が失敗している。

### 2.2 サイトアクセスの重さ (Performance Bottleneck)
- **原因1: ハイドレーション・ミスマッチ (Global)**
  - `metadataBase` のドメイン不一致により、サーバーとクライアントで生成される URL が異なり、React のハイドレーションに多大な負荷がかかっている。
- **原因2: ブロッキングな初期データ取得 (9TUBE Entrance)**
  - `/9tube` ページのマウント時に `/api/9tube/list` をブロッキングに取得しており、初期描画とハイドレーションを阻害している。

## 3. 実装手順 (Implementation Steps)

### フェーズ 1: OGP 復旧と基盤正常化 (Stability & Normalization)

#### Step 1: ルートメタデータの修復
- ファイル: `src/app/layout.tsx`
- 内容: `baseUrl` の取得ロジックを見直し、本番環境で確実に正しいドメイン（`https://9coma.com` 等）が `metadataBase` にセットされるようにする。

#### Step 2: 9TUBE 個別ページのメタデータ同期
- ファイル: `src/app/9tube/list/[id]/page.tsx`
- 内容: `generateMetadata` で `openGraph.images` と `twitter.images` を明示的に指定する。
- パス: `/9tube/list/${params.id}/opengraph-image` (絶対パスとして生成されることを確認)。

### フェーズ 2: 高速化と信頼性向上 (Performance & Fallback)

#### Step 3: OGP 生成の軽量化とフォールバック
- ファイル: `src/lib/og-helper.ts` および `src/app/9tube/list/[id]/opengraph-image.tsx`
- 内容:
  - 外部画像 Fetch (`getBase64Image`) にタイムアウト設定 (3秒程度) を追加。
  - タイムアウトまたは失敗時は、即座に「NO IMAGE」用の代替アセットを表示し、レスポンスを保証する。

#### Step 4: 初期アクセスのレンダリング最適化
- ファイル: `src/app/9tube/page.tsx`
- 内容:
  - `fetchRecent` 処理の非同期化を徹底し、スケルトン表示などを導入。
  - 実機負荷が高い `backdrop-filter: blur` 等の CSS プロパティを見直し、視覚効果とパフォーマンスのバランスを取る。

## 4. 検証項目 (Verification Matrix)

1. **OGP 正常化の確認**:
   - Twitter Card Validator で、マンガ版・9TUBE 版の両方のプレビューが正しく表示されること。
   - `og:image` タグの URL が `localhost` ではなく正しいドメインになっていること。

2. **パフォーマンスの確認**:
   - 実機（iPhone/Android）の Chrome で `/9tube` にアクセスし、ハイドレーション完了までの時間が 2 秒以内に収まること。
   - スクロールがスムーズに行えること。
