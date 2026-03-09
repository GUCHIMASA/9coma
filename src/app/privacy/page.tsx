import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | 9coma',
  description: '9comaのプライバシーポリシーおよび免責事項',
};

export default function PrivacyPolicy() {
  return (
    <main className="container animate-fade-in" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center' }}>
        プライバシーポリシー・免責事項
      </h1>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          アクセス解析ツールについて
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          当サイトでは、Googleによるアクセス解析ツール「Google Analytics (GA4)」を使用しています。このGoogle Analyticsはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。<br />
          この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細は<a href="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Google Analyticsサービス利用規約</a>のページや<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Googleポリシーと規約</a>ページをご覧ください。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          アフィリエイトプログラムについて
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          当サイト「9coma」は、楽天アフィリエイトプログラムの参加者です。楽天アフィリエイトプログラムは、適切な商品リンクを配置することによってサイトが紹介料を獲得できるアフィリエイト宣伝プログラムです。<br />
          リンク先の商品の購入にあたっては、リンク先の各店舗・サービスの利用規約やプライバシーポリシーをご確認ください。商品に関するお問い合わせは、各店舗へ直接お願いいたします。
        </p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          免責事項
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          当サイトからのリンクやバナーなどで移動したサイトで提供される情報、サービス等について一切の責任を負いません。<br />
          また当サイトのコンテンツ・情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。情報が古くなっていることもございます。<br />
          当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
        </p>
      </section>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/" style={{ padding: '0.8rem 1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, display: 'inline-block', transition: 'var(--transition-fast)' }}>
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
