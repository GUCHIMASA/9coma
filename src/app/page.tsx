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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [theme, setTheme] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回マウント時のクローン＆ドラフト復元処理
  useEffect(() => {
    const initData = async () => {
      const params = new URLSearchParams(window.location.search);
      const cloneId = params.get('clone');

      if (cloneId) {
        try {
          const res = await fetch(`/api/list?id=${cloneId}`);
          const data = await res.json();
          if (data && data.slots) {
            setSlots(data.slots);
          }
        } catch (e) {
          console.error('Clone fetch failed:', e);
        }
        window.history.replaceState({}, '', '/');
      } else {
        const saved = localStorage.getItem('draft_9coma');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.slots) setSlots(parsed.slots);
            if (parsed.authorName) setAuthorName(parsed.authorName);
            if (parsed.theme) setTheme(parsed.theme);
          } catch (e) {
            console.error('Draft parsing failed:', e);
          }
        }
      }
      setIsLoaded(true);
    };
    initData();
  }, []);

  // 状態が変わるたびに下書きを保存
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('draft_9coma', JSON.stringify({ slots, authorName, theme }));
    }
  }, [slots, authorName, theme, isLoaded]);

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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // FirefoxではDataTransferに何かセットしないとドラッグが発火しない場合があるためのワークアラウンド
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSlots = [...slots];
    const dragItem = newSlots[draggedIndex];
    newSlots[draggedIndex] = newSlots[dropIndex];
    newSlots[dropIndex] = dragItem;
    
    setSlots(newSlots);
    setDraggedIndex(null);
  };

  const handleClear = () => {
    if (window.confirm('これまで選んだマンガをすべてクリアして最初から作り直しますか？')) {
      setSlots(Array(9).fill(null));
      setAuthorName('');
      setTheme('');
      localStorage.removeItem('draft_9coma');
      setSelectedSlotIndex(null);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots, authorName: authorName || '私', theme: theme || undefined }),
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
      <header style={{ textAlign: 'center', margin: '3rem 0 1rem 0' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          9coma
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          あなたを構成する9つのマンガをシェアしよう
        </p>
      </header>

      <section className="grid-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="themeSelect" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>テーマ（タグ）</label>
          <select
            id="themeSelect"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-2)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
              transition: 'var(--transition-fast)'
            }}
          >
            <option value="">設定しない（デフォルト）</option>
            <option value="人生のバイブル編">人生のバイブル編</option>
            <option value="涙腺崩壊・感涙編">涙腺崩壊・感涙編</option>
            <option value="腹筋崩壊・爆笑編">腹筋崩壊・爆笑編</option>
            <option value="メンタル浄化編">メンタル浄化編</option>
            <option value="あの頃（青春）編">あの頃（青春）編</option>
            <option value="大人で刺さった編">大人で刺さった編</option>
            <option value="今これ激アツ！編">今これ激アツ！編</option>
            <option value="原点にして頂点編">原点にして頂点編</option>
            <option value="布教用ガチ推し編">布教用ガチ推し編</option>
            <option value="画力に溺れる編">画力に溺れる編</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'var(--color-border)', padding: '12px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
          {slots.map((manga, idx) => (
            <div
              key={idx}
              draggable={manga !== null}
              onDragStart={(e) => manga && handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, idx)}
              onClick={() => setSelectedSlotIndex(idx)}
              style={{
                position: 'relative',
                background: idx === 4 ? '#FFA8B8' : 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: manga ? 'grab' : 'pointer',
                border: dragOverIndex === idx ? '3px dashed var(--color-primary)' 
                      : selectedSlotIndex === idx ? '3px solid var(--color-primary)' 
                      : '2px solid var(--color-border)',
                transition: 'var(--transition-fast)',
                aspectRatio: '1 / 1.4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: draggedIndex === idx ? 0.5 : 1,
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
        <button
          onClick={handleClear}
          style={{
            width: '100%',
            padding: '1rem',
            marginTop: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '1rem',
            border: '2px solid var(--color-border)',
            transition: 'var(--transition-fast)'
          }}
        >
          最初から作り直す（クリア）
        </button>
      </section>
    </main>
  );
}
