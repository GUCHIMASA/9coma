'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { MangaItem } from '@/types';

export default function ListView() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<{ slots: (MangaItem | null)[]; authorName: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/list?id=${id}`);
        if (!res.ok) throw new Error('リストが見つかりませんでした');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('URLをコピーしました！');
  };

  const shareOnX = () => {
    const text = `${data?.authorName}さんを構成する漫画9選\n#9coma #私を構成する漫画9選\n`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  if (isLoading) {
    return (
      <main className="container animate-fade-in" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>読み込み中...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="container animate-fade-in" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <h2 style={{ color: 'var(--color-error)' }}>Error</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem' }}>{error || 'データが見つかりません'}</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '2rem', padding: '0.8rem 1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>トップへ戻る</a>
      </main>
    );
  }

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <header style={{ textAlign: 'center', margin: '3rem 0' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {data.authorName}さんを構成する漫画9選
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>9coma | 自分の漫画遍歴をシェア</p>
      </header>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--color-surface)', padding: '10px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          {data.slots.map((manga, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                aspectRatio: '1 / 1.4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {manga ? (
                <a href={manga.affiliateUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%' }}>
                  <img src={manga.imageUrl} alt={manga.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </a>
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={shareOnX}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: '#000',
              color: 'white',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <span>Xでシェアする</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={copyUrl}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid var(--color-border)'
              }}
            >
              URLをコピー
            </button>
            <a
              href="/"
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                color: 'white',
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                textAlign: 'center'
              }}
            >
              自分も作る
            </a>
          </div>
        </div>
      </div>
      
      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <p>書影データ提供：楽天ブックス</p>
      </footer>
    </main>
  );
}
