'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MangaItem } from '@/types';

export default function Home() {
  const router = useRouter();
  const [slots, setSlots] = useState<(MangaItem | null)[]>(Array(9).fill(null));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<MangaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // 検索処理
  const handleSearch = useCallback(async (val: string) => {
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // デバウンス的な検索
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, handleSearch]);

  const selectManga = (manga: MangaItem) => {
    if (selectedSlotIndex === null) return;
    const newSlots = [...slots];
    newSlots[selectedSlotIndex] = manga;
    setSlots(newSlots);
    setSelectedSlotIndex(null);
    setKeyword('');
    setSearchResults([]);
  };

  const removeManga = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots, authorName: authorName || '名無し' }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/list/${data.id}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header style={{ textAlign: 'center', margin: '3rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          9coma
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          あなたを構成する漫画9選をシェアしよう
        </p>
      </header>

      <section className="grid-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'var(--color-surface)', padding: '10px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          {slots.map((manga, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSlotIndex(idx)}
              style={{
                position: 'relative',
                background: 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedSlotIndex === idx ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'var(--transition-fast)',
                aspectRatio: '1 / 1.4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {manga ? (
                <>
                  <img src={manga.imageUrl} alt={manga.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={(e) => removeManga(idx, e)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    ×
                  </button>
                </>
              ) : (
                <span style={{ fontSize: '2rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>{idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedSlotIndex !== null && (
        <section className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
            <input
              type="text"
              autoFocus
              placeholder="漫画のタイトルを検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'white' }}
            />
            <button onClick={() => setSelectedSlotIndex(null)} style={{ padding: '0 1rem', color: 'var(--color-text-secondary)' }}>閉じる</button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {isSearching ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
            ) : searchResults.length > 0 ? (
              searchResults.map((manga) => (
                <div key={manga.isbn} onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                  <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{manga.title}</p>
                </div>
              ))
            ) : keyword && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>見つかりませんでした</p>
            )}
          </div>
        </section>
      )}

      <section style={{ marginTop: '3rem', maxWidth: '400px', margin: '3rem auto 0' }}>
        <input
          type="text"
          placeholder="あなたの名前（任意）"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{ width: '100%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'white', marginBottom: '1rem' }}
        />
        <button
          onClick={handleShare}
          disabled={slots.every(s => s === null) || isSharing}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            boxShadow: 'var(--shadow-primary)',
            opacity: slots.every(s => s === null) || isSharing ? 0.5 : 1,
            transition: 'var(--transition-base)'
          }}
        >
          {isSharing ? '保存中...' : 'ページを作成してシェア'}
        </button>
      </section>
    </main>
  );
}
