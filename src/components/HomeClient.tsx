/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import type { MangaItem } from '@/types';
import { THEME_GRADIENTS } from '@/lib/themes';
import { COLOR_THEMES, COLOR_THEMES_ORDER } from '@/lib/colors';
import PromotionUnit from '@/components/PromotionUnit';
import MyHistory from '@/components/MyHistory';

export default function HomeClient() {
  const router = useRouter();
  const [slots, setSlots] = useState<(MangaItem | null)[]>(Array(9).fill(null));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchIsbn, setSearchIsbn] = useState('');
  const [searchResults, setSearchResults] = useState<MangaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [theme, setTheme] = useState('');
  const [bgColorId, setBgColorId] = useState('01');
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
  
  // 無限スクロール関連
  const [searchPage, setSearchPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchSort, setSearchSort] = useState('standard'); // ソート順 (standard, +releaseDate)
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const lastSearchParams = React.useRef({ k: '', t: '', a: '', isbn: '', s: 'standard' });

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
            if (parsed.bgColorId) setBgColorId(parsed.bgColorId);
            // URL パラメータがない場合のみドラフトから復元
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
      localStorage.setItem('draft_9coma', JSON.stringify({ slots, authorName, theme, bgColorId }));
    }
  }, [slots, authorName, theme, bgColorId, isLoaded]);

  // 背景色のページ全体への適用
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const selected = COLOR_THEMES[bgColorId] || COLOR_THEMES['01'];
      document.body.style.backgroundColor = selected.bg;
      document.body.style.transition = 'background-color 0.3s ease';
      
      const isDark = selected.text === '#FFFFFF';
      document.body.style.backgroundColor = selected.bg;
      document.body.style.transition = 'background-color 0.3s ease';
      
      // 全体背景とテキストの適用（スクロールバーや固定ボタンにも連動）
      document.documentElement.style.setProperty('--color-bg', selected.bg);
      document.documentElement.style.setProperty('--color-text', selected.text);
      document.documentElement.style.setProperty('--color-text-secondary', isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)');
      
      // コンテナやモーダルの背景色
      document.documentElement.style.setProperty('--color-surface', isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff');
      document.documentElement.style.setProperty('--color-surface-2', isDark ? 'rgba(255, 255, 255, 0.2)' : '#f9fafb');
      document.documentElement.style.setProperty('--color-border', isDark ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb');

      // 検索モーダルのオーバーレイ背景色
      document.documentElement.style.setProperty('--color-overlay', isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(255, 255, 255, 0.6)');

      // 5番スロットのほんのり強調用ピンク (透明度を下げて背景色に馴染ませる)
      document.documentElement.style.setProperty('--color-highlight', 'rgba(244, 143, 177, 0.25)');

      // デフォルト（黄）以外の場合は、タイトル等の強調色（プライマリカラー）も統一感のある色に変更
      if (bgColorId === '01') {
        document.documentElement.style.setProperty('--color-primary', '#0066FF');
        document.documentElement.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #0066FF 0%, #FF0066 100%)');
        document.documentElement.style.setProperty('--color-primary-text', '#FFFFFF');
      } else {
        document.documentElement.style.setProperty('--color-primary', isDark ? '#FFD600' : '#1A1A1A'); // 暗所では黄色、明所では黒をアクセントに
        document.documentElement.style.setProperty('--gradient-primary', isDark ? 'linear-gradient(135deg, #FFFFFF 0%, #CCCCCC 100%)' : 'linear-gradient(135deg, #1A1A1A 0%, #444444 100%)');
        document.documentElement.style.setProperty('--color-primary-text', isDark ? '#1A1A1A' : '#FFFFFF');
      }

      // スクロールバーの同期
      document.documentElement.style.setProperty('--scrollbar-thumb', isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)');
      document.documentElement.style.setProperty('--scrollbar-thumb-hover', isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)');
    }
  }, [bgColorId]);


  // 検索処理
  const handleSearch = useCallback(async (k: string, t: string, a: string, isbn: string = '', page: number = 1, sort: string = 'standard') => {
    if (!k.trim() && !t.trim() && !a.trim() && !isbn.trim()) {
      setSearchResults([]);
      setHasMore(false);
      return;
    }

    if (page === 1) {
      setIsSearching(true);
      setSearchPage(1);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      if (isbn.trim()) {
        params.set('isbn', isbn.trim());
      } else {
        if (k.trim()) params.set('keyword', k.trim());
        if (t.trim()) params.set('title', t.trim());
        if (a.trim()) params.set('author', a.trim());
        params.set('sort', sort);
      }
      params.set('page', page.toString());

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      
      const newItems = data.items || [];
      if (page === 1) {
        setSearchResults(newItems);
        lastSearchParams.current = { k, t, a, isbn, s: sort };
      } else {
        setSearchResults(prev => [...prev, ...newItems]);
      }

      // 次のページがあるか判定（ヒット件数が hits=30 未満なら次はない）
      // または API から明示的に isLastPage のようなフラグが来る場合はそれを使う
      const pageSize = data.hits || 30;
      if (newItems.length > 0) {
        setSearchPage(page);
      }
      setHasMore(newItems.length >= pageSize);

    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  }, []);

  // 追加読み込み
  const loadMore = useCallback(() => {
    // すでに読み込み中、またはこれ以上のデータがない場合は何もしない
    if (isLoadingMore || isSearching || !hasMore) return;
    
    const { k, t, a, isbn, s } = lastSearchParams.current;
    if (!k && !t && !a && !isbn) return;

    // ページ番号をインクリメントして検索を実行
    handleSearch(k, t, a, isbn, searchPage + 1, s);
  }, [isLoadingMore, isSearching, hasMore, searchPage, handleSearch]);

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
            aspectRatio: 1.2, // config 側で指定することで起動エラーを回避しつつプレビューを固定
            qrbox: (viewfinderWidth) => {
              // アスペクト比を 1.2 に固定したため、viewfinderWidth/Height が
              // プレビュー表示領域と一致し、ガイド枠とのズレが解消される
              const width = Math.min(viewfinderWidth * 0.8, 280);
              const height = 120; 
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
              setSearchIsbn(decodedText);
              // 即座に検索を実行
              handleSearch('', '', '', decodedText);
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
      setSearchIsbn('');
      setSearchResults([]);
      setIsScanMode(false);
      setScanError(null);
      setScanHint(null);
    }
  }, [selectedSlotIndex]);


  // デバウンス的な検索
  useEffect(() => {
    // すべての入力が空になった場合は、検索結果をクリアして「おすすめ」が表示される状態にする
    if (!keyword.trim() && !searchTitle.trim() && !searchAuthor.trim() && !searchIsbn.trim()) {
      setSearchResults([]);
      setHasMore(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(keyword, searchTitle, searchAuthor, searchIsbn, 1, searchSort);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, searchTitle, searchAuthor, searchIsbn, searchSort, handleSearch]); // searchSort を追加

  // 無限スクロールの監視
  useEffect(() => {
    // 検索中やこれ以上のデータがない場合は監視を開始しない
    if (!hasMore || isLoadingMore || isSearching) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { 
      root: null,
      rootMargin: '300px', // 検知を少し早める
      threshold: 0 
    });

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, isLoadingMore, isSearching, loadMore]); // isSearching を追加して監視を確実に再開

  // モーダルが開いたときにテーマ別おすすめを取得
  useEffect(() => {
    if (selectedSlotIndex === null) return;
    
    // 現在のテーマがすでに取得済みならスキップ
    if (themeRecommendations.length > 0 && theme === lastFetchedTheme) {
      return;
    }

    let cancelled = false;
    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const themeParam = theme ? `theme=${encodeURIComponent(theme)}` : '';
        const res = await fetch(`/api/popular?${themeParam}`);
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
  }, [selectedSlotIndex, theme, lastFetchedTheme, themeRecommendations.length]); 

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
      theme: theme || undefined,
      colorThemeId: bgColorId
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
          colorThemeId: bgColorId,
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

        {/* カラー選択 UI */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '6px', whiteSpace: 'nowrap' }}>背景色</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', flex: 1, overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

            <style dangerouslySetInnerHTML={{ __html: `div::-webkit-scrollbar { display: none; }` }} />

            {COLOR_THEMES_ORDER.map((id: string) => {
              const c = COLOR_THEMES[id];
              return (
                <button
                  key={c.id}
                  onClick={() => setBgColorId(c.id)}
                  title={c.name}
                  style={{
                     width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                     backgroundColor: c.bg,
                     border: bgColorId === c.id ? `3px solid var(--color-primary)` : `2px solid var(--color-border)`,
                     boxShadow: bgColorId === c.id ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                     cursor: 'pointer',
                     padding: 0,
                     transition: 'all 0.2s ease',
                     transform: bgColorId === c.id ? 'scale(1.1)' : 'scale(1)'
                  }}

                />
              )
            })}
          </div>
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

        {/* 作成履歴コンポーネント（ここへ移動） */}
        <MyHistory
          storageKey="post_history_9coma"
          basePath="/list/"
          title="🕒 最近あなたが作ったマンガリスト"
        />

        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '1.5rem'
        }}>
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
                background: idx === 4 && !manga ? 'var(--color-highlight)' : 'var(--color-surface-2)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                cursor: manga ? 'grab' : 'pointer',
                border: dragOverIndex === idx ? '3px dashed var(--color-primary)'
                  : selectedSlotIndex === idx ? '3px solid var(--color-primary)'
                    : 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
                  {/* タイトル表示帯の統一（下から上へのグラデーション） */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                    padding: '32px 8px 8px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}>
                    <span style={{
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.2',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                    }}>
                      {manga.title}
                    </span>
                  </div>
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
          backgroundColor: 'var(--color-overlay)',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 1行目: 作品名 */}
                <input
                  type="text"
                  autoFocus
                  placeholder="作品名で探す..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  style={{ width: '100%', background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px' }}
                />

                {/* 2行目: 著者名 ＋ ソート */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="著者名で探す..."
                    value={searchAuthor}
                    onChange={(e) => setSearchAuthor(e.target.value)}
                    style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.7rem 1rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '16px' }}
                  />
                  <div style={{ flexShrink: 0, display: 'flex', background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '2px', width: '160px' }}>
                    <button 
                      onClick={() => setSearchSort('standard')}
                      style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'calc(var(--radius-md) - 4px)', background: searchSort === 'standard' ? 'var(--color-primary)' : 'transparent', color: searchSort === 'standard' ? 'var(--color-primary-text)' : 'var(--color-text)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
                    >
                      新着
                    </button>
                    <button 
                      onClick={() => setSearchSort('+releaseDate')}
                      style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: 'calc(var(--radius-md) - 4px)', background: searchSort === '+releaseDate' ? 'var(--color-primary)' : 'transparent', color: searchSort === '+releaseDate' ? 'var(--color-primary-text)' : 'var(--color-text)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
                    >
                      古い
                    </button>
                  </div>
                </div>

                {/* 3行目: バーコード ＋ ISBN ＋ キーワード */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setIsScanMode(!isScanMode)}
                    title="バーコードスキャン"
                    style={{
                      background: isScanMode ? 'var(--color-primary)' : 'var(--color-surface-2)',
                      color: isScanMode ? 'white' : 'var(--color-text)',
                      border: '2px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      width: '44px',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      flexShrink: 0
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                      <rect x="7" y="7" width="1.5" height="10" fill="currentColor" stroke="none" />
                      <rect x="10.5" y="7" width="3" height="10" fill="currentColor" stroke="none" />
                      <rect x="15.5" y="7" width="1" height="10" fill="currentColor" stroke="none" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    placeholder="ISBN"
                    value={searchIsbn}
                    onChange={(e) => setSearchIsbn(e.target.value)}
                    style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.7rem 0.8rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px' }}
                  />
                  <input
                    type="text"
                    placeholder="キーワード"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={{ flex: 1, minWidth: 0, background: 'var(--color-surface-2)', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.7rem 0.8rem', color: 'var(--color-text)', fontWeight: 600, fontSize: '14px' }}
                  />
                </div>
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
                    {/* スキャン範囲とプレビュー位置を確実に一致させるためのスタイル強制 */}
                    <style dangerouslySetInnerHTML={{ __html: `
                      #reader { position: relative; }
                      #reader video {
                        object-fit: cover !important;
                        position: absolute !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        min-width: 100% !important;
                        min-height: 100% !important;
                      }
                      #reader canvas { display: none; }
                    ` }} />
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
                // 初回検索中のスケルトン
                Array(6).fill(0).map((_, i) => <div key={`skeleton-search-${i}`} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
              ) : searchResults.length > 0 ? (
                // 検索結果の表示
                <>
                  {searchResults.map((manga, i) => (
                    <div key={`search-res-${manga.isbn}-${i}`} className="manga-result-card" onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)', display: 'flex', flexDirection: 'column' }}>
                      <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem', border: '1px solid var(--color-border)' }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{manga.title}</p>
                    </div>
                  ))}
                  <div ref={sentinelRef} style={{ gridColumn: '1 / -1', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {isLoadingMore && (
                      <>
                        <div className="spinner-small" style={{ width: '24px', height: '24px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>しばらくお待ちください・・</span>
                      </>
                    )}
                  </div>
                </>
              ) : (keyword.trim() || searchTitle.trim() || searchAuthor.trim() || searchIsbn.trim()) ? (
                // 検索語があるが見つからなかった場合
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>見つかりませんでした</p>
              ) : isLoadingRecommendations ? (
                // おすすめ取得中のスケルトン
                Array(6).fill(0).map((_, i) => <div key={`skeleton-rec-${i}`} className="skeleton" style={{ aspectRatio: '1 / 1.4' }} />)
              ) : themeRecommendations.length > 0 ? (
                // おすすめ・トレンドの表示
                <>
                  <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-secondary)', margin: '0 0 0.5rem 0' }}>
                    📚 {theme || '最近のトレンド'} で多くの人が選んでいる作品：
                  </p>
                  {themeRecommendations.map((manga, i) => (
                    <div key={`rec-${manga.isbn}-${i}`} className="manga-result-card" onClick={() => selectManga(manga)} style={{ cursor: 'pointer', transition: 'var(--transition-fast)', display: 'flex', flexDirection: 'column' }}>
                      <img src={manga.imageUrl} alt={manga.title} style={{ borderRadius: 'var(--radius-sm)', width: '100%', aspectRatio: '1 / 1.4', objectFit: 'cover', marginBottom: '0.4rem', border: '1px solid var(--color-border)' }} />
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>{manga.title}</p>
                    </div>
                  ))}
                </>
              ) : (
                // データがない場合の表示
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                  おすすめ作品が見つかりませんでした。
                </p>
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
            color: 'var(--color-primary-text)',
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
