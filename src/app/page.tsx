'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MangaItem } from '@/types';
import { THEME_GRADIENTS } from '@/lib/themes';
import PromotionUnit from '@/components/PromotionUnit';

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
  const [themeRecommendations, setThemeRecommendations] = useState<MangaItem[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

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

  // モーダルが開いたときにテーマ別おすすめを取得
  useEffect(() => {
    if (selectedSlotIndex === null) return;
    if (!theme) {
      setThemeRecommendations([]);
      return;
    }
    let cancelled = false;
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const res = await fetch(`/api/popular?theme=${encodeURIComponent(theme)}`);
        const data = await res.json();
        if (!cancelled) {
          setThemeRecommendations(data.items || []);
        }
      } catch (e) {
        console.error('Recommendations fetch failed:', e);
        if (!cancelled) setThemeRecommendations([]);
      } finally {
        if (!cancelled) setIsLoadingRecommendations(false);
      }
    };
    fetchRecommendations();
    return () => { cancelled = true; };
  }, [selectedSlotIndex, theme]);

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
      <header className="google-anno-skip" style={{ textAlign: 'center', margin: '3rem 0 1rem 0' }}>
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
              fontSize: '16px', // iOSの自動ズーム防止のために16pxを指定
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

        {/* 進捗バー */}
        {(() => {
          const filledCount = slots.filter(s => s !== null).length;
          const pct = (filledCount / 9) * 100;
          const isDone = filledCount === 9;
          return (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDone ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {isDone ? '🎉 完成！シェアしよう！' : `あと ${9 - filledCount} 冊で完成！`}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-text)' }}>
                  {filledCount} / 9
                </span>
              </div>
              <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: isDone ? 'var(--gradient-primary)' : 'linear-gradient(90deg, #FFD600, #FF8C00)',
                  borderRadius: '99px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          );
        })()}

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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // 白っぽく変更
          backdropFilter: 'blur(5px)', // ぼかしを少し強める
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <section className="search-section animate-fade-in" style={{ 
            width: '100%', 
            maxWidth: '600px', 
            height: '80vh', // 高さを固定して結果表示でガタガタ動くのを防止
            maxHeight: '800px', 
            background: 'var(--color-surface)', 
            borderRadius: 'var(--radius-lg)', 
            border: '2px solid var(--color-border)', 
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.05em', margin: 0 }}>
                    #{selectedSlotIndex + 1}
                  </h2>
                  {theme && (
                    <div style={{ padding: '0.2rem 0.8rem', background: THEME_GRADIENTS[theme] || 'var(--color-surface-2)', color: '#fff', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, boxShadow: 'var(--shadow-sm)' }}>
                      #{theme}
                    </div>
                  )}
                </div>
                <button onClick={() => setSelectedSlotIndex(null)} style={{ background: 'var(--color-surface-2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-text-secondary)', transition: 'var(--transition-fast)' }}>✕</button>
              </div>
              <input
                type="text"
                autoFocus
                placeholder="漫画のタイトルで探す..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={{ width: '100%', background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="著者名で探す..."
                  value={searchAuthor}
                  onChange={(e) => setSearchAuthor(e.target.value)}
                  style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px' }}
                />
                <input
                  type="text"
                  placeholder="その他キーワード..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px' }}
                />
              </div>
            </div>

            <div style={{ overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', flexGrow: 1, alignContent: 'start' }}>
              {isSearching ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
              ) : searchResults.length > 0 ? (
                searchResults.map((manga) => (
                  <div key={manga.isbn} className="manga-result-card" onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)', display: 'flex', flexDirection: 'column' }}>
                    <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem', border: '1px solid var(--color-border)' }} />
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{manga.title}</p>
                  </div>
                ))
              ) : !(keyword || searchTitle || searchAuthor) && isLoadingRecommendations ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
              ) : !(keyword || searchTitle || searchAuthor) && themeRecommendations.length > 0 ? (
                <>
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>
                    📚 {theme} でよく選ばれています
                  </p>
                  {themeRecommendations.map((manga) => (
                    <div key={manga.isbn} className="manga-result-card" onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)', display: 'flex', flexDirection: 'column' }}>
                      <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem', border: '1px solid var(--color-border)' }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{manga.title}</p>
                    </div>
                  ))}
                </>
              ) : (keyword || searchTitle || searchAuthor) && (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>見つかりませんでした</p>
              )}
              {/* 検索モーダル内広告 */}
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <PromotionUnit slotId="modal-bottom" format="fluid" />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 下部フォーム・ボタングループ */}
      <section style={{ maxWidth: '400px', margin: '3rem auto 0', padding: '0 1rem' }}>
        <input
          type="text"
          placeholder="あなたの名前（任意）"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{ width: '100%', background: 'var(--color-surface)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px', marginBottom: '1.2rem', boxShadow: 'var(--shadow-sm)' }}
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

      {/* トップページ最下部広告 */}
      <PromotionUnit slotId="home-bottom" maxHeight="280px" />
    </main>
  );
}
