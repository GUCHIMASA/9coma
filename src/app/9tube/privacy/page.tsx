import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー / 免責事項 | 9TUBE',
  description: '9TUBEのプライバシーポリシー、免責事項、および著作権に関する指針',
};

export default function YouTubePrivacyPolicy() {
  return (
    <main className="container animate-fade-in" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center' }}>
        プライバシーポリシー / 免責事項 (9TUBE版)
      </h1>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          ① 画情報の取り扱いと著作権について
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>本サービスで表示される情報について</p>
          <p>
            本サービス（9TUBE）で表示 /利用されるYouTube動画のサムネイル画像、チャンネルアイコン、動画タイトル、およびチャンネル名等の著作権および知的財産権は、Google LLCおよび各動画のコンテンツクリエイター、権利者に帰属します。
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            本サービスは、YouTube Data APIを利用し、YouTubeの利用規約に従って動画の紹介およびお気に入りリストの作成を目的としてこれらの情報を表示しています。本サービスがこれらの権利を所有または主張することはありません。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          ② ユーザーの責任範囲
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>利用者の責任</p>
          <p>
            生成された画像やリストは、利用者が自身の好みを表現し、お気に入りのYouTubeコンテンツを紹介する目的でSNS等にシェアすることを想定しています。画像の商用利用や、公序良俗に反する形での利用、YouTubeの規約に抵触する利用、または権利者の名誉を毀損する形での利用は固くお控えください。シェア後の二次利用に関するトラブルについて、当サービスは一切の責任を負いかねます。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          アフィリエイトプログラムについて
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            Amazonのサイバーマンデー、ブラックフライデー等のキャンペーン期間を含め、Amazonのアソシエイトとして、9TUBE（9coma）は適格販売により収入を得ています。
          </p>
          <p>
            当サイトは、楽天グループ株式会社が提供する楽天アフィリエイトプログラムに参加しています。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          免責事項
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。<br />
          また当サイトのコンテンツ情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。情報の取得元であるYouTube側での変更により、情報が古くなっていることもございます。<br />
          当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          アクセス解析ツールおよび広告配信について
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Google アナリティクス</p>
          <p style={{ marginBottom: '1rem' }}>
            当サイトでは、Googleによるアクセス解析ツール「Google Analytics (GA4)」を使用しています。この分析ツールはデータの収集のためにCookieを使用していますが、データは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>Google アドセンス</p>
          <p>
            当サイトでは、第三者配信事業者であるGoogleによる広告サービス「Google AdSense」を利用しています。広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報「Cookie」を使用することがあります。<br />
            詳細およびパーソナライズ広告を無効にする方法については、Googleの<a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>広告設定</a>をご確認ください。
          </p>
        </div>
      </section>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/9tube" style={{ padding: '0.8rem 1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, display: 'inline-block', transition: 'var(--transition-fast)' }}>
          9TUBEトップへ戻る
        </Link>
      </div>
    </main>
  );
}
