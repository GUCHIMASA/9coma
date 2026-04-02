'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { YouTubeSlot } from '@/types/youtube';
import { COLOR_THEMES, COLOR_THEMES_ORDER } from '@/lib/colors';
import YtGrid from '@/components/youtube/YtGrid';
import YtSearchModal from '@/components/youtube/YtSearchModal';
import MyHistory from '@/components/MyHistory';
import YtListCard from '@/components/youtube/YtListCard';
import type { YouTubeListItem } from '@/types/youtube';

// 9TUBE テーマ定義
const THEMES = [
  { id: 'default', label: '設定しない（デフォルト）' },
  { id: 'bgm', label: '作業用ＢＧＭ特選編' },
  { id: 'routine', label: '憧れのルーティン編' },
  { id: 'gaming', label: '伝説の実況神回編' },
  { id: 'mv', label: '至高のＭＶ選抜編' },
  { id: 'shorts', label: '爆笑ショート動画編' },
  { id: 'education', label: '至高の講義教養編' },
  { id: 'ai', label: '最先端ＡＩ活用術編' },
  { id: 'asmr', label: '究極の没入ASMR編' },
  { id: 'vtuber', label: 'Vtuber神回選抜編' },
  { id: 'animal', label: '至福の癒やし動物編' },
];

export default function YouTubePage() {
  const router = useRouter();
  const [slots, setSlots] = useState<(YouTubeSlot | null)[]>(Array(9).fill(null));
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [themeId, setThemeId] = useState('default');
  const [colorThemeId, setColorThemeId] = useState('01');
  const [isSharing, setIsSharing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [recentLists, setRecentLists] = useState<YouTubeListItem[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);

  // ドラッグ＆ドロップ用
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // ドラフト復元
    const saved = localStorage.getItem('draft_9tube');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.slots) setSlots(parsed.slots);
        if (parsed.authorName) setAuthorName(parsed.authorName || '');
        if (parsed.themeId) setThemeId(parsed.themeId || 'default');
        if (parsed.colorThemeId) setColorThemeId(parsed.colorThemeId || '01');
      } catch (e) {
        console.error('Draft parsing failed:', e);
      }
    }

    // デバイスID
    let dId = localStorage.getItem('9tube_device_id');
    if (!dId) {
      dId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('9tube_device_id', dId);
    }
    setDeviceId(dId);
    setIsLoaded(true);

    // 新着リストの取得
    const fetchRecent = async () => {
      setIsLoadingRecent(true);
      try {
        const res = await fetch('/api/9tube/list');
        if (!res.ok) throw new Error('Fetch failed');
        const data = await res.json();
        if (Array.isArray(data)) {
          setRecentLists(data);
        }
      } catch (e) {
        console.error('Failed to fetch recent 9tube lists:', e);
      } finally {
        setIsLoadingRecent(false);
      }
    };
    fetchRecent();
  }, []);

  // 下書き保存
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('draft_9tube', JSON.stringify({ slots, authorName, themeId, colorThemeId }));
    }
  }, [slots, authorName, themeId, colorThemeId, isLoaded]);

  // 背景色反映
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const selected = COLOR_THEMES[colorThemeId] || COLOR_THEMES['01'];
      const isDark = selected.text === '#FFFFFF';

      document.body.style.backgroundColor = selected.bg;
      document.body.style.color = selected.text;
      document.body.style.transition = 'background-color 0.3s ease';

      // 共通の動的 CSS 変数をセット（視認性確保の要）
      document.documentElement.style.setProperty('--color-bg', selected.bg);
      document.documentElement.style.setProperty('--color-text', selected.text);
      document.documentElement.style.setProperty('--color-text-secondary', isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)');
      document.documentElement.style.setProperty('--color-border', isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)');
      document.documentElement.style.setProperty('--color-surface-2', isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff');

      // スクロールバーの同期
      document.documentElement.style.setProperty('--scrollbar-thumb', isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)');
      document.documentElement.style.setProperty('--scrollbar-thumb-hover', isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)');
    }
  }, [colorThemeId]);

  const handleSelectSlot = (index: number) => {
    setSelectedSlotIndex(index);
  };

  const handleSetVideo = (video: YouTubeSlot) => {
    if (selectedSlotIndex === null) return;
    const newSlots = [...slots];
    newSlots[selectedSlotIndex] = video;
    setSlots(newSlots);
    setSelectedSlotIndex(null);
  };

  const handleRemoveSlot = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  };

  // ドラッグ＆ドロップ ハンドラ
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const onDragLeave = () => {
    setDragOverIndex(null);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const onDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex === dropIndex) return;

    const newSlots = [...slots];
    const dragItem = newSlots[dragIndex];
    newSlots[dragIndex] = newSlots[dropIndex];
    newSlots[dropIndex] = dragItem;

    setSlots(newSlots);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleShare = async () => {
    const filledCount = slots.filter(s => s !== null).length;
    if (filledCount === 0 || isSharing) return;

    setIsSharing(true);
    try {
      const selectedTheme = THEMES.find(t => t.id === themeId);
      const res = await fetch('/api/9tube/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slots,
          authorName: authorName || '私',
          theme: selectedTheme?.id === 'default' ? '' : selectedTheme?.label,
          themeId,
          colorThemeId,
          deviceId
        }),
      });
      const data = await res.json();
      if (data.id) {
        // 履歴の保存
        const themeLabel = THEMES.find(t => t.id === themeId)?.label;
        const newHistoryItem = {
          id: data.id,
          theme: themeLabel === '設定しない（デフォルト）' ? undefined : themeLabel,
          date: Date.now()
        };
        const historyStr = localStorage.getItem('post_history_9tube');
        let history = [];
        if (historyStr) {
          try {
            history = JSON.parse(historyStr);
          } catch (e) { }
        }
        const updatedHistory = [newHistoryItem, ...history.filter((h: any) => h.id !== data.id)].slice(0, 5);
        localStorage.setItem('post_history_9tube', JSON.stringify(updatedHistory));

        router.push(`/9tube/list/${data.id}`);
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('保存に失敗しました');
    } finally {
      setIsSharing(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('これまで選んだ動画をすべてクリアして最初から作り直しますか？')) {
      setSlots(Array(9).fill(null));
      setAuthorName('');
      setThemeId('default');
      localStorage.removeItem('draft_9tube');
      setSelectedSlotIndex(null);
    }
  };

  const filledCount = slots.filter(s => s !== null).length;
  const progressPct = (filledCount / 9) * 100;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="google-anno-skip" style={{ textAlign: 'center', margin: '3rem 0 1rem 0' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
          私を構成する9つのYouTube
        </h1>

      </header>

      <section className="grid-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.2rem' }}>
          💡 コマをタップしてYouTube動画のURLをペースト
        </p>

        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="themeSelect" style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>テーマ</label>
          <select
            id="themeSelect"
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              background: 'var(--color-surface-2)',
              border: '2px solid var(--color-border)',
              color: 'var(--color-text)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              appearance: 'none',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          >
            {THEMES.map(t => <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.label}</option>)}
          </select>
        </div>

        {/* カラー選択 UI */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '6px', whiteSpace: 'nowrap' }}>背景色</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', flex: 1, overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {COLOR_THEMES_ORDER.map(id => {
              const c = COLOR_THEMES[id];
              const isSelected = colorThemeId === id;
              return (
                <button
                  key={id}
                  onClick={() => setColorThemeId(id)}
                  title={c.name}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                    backgroundColor: c.bg,
                    border: isSelected ? `3px solid #FF0000` : `2px solid var(--color-border)`,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.2s ease',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
              );
            })}
          </div>
        </div>

        {(() => {
          const isDone = filledCount === 9;
          return (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isDone ? '#FF0000' : 'var(--color-text-secondary)' }}>
                  {isDone ? '🎉 完成！シェアしよう！' : `あと ${9 - filledCount} つで完成！`}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--color-text)' }}>
                  {filledCount} / 9
                </span>
              </div>
              <div style={{ height: '10px', background: 'var(--color-border)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: isDone ? 'linear-gradient(90deg, #FF0000, #FF8C00)' : 'linear-gradient(90deg, #FFD600, #FF8C00)',
                  borderRadius: '99px',
                  transition: 'width 0.3s ease'
                }} />
              </div>

              {/* 作成履歴コンポーネント（ここへ移動） */}
              <MyHistory
                storageKey="post_history_9tube"
                basePath="/9tube/list/"
                title="🕒 最近あなたが作った YouTube リスト"
              />

              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)', opacity: 0.5, marginTop: '1.2rem' }}>
                ▼ ドラッグで場所を入れ替えられます。
              </p>
            </div>
          );
        })()}

        <div style={{
          background: 'rgba(0,0,0,0.1)',
          padding: '12px',
          borderRadius: '20px',
          marginBottom: '2rem',
          border: '2px solid var(--color-border)'
        }}>
          <YtGrid
            slots={slots}
            onSlotClick={handleSelectSlot}
            onSlotRemove={handleRemoveSlot}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
          />
        </div>
      </section>

      {/* アクションエリア */}
      <section style={{ maxWidth: '400px', margin: '3rem auto 0', padding: '0 1rem' }}>
        <input
          type="text"
          placeholder="あなたの名前（空欄可）"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            border: '2px solid var(--color-border)',
            borderRadius: '12px',
            padding: '0.8rem 1rem',
            color: 'var(--color-text)',
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '1.2rem'
          }}
        />
        <button
          onClick={handleShare}
          disabled={filledCount === 0 || isSharing}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '12px',
            background: filledCount > 0 ? 'linear-gradient(135deg, #FF0000 0%, #FF2E00 100%)' : '#444',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.1rem',
            border: 'none',
            cursor: filledCount > 0 ? 'pointer' : 'not-allowed',
            boxShadow: filledCount > 0 ? '0 8px 20px rgba(255,0,0,0.2)' : 'none',
            transition: 'all 0.2s ease'
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
            borderRadius: '12px',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontWeight: 700,
            fontSize: '1rem',
            border: '2px solid var(--color-border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          最初から作り直す（クリア）
        </button>
      </section>

      {/* URL入力モーダル */}
      {selectedSlotIndex !== null && (
        <YtSearchModal
          index={selectedSlotIndex}
          onClose={() => setSelectedSlotIndex(null)}
          onSelect={handleSetVideo}
        />
      )}

      {/* 新着の 9TUBE セクション */}
      <section style={{ marginTop: '5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '3rem' }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 900,
          textAlign: 'center',
          marginBottom: '2rem',
          letterSpacing: '-0.02em'
        }}>
          新着の 9TUBE 📺
        </h2>

        {isLoadingRecent ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '20px',
            padding: '0 0.5rem'
          }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: '240px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                animation: 'pulse 1.5s infinite ease-in-out'
              }} />
            ))}
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes pulse {
                0% { opacity: 0.5; }
                50% { opacity: 0.8; }
                100% { opacity: 0.5; }
              }
            `}} />
          </div>
        ) : recentLists.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '20px',
            padding: '0 0.5rem'
          }}>
            {recentLists.map((list) => (
              <YtListCard
                key={list.id}
                id={list.id}
                authorName={list.authorName}
                theme={list.theme}
                slots={list.slots}
              />
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', opacity: 0.5 }}>まだリストがありません</p>
        )}
      </section>

      {/* フッター的な隙間 */}
      <div style={{ height: '4rem' }} />
    </div>
  );
}
