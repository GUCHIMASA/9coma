import React from 'react';
import type { Metadata } from 'next';
import { getListById } from '@/lib/list';
import { THEME_GRADIENTS } from '@/lib/themes';
import ListViewClient from './ListViewClient';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  console.log(`[Metadata] Generating metadata for ID: ${params.id}`);
  try {
    const data = await getListById(params.id);
    
    if (!data) {
      console.warn(`[Metadata] No data found for ID: ${params.id}`);
      return { title: '9coma' };
    }

    const themeText = data.theme ? `：${data.theme}` : '';
    const metaTitle = `${data.authorName}を構成する9つのマンガ${themeText} | 9coma`;
    const metaDesc = `${data.authorName}が選んだ、自分を構成する9つのマンガです。`;

    console.log(`[Metadata] Successfully retrieved data for ${params.id}. Title: ${metaTitle}`);

    return {
      title: metaTitle,
      description: metaDesc,
      openGraph: {
        title: metaTitle,
        description: metaDesc,
        type: 'article',
        siteName: '9coma',
        // Next.jsのファイルベースOGP(opengraph-image.tsx)は自動で入るはずだが、
        // 念のため明示的に指定することで確実性を高める
        images: [
          {
            url: `/list/${params.id}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: metaTitle,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDesc,
        images: [`/list/${params.id}/opengraph-image`],
      },
    };
  } catch (error) {
    console.error(`[Metadata] Error generating metadata for ${params.id}:`, error);
    return { title: '9coma' };
  }
}

export default async function ListView({ params }: { params: { id: string } }) {
  const data = await getListById(params.id);

  if (!data) {
    return (
      <main className="container animate-fade-in" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2 style={{ color: 'var(--color-error)' }}>Error</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>リストが見つかりませんでした</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.8rem 1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>トップへ戻る</a>
      </main>
    );
  }

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <header className="google-anno-skip" style={{ textAlign: 'center', margin: '3rem 0 1rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {data.authorName}を構成する9つのマンガ
        </h1>
        {data.theme ? (
          <div style={{ display: 'inline-block', padding: '0.4rem 1.2rem', background: THEME_GRADIENTS[data.theme] || 'var(--color-surface)', color: '#fff', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 700, marginTop: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
            #{data.theme}
          </div>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)' }}>9coma.com</p>
        )}
      </header>

      <ListViewClient data={data} />

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <p>書影データ提供：楽天ブックス</p>
      </footer>
    </main>
  );
}
