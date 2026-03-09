# 9coma (ナインコマ) プロジェクト前提条件

あなたは優秀なフルスタックエンジニアです。以下のNext.jsプロジェクト「9coma」について相談させてください。

## 1. プロジェクト概要
ユーザーが「私を構成する9つのマンガ」を検索し、3x3のグリッド画面に配置してシェア用ページを作成できるWebアプリケーションです。
※プロジェクト内のテキストは「漫画9選」ではなく「9つのマンガ」で統一しています。

## 2. 技術スタック
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (`globals.css` に定義したCSS変数を活用。Tailwindは不使用)
- **Backend/DB:** Firebase (Firestore / Hosting)
- **External API:** 楽天ブックス総合検索API (v2) を使用して漫画データを取得

## 3. 主要なディレクトリ・ファイル構造
```text
src/
├── app/
│   ├── page.tsx          # トップページ (検索、グリッドUIによるリスト作成)
│   ├── layout.tsx        # 共通レイアウト、メタデータ、Google Analytics(GA4)
│   ├── globals.css       # グローバルCSSとCSS変数の定義
│   ├── api/
│   │   ├── search/route.ts # 楽天APIを用いた漫画検索（デバウンス、キーワード結合、outOfStockFlag=1による絶版対応）
│   │   └── list/route.ts   # リストの保存(Firestore)と取得用API
│   └── list/[id]/
│       ├── page.tsx            # シェアされたリストの個別閲覧ページ (SSR化済み)
│       ├── ListViewClient.tsx  # クライアントサイドのシェアボタン等ロジック用
│       └── opengraph-image.tsx # next/ogによる動的OGP画像生成（左にSlot5・右に他8冊のレイアウト）
├── app/opengraph-image.png # トップページ専用の静的OGP画像
├── lib/
│   ├── firebase.ts       # Firebase初期化設定
│   └── list.ts           # リスト取得などのヘルパー関数
└── types/
    └── index.ts          # MangaItem (isbn, title, author, imageUrl, affiliateUrl) 等の型定義
```

## 4. 固有の仕様やルール
- **デザイン・UI:** 
  - メインカラーは黄色系（明るくポップなデザイン）。
  - グリッドのUIは3x3（全9スロット）。
  - **特等席:** 中心にある5番目のスロット（`idx === 4`）は、特別感を出すため背景を薄ピンク（`#FFA8B8`）にしている。
- **検索の仕組み:** 
  - 入力欄は「タイトル」「著者名」「キーワード」の3つ。これらをバックエンド (`search/route.ts`) で半角スペース連結し、楽天APIの単一 `keyword` として渡している。
  - 絶版・古い作品も取得できるよう、楽天APIに `outOfStockFlag=1` を指定している。
- **OGPとSSR:** 
  - X等のSNSクローラーに確実にメタデータを読ませるため、個別ページ (`/list/[id]/page.tsx`) は **Server-Side Rendering (SSR)** としている。
  - 動的OGP画像 (`/list/[id]/opengraph-image.tsx`) は、左側に「特等席のSlot 5」、右側に「その他の8冊の画像を4列x2行」で並べる独自レイアウト（黄色グラデーション背景）を採用。
  - トップページには静的な専用OGP (`opengraph-image.png`) を用意している。
- **トラッキング:** `layout.tsx` 内で `next/script` を用いて GA4 を実装（環境変数 `NEXT_PUBLIC_GA_ID` で作動）。
- **デプロイ戦略:** 絶対にローカル（`http://localhost:3000`）でプレビュー確認とユーザー承認を得てから本番（Firebase Hosting）へデプロイする方針としている。

---
**[質問や相談内容をここに記載してください]**
