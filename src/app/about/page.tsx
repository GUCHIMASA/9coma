import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'このサイトについて | 9コマ',
  description: '9コマの開発のきっかけと運営者の想い',
};

export default function AboutPage() {
  return (
    <main className="container animate-fade-in" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '3rem', textAlign: 'center' }}>
        このサイトについて
      </h1>

      <section style={{ backgroundColor: 'var(--color-surface-2)', padding: '2.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--color-primary)', textAlign: 'center' }}>
          運営者の想い
        </h2>
        
        <div style={{ color: 'var(--color-text)', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
          <p>
            「9コマ」は、「自分の好きな漫画を、誰かと分かち合う」というワクワクの在り方を提供することを目的とした、個人運営のサービスです。
          </p>
          <br />
          <p>
            きっかけは、ふと知った瞬間に敬愛と共感の念を抱いた“あるサービス”の、突然の終了に触れたことでした。その役目を受け継ぎ、皆様の楽しむ場を守ることを一意に開発をスタートさせましたが、作業を進める中で、私自身にある変化が起きました。自らも大好きだった作品たちを改めて見渡し読み返すなどするうちに、危うく思い出の一部のようになりかけていた漫画への熱が、自分でも驚くほど激しく再燃してしまったのです。
          </p>
          <br />
          <p>
            今はただ、「もっと使いやすく、もっと皆様の愛する作品たちを輝かせてもらいたい」という気持ちを一番の原動力に、私自身を構成する大きな要素である「漫画」という文化に、わずかでも貢献できればと願うばかりです。
          </p>
          <br />
          <p>
            この「9コマ」が、誰かの新しい一面を“構成する”ような漫画と出会う、ささやかなきっかけになれば。これほど嬉しいことはありません。
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
