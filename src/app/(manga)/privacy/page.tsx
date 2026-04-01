import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'プライバシーポリシー・免責事項 | 9コマ',
  description: '9コマのプライバシーポリシー、免責事項、および著作権に関する指針',
};

export default function PrivacyPolicy() {
  return (
    <main className="container animate-fade-in" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center' }}>
        プライバシーポリシー・免責事項
      </h1>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          ① 画像の取り扱いと著作権について
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text)' }}>本サービスで生成される画像について</p>
          <p>
            本サービス（9コマ）が生成する画像に含まれる書籍の書影、タイトル、および著者名等の著作権は、各出版社、著者、および権利者に帰属します。本サービスは、楽天ブックスAPIを利用し、書籍のプロモーションおよび紹介を目的としてこれらの情報を表示・合成しています。
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
            生成された画像は、利用者が自身の好みを表現し、作品を紹介する目的でSNS等にシェアすることを想定しています。画像の商用利用や、公序良俗に反する形での利用、権利者の名誉を毀損する形での利用は固くお控えください。シェア後の画像利用に関するトラブルについて、当サービスは一切の責任を負いかねます。
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
          アフィリエイトプログラムについて
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            Amazonのサイバーマンデー、ブラックフライデー等のキャンペーン期間を含め、Amazonのアソシエイトとして、9コマは適格販売により収入を得ています。
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
          また当サイトのコンテンツ・情報について、できる限り正確な情報を提供するように努めておりますが、正確性や安全性を保証するものではありません。情報が古くなっていることもございます。<br />
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
        <Link href="/" style={{ padding: '0.8rem 1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '2px solid var(--color-border)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 700, display: 'inline-block', transition: 'var(--transition-fast)' }}>
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
