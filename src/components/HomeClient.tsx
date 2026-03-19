'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import type { MangaItem } from '@/types';
import { THEME_GRADIENTS } from '@/lib/themes';
import PromotionUnit from '@/components/PromotionUnit';

export default function HomeClient() {
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
  const [deviceId, setDeviceId] = useState<string>('');
  const [postHistory, setPostHistory] = useState<{ id: string, theme?: string, date: number }[]>([]);
  const [lastFetchedTheme, setLastFetchedTheme] = useState<string | null>(null);
  const [isScanMode, setIsScanMode] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanHint, setScanHint] = useState<string | null>(null);

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

      // deviceId の取得または生成
      let dId = localStorage.getItem('9coma_device_id');
      if (!dId) {
        dId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('9coma_device_id', dId);
      }
      setDeviceId(dId);

      // 投稿履歴の取得
      const history = localStorage.getItem('post_history_9coma');
      if (history) {
        try {
          setPostHistory(JSON.parse(history));
        } catch (e) {
          console.error('History parsing failed:', e);
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

  // スキャナーの制御
  useEffect(() => {
    if (!isScanMode) return;

    let html5QrCode: Html5Qrcode | null = null;
    const readerId = "reader";

    const startScanner = async () => {
      setScanError(null);
      try {
        html5QrCode = new Html5Qrcode(readerId, { formatsToSupport: [ Html5QrcodeSupportedFormats.EAN_13 ], verbose: false });
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (viewfinderWidth) => {
              // 1Dバーコード（ISBN）の認識にはある程度の縦幅が必要なため少し拡大
              const width = Math.min(viewfinderWidth * 0.8, 280);
              const height = 120; // 100px から 120px に拡大して精度向上
              return { width, height };
            }
          },
          (decodedText) => {
            console.log(`[Scanner] Decoded: ${decodedText}`);
            // ISBN-13 (978で始まる13桁) のバリデーション
            if (/^978\d{10}$/.test(decodedText)) {
              console.log(`[Scanner] Valid ISBN detected: ${decodedText}`);
              
              // フィードバック
              if (typeof window !== 'undefined' && window.navigator.vibrate) {
                window.navigator.vibrate([100]);
              }

              // スキャン停止と検索実行
              setIsScanMode(false);
              setSearchTitle(decodedText);
              // 即座に検索を実行 (useEffect のデバウンスを待たずに実行)
              handleSearch('', decodedText, '');
            } else {
              // ISBN ではないバーコードを読み取った場合 (192始まり等)
              setScanHint(`読み取り：${decodedText}\nISBN ではないバーコードです。上の段を写してください`);
              // 3秒後にヒントを消す
              setTimeout(() => setScanHint(null), 3000);
            }
          },
          () => {
            // 解析失敗は無視
          }
        );
      } catch (err: unknown) {
        console.error("[Scanner] Start failed:", err);
        let msg = "カメラの起動に失敗しました。";
        
        const error = err as Error;
        
        // セキュアコンテキストのチェック
        if (typeof window !== 'undefined' && !window.isSecureContext) {
          msg = "カメラの使用には HTTPS 接続が必要です。ローカル IP (http://192...) ではなく localhost または ngrok 等の HTTPS 環境で試してください。";
        } else if (error?.name === "NotAllowedError") {
          msg = "カメラの使用が許可されていません。ブラウザの設定から許可してください。";
        } else if (error?.name === "NotFoundError") {
          msg = "カメラが見つかりません。デバイの設定を確認してください。";
        } else if (error?.name === "NotReadableError") {
          msg = "カメラが他のアプリで使用されている可能性があります。";
        }
        
        setScanError(msg);
      }
    };

    startScanner();

    return () => {
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => html5QrCode?.clear()).catch(console.error);
        } else {
          try { html5QrCode.clear(); } catch { }
        }
      }
    };
  }, [isScanMode, handleSearch]);

  // モーダルが開いた際の状態リセット
  useEffect(() => {
    if (selectedSlotIndex !== null) {
      setKeyword('');
      setSearchTitle('');
      setSearchAuthor('');
      setSearchResults([]);
      setIsScanMode(false);
      setScanError(null);
      setScanHint(null);
    }
  }, [selectedSlotIndex]);


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
      setLastFetchedTheme(null);
      return;
    }

    // テーマが変更された場合は即座にクリア
    if (theme !== lastFetchedTheme) {
      setThemeRecommendations([]);
    }

    if (isLoadingRecommendations || (themeRecommendations.length > 0 && theme === lastFetchedTheme)) {
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
          setLastFetchedTheme(theme);
        }
      } catch (e) {
        console.error('Recommendations fetch failed:', e);
        if (!cancelled) {
          setThemeRecommendations([]);
          setLastFetchedTheme(null);
        }
      } finally {
        if (!cancelled) setIsLoadingRecommendations(false);
      }
    };
    fetchRecommendations();
    return () => { cancelled = true; };
  }, [selectedSlotIndex, theme, lastFetchedTheme, isLoadingRecommendations, themeRecommendations.length]); // 依存配列を最小限に整理

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

    const currentPostContent = {
      slots: slots.map(s => s ? s.isbn : null),
      authorName: authorName || '私',
      theme: theme || undefined
    };

    const lastPostStr = localStorage.getItem('last_post_9coma');
    if (lastPostStr) {
      try {
        const lastPost = JSON.parse(lastPostStr);
        if (JSON.stringify(lastPost.content) === JSON.stringify(currentPostContent)) {
          router.push(`/list/${lastPost.id}`);
          return;
        }
      } catch (e) {
        console.error('Last post parsing failed:', e);
      }
    }

    setIsSharing(true);
    try {
      const res = await fetch('/api/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slots,
          authorName: authorName || '私',
          theme: theme || undefined,
          deviceId
        }),
      });
      const data = await res.json();
      if (data.id) {
        localStorage.setItem('last_post_9coma', JSON.stringify({
          id: data.id,
          content: currentPostContent
        }));

        const newHistoryItem = { id: data.id, theme: theme || undefined, date: Date.now() };
        const updatedHistory = [newHistoryItem, ...postHistory.filter(h => h.id !== data.id)].slice(0, 5);
        setPostHistory(updatedHistory);
        localStorage.setItem('post_history_9coma', JSON.stringify(updatedHistory));

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
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="google-anno-skip" style={{ textAlign: 'center', margin: '3rem 0 1rem 0' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          私を構成する9つのマンガ
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          あなたの人生に影響を与えた漫画は？
        </p>
      </header>

      <section className="grid-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.2rem' }}>
          💡 テーマを選んでコマをタップしてマンガを検索！
        </p>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="themeSelect" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>テーマ</label>
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
              fontSize: '16px',
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
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                ▼ 長押ししてドラッグで場所を入れ替えられます。
              </p>
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

        {postHistory.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '1.2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--color-border)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span>🕒 最近あなたが作ったリスト</span>
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {postHistory.map((item) => (
                <a
                  key={item.id}
                  href={`/list/${item.id}`}
                  style={{
                    padding: '0.5rem 0.8rem',
                    background: item.theme ? (THEME_GRADIENTS[item.theme] || 'var(--color-surface-2)') : 'var(--color-surface-2)',
                    color: item.theme ? '#fff' : 'var(--color-text)',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  {item.theme ? `#${item.theme}` : '（テーマなし）'}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {selectedSlotIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem'
        }}>
          <section className="search-section animate-fade-in" style={{
            width: '100%',
            maxWidth: '600px',
            height: '80vh',
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  autoFocus
                  placeholder="作品名で探す..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  style={{ flex: 1, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px' }}
                />
                <button
                  onClick={() => setIsScanMode(!isScanMode)}
                  title="バーコードスキャン"
                  style={{
                    background: isScanMode ? 'var(--color-primary)' : 'var(--color-surface-2)',
                    color: isScanMode ? 'white' : 'var(--color-text)',
                    border: '2px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                    flexShrink: 0
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Corners */}
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    {/* Barcode lines with varying widths */}
                    <rect x="7" y="7" width="1.5" height="10" fill="currentColor" stroke="none" />
                    <rect x="10.5" y="7" width="3" height="10" fill="currentColor" stroke="none" />
                    <rect x="15.5" y="7" width="1" height="10" fill="currentColor" stroke="none" />
                    {/* Scan line (optional, adding a slight horizontal accent) */}
                    <line x1="6" y1="12" x2="18" y2="12" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.8" />
                  </svg>
                </button>
              </div>
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
            {isScanMode && (
              <div style={{ 
                margin: '0 1.5rem 1rem',
                background: '#000', 
                borderRadius: 'var(--radius-md)', 
                aspectRatio: '1.2 / 1', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                border: '2px solid var(--color-primary)'
              }}>
                {scanError ? (
                  <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ color: '#ffbaba', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>{scanError}</p>
                    <button 
                      onClick={() => setIsScanMode(false)}
                      style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid #fff', color: '#fff', padding: '0.4rem 1rem', borderRadius: '99px', fontSize: '0.8rem' }}
                    >
                      閉じる
                    </button>
                  </div>
                ) : (
                  <>
                    <div id="reader" style={{ width: '100%', height: '100%' }}></div>
                    {/* Visual Scan Frame Overlay */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {scanHint && (
                        <div style={{ 
                          position: 'absolute',
                          top: '20px', // 上部に表示して下の吹き出しと重ならないようにする
                          background: 'rgba(255, 186, 186, 0.95)', 
                          color: '#b00', 
                          padding: '0.6rem 1rem', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          textAlign: 'center',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          whiteSpace: 'pre-wrap',
                          zIndex: 20
                        }}>
                          {scanHint}
                        </div>
                      )}
                      <div style={{ 
                        width: '280px', 
                        height: '120px', 
                        border: '2px solid var(--color-primary)', 
                        borderRadius: '8px',
                        boxShadow: '0 0 0 4000px rgba(0,0,0,0.4)',
                        position: 'relative'
                      }}>
                        {/* Corners */}
                        <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '15px', height: '15px', borderTop: '4px solid #fff', borderLeft: '4px solid #fff', borderTopLeftRadius: '6px' }}></div>
                        <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '15px', height: '15px', borderTop: '4px solid #fff', borderRight: '4px solid #fff', borderTopRightRadius: '6px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '15px', height: '15px', borderBottom: '4px solid #fff', borderLeft: '4px solid #fff', borderBottomLeftRadius: '6px' }}></div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '15px', height: '15px', borderBottom: '4px solid #fff', borderRight: '4px solid #fff', borderBottomRightRadius: '6px' }}></div>
                      </div>
                    </div>
                    <div style={{ padding: '0.3rem 0.6rem', position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '99px', textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, margin: '0 0 1px 0', color: '#fff' }}>
                        バーコードを中央の枠内に収めてください
                      </p>
                      <p style={{ fontSize: '0.7rem', color: '#FFD600', margin: 0 }}>
                        ※上下2段ある場合は、上のバーコードを。
                      </p>
                    </div>
                  </>
                )}
                <button 
                  onClick={() => setIsScanMode(false)}
                  style={{ 
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.5)', 
                    border: '1px solid #fff', 
                    color: '#fff', 
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%', 
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  ✕
                </button>
              </div>
            )}

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
              ) : !(keyword.trim() || searchTitle.trim() || searchAuthor.trim()) && (isLoadingRecommendations || !lastFetchedTheme || theme !== lastFetchedTheme) ? (
                Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
              ) : !(keyword.trim() || searchTitle.trim() || searchAuthor.trim()) && themeRecommendations.length > 0 ? (
                <>
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>
                    📚 {theme} で多くの人が選んでいる作品：
                  </p>
                  {themeRecommendations.map((manga) => (
                    <div key={manga.isbn} className="manga-result-card" onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)', display: 'flex', flexDirection: 'column' }}>
                      <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem', border: '1px solid var(--color-border)' }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{manga.title}</p>
                    </div>
                  ))}
                </>
              ) : (keyword.trim() || searchTitle.trim() || searchAuthor.trim()) && (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>見つかりませんでした</p>
              )}
              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <PromotionUnit slotId="modal-bottom" format="fluid" />
              </div>
            </div>
          </section>
        </div>
      )}

      <section style={{ maxWidth: '400px', margin: '3rem auto 0', padding: '0 1rem' }}>
        <input
          type="text"
          placeholder="あなたの名前（空欄可）"
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

      <PromotionUnit slotId="home-bottom" maxHeight="280px" />
    </div>
  );
}
