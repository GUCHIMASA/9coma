'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import type { MangaItem } from '@/types';

interface ListViewClientProps {
  data: {
    slots: (MangaItem | null)[];
    authorName: string;
  };
}

export default function ListViewClient({ data }: ListViewClientProps) {
  const params = useParams();
  const id = params.id as string;

  const copyUrl = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    alert('URLをコピーしました！');
  };

  const shareOnX = () => {
    if (typeof window === 'undefined') return;
    const text = `${data.authorName}を構成する9つのマンガ\n#9coma #9koma #My9manga\n`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* 9つのマンガを並べるグリッドレイアウト（背景が少し暗い領域） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'var(--color-border)', padding: '12px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
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
              justifyContent: 'center',
              border: '2px solid var(--color-border)'
            }}
          >
            {manga ? (
              <a href={manga.affiliateUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}>
                {/* 1. マンガの表紙画像エリア */}
                <img src={manga.imageUrl} alt={manga.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: '3px 3px',
                  background: 'rgba(26, 26, 26, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* タイトルのテキスト要素（最大2行で省略する設定） */}
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.2'
                  }}>
                    {manga.title}
                  </span>
                </div>
              </a>
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-2)' }} />
            )}
          </div>
        ))}
      </div>

      {/* シェア＆コピー＆クローン用のボタン領域群（グリッド枠の下の固まり全体） */}
      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Xでシェアボタン（一番目立つ黒背景ボタン） */}
        <button
          onClick={shareOnX}
          style={{
            width: '100%',
            padding: '1.2rem',
            borderRadius: 'var(--radius-md)',
            background: '#000',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: '3px solid #000',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-base)'
          }}
        >
          <span>Xでシェアする</span>
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* 左側：「URLをコピー」ボタン */}
          <button
            onClick={copyUrl}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: 700,
              fontSize: '1rem',
              border: '3px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition-base)'
            }}
          >
            URLをコピー
          </button>

          {/* 右側：「戻る（編集し直す）」ボタン */}
          <a
            href="/"
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: 700,
              fontSize: '1rem',
              border: '3px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              transition: 'var(--transition-base)',
              textDecoration: 'none',
            }}
          >
            戻る
          </a>
        </div>

        {/* コピーして編集ボタン（他人のリストをクローンする機能） */}
        <a
          href={`/?clone=${id}`}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-primary)',
            fontWeight: 800,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '2px solid var(--color-primary)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-base)',
            textDecoration: 'none',
          }}
        >
          <span>✨ コピーして編集</span>
        </a>
      </div>
    </div>
  );
}
