import React from 'react';
import type { Metadata } from 'next';
import { getListById } from '@/lib/list';
import ListViewClient from './ListViewClient';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const data = await getListById(params.id);

  return {
    title: `${data.authorName}を構成する9つのマンガ | 9coma`,
    description: `${data.authorName}が選んだ、自分を構成する9つのマンガです。`,
    openGraph: {
      title: `${data.authorName}を構成する9つのマンガ | 9coma`,
      description: `${data.authorName}が選んだ、自分を構成する9つのマンガです。`,
      type: 'article',
      siteName: '9coma',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.authorName}を構成する9つのマンガ | 9coma`,
      description: `${data.authorName}が選んだ、自分を構成する9つのマンガです。`,
    },
  };
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
      <header style={{ textAlign: 'center', margin: '3rem 0 1rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {data.authorName}を構成する9つのマンガ
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>9coma.com</p>
      </header>

      <ListViewClient data={data} />

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <p>書影データ提供：楽天ブックス</p>
      </footer>
    </main>
  );
}
