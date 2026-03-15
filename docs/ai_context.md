# 9coma (ナインコマ) プロジェクト前提条件

あなたは優秀なフルスタックエンジニアです。以下のNext.jsプロジェクト「9coma」について相談させてください。

## 1. プロジェクト概要
ユーザーが「私を構成する9つのマンガ」を検索し、3x3のグリッド画面に配置してシェア用ページを作成できるWebアプリケーションです。
※プロジェクト内のテキストは「漫画9選」ではなく「9つのマンガ」で統一しています。

## 2. 技術スタック
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Vanilla CSS (`globals.css` に定義したCSS変数を活用。Tailwindは不使用)
- **Backend/DB:** Firebase (Firestore) ※Hostingはリダイレクト専用
- **Hosting/CI/CD:** Vercel (メインのホスティング環境)
- **External API:** 楽天ブックス書籍検索API (`BooksBook/Search/20170404`)

## 3. 主要なディレクトリ・ファイル構造
```text
src/
├── app/
│   ├── page.tsx          # トップページ (検索、グリッドUIによるリスト作成)
│   ├── layout.tsx        # 共通レイアウト、GA4
│   ├── globals.css       # グローバルCSSとCSS変数の定義
│   ├── api/
│   │   ├── search/route.ts # 楽天APIを用いた検索（title, author パラメータを個別送信）
│   │   └── list/route.ts   # リストの保存(Firestore)
│   └── list/[id]/
│       ├── page.tsx            # 個別閲覧ページ (SSR)
│       ├── ListViewClient.tsx  # AmazonアフィリエイトID (9coma-22) 実装箇所
│       └── share-image/        # 共有用画像の生成 (OGPとは別)
├── lib/
│   ├── firebase.ts       # Firebase初期化設定
│   └── list.ts           # リスト取得などのヘルパー関数
└── types/
    └── index.ts          # MangaItem (isbn, title, author, imageUrl, affiliateUrl) 等の型定義
docs/
├── management/           # AI作業管理用 (task.md, implementation_plan.md 等)
├── ai_context.md         # このファイル（AI向け全体ガイド）
└── ux_seo_proposal.md    # UX/SEO改善案
```

## 4. 固有の仕様やルール
- **デザイン:** メインカラーは黄色系。3x3グリッド。中心(Slot 5)は「特等席」として特別な装飾。
- **サイト名:** 公式名称を「9コマ」に変更予定（内部コードでは順次反映）。
- **検索:** 精度向上のため `BooksBook/Search` API を使用。`title` と `author` を個別に渡す。
- **アフィリエイト:** Amazonリンクには一律で `tag=9coma-22` を付与。
- **リダイレクト:** `coma-5555b.web.app` (Firebase) は `9coma.com` (Vercel) へ 301 転送される。
- **AI管理:** 進行中のタスクやルールは `docs/management/` 以下のファイルを「公式記録」として読み取り、更新すること。

---
**[AIへの指示: 常に `docs/management/task.md` を確認して重複作業を防いでください]**
