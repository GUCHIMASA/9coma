'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MangaItem } from '@/types';

export default function Home() {
  const router = useRouter();
  const [slots, setSlots] = useState<(MangaItem | null)[]>(Array(9).fill(null));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchResults, setSearchResults] = useState<MangaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // 検索処理
  const handleSearch = useCallback(async (k: string, t: string, a: string) => {
    if (!k.trim() && !t.trim() && !a.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (k.trim()) params.set('keyword', k.trim());
      if (t.trim()) params.set('title', t.trim());
      if (a.trim()) params.set('author', a.trim());
      
      const res = await fetch(`/api/search?${params.toString()}`);
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
      handleSearch(keyword, searchTitle, searchAuthor);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, searchTitle, searchAuthor, handleSearch]);

  const selectManga = (manga: MangaItem) => {
    if (selectedSlotIndex === null) return;
    const newSlots = [...slots];
    newSlots[selectedSlotIndex] = manga;
    setSlots(newSlots);
    setSelectedSlotIndex(null);
    setKeyword('');
    setSearchTitle('');
    setSearchAuthor('');
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
          あなたを構成する9つのマンガをシェアしよう
        </p>
      </header>

      <section className="grid-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--color-border)', padding: '12px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          {slots.map((manga, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSlotIndex(idx)}
              style={{
                position: 'relative',
                background: idx === 4 ? '#FFA8B8' : 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedSlotIndex === idx ? '3px solid var(--color-primary)' : '2px solid var(--color-border)',
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
                      top: '6px',
                      right: '6px',
                      background: 'var(--color-accent)',
                      color: 'white',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      border: '2px solid var(--color-border)',
                      boxShadow: '2px 2px 0px rgba(0,0,0,0.2)'
                    }}
                  >
                    ×
                  </button>
                </>
              ) : (
                <span style={{ fontSize: '2.5rem', color: 'var(--color-text-muted)', fontWeight: 900 }}>{idx + 1}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {selectedSlotIndex !== null && (
        <section className="animate-fade-in" style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
            <input
              type="text"
              autoFocus
              placeholder="漫画のタイトルで探す..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              style={{ width: '100%', background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600 }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="著者名で探す..."
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600 }}
              />
              <input
                type="text"
                placeholder="その他キーワード..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600 }}
              />
            </div>
            <button onClick={() => setSelectedSlotIndex(null)} style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>閉じる</button>
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {isSearching ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
            ) : searchResults.length > 0 ? (
              searchResults.map((manga) => (
                <div key={manga.isbn} onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}>
                  <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem', border: '1px solid var(--color-border)' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{manga.title}</p>
                </div>
              ))
            ) : (keyword || searchTitle || searchAuthor) && (
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
          style={{ width: '100%', background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600, marginBottom: '1.2rem', boxShadow: 'var(--shadow-sm)' }}
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
