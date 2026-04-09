/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { YouTubeSlot } from '@/types/youtube';
import YtGridSlot from './YtGridSlot';

interface YtSearchModalProps {
  index: number;
  onClose: () => void;
  onSelect: (slot: YouTubeSlot) => void;
}

export default function YtSearchModal({
  index,
  onClose,
  onSelect,
}: YtSearchModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<YouTubeSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      // Server Action (POST) から API Route (GET) へ移行
      const response = await fetch(`/api/9tube/metadata?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }

      const data = await response.json();
      
      if (data && !data.error) {
        setPreview(data);
      } else {
        setError('URLから情報を取得できませんでした。');
        setPreview(null);
      }
    } catch (e) {
      console.error('Fetch error:', e);
      setError('エラーが発生しました。');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  // URLが入力されたら自動的にプレビュー取得を試みる
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url.startsWith('http')) {
        handleFetch();
      } else {
        setPreview(null);
        setError(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [url, handleFetch]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem'
    }}>
      <section className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>#{index + 1} を設定</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>✕</button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-secondary)' }}>
              YouTube 動画またはチャンネルのURLをペースト
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                autoFocus
                placeholder="https://www.youtube.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'var(--color-surface-2)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </div>
          </div>

          <div style={{ minHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.2)' }}>
            {loading ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '30px', height: '30px', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>情報を取得中...</p>
              </div>
            ) : preview ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>プレビュー:</p>
                <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                  <YtGridSlot slot={preview} index={index} />
                </div>
                <button
                  onClick={() => onSelect(preview)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: 'var(--shadow-sm)',
                    marginTop: '0.5rem'
                  }}
                >
                  この内容でセットする
                </button>
              </div>
            ) : error ? (
              <p style={{ color: 'var(--color-error)', fontSize: '0.85rem' }}>{error}</p>
            ) : (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                URLを入力すると<br />ここにプレビューが表示されます
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
