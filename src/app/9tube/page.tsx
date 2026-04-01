'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { YouTubeSlot } from '@/types/youtube';
import { COLOR_THEMES, COLOR_THEMES_ORDER } from '@/lib/colors';
import YtGrid from '@/components/youtube/YtGrid';
import YtSearchModal from '@/components/youtube/YtSearchModal';

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
      document.body.style.backgroundColor = selected.bg;
      document.body.style.color = selected.text;
      document.body.style.transition = 'background-color 0.3s ease';
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
        router.push(`/9tube/list/${data.id}`);
      }
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setIsSharing(false);
    }
  };

  const filledCount = slots.filter(s => s !== null).length;
  const progressPct = (filledCount / 9) * 100;

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>9TUBE</h1>
        <p style={{ opacity: 0.8, fontWeight: 600 }}>あなたを構成する9つのYouTube</p>
      </header>

      {/* 設定セクション */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '1.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* 名前入力 */}
        <div>
          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>作成者名</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="あなたの名前"
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.1)',
              color: 'inherit',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
        </div>

        {/* テーマ選択 */}
        <div>
          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>リストのテーマ</label>
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '2px solid rgba(255,255,255,0.1)',
              color: 'inherit',
              fontSize: '1rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {THEMES.map(t => <option key={t.id} value={t.id} style={{ color: '#000' }}>{t.label}</option>)}
          </select>
        </div>

        {/* カラーピッカー */}
        <div>
          <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem', opacity: 0.7 }}>背景色</label>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {COLOR_THEMES_ORDER.map(id => {
              const c = COLOR_THEMES[id];
              const isSelected = colorThemeId === id;
              return (
                <button
                  key={id}
                  onClick={() => setColorThemeId(id)}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    flexShrink: 0,
                    backgroundColor: c.bg,
                    border: isSelected ? '3px solid #ff0000' : '2px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: 'none'
                  }}
                  title={c.name}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* プログレス */}
      <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', fontWeight: 800 }}>
          <span>{filledCount === 0 ? '動画を追加してください' : filledCount === 9 ? '完成！' : 'このまま保存も可能です'}</span>
          <span style={{ color: filledCount === 9 ? '#ff0000' : 'inherit' }}>{filledCount}/9</span>
        </div>
        <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: '#FF0000', transition: 'width 0.4s cubic-bezier(0.17, 0.67, 0.83, 0.67)' }} />
        </div>
      </div>

      {/* グリッド本体 */}
      <div style={{
        background: 'rgba(0,0,0,0.05)',
        padding: '12px',
        borderRadius: '20px',
        marginBottom: '2.5rem',
        boxShadow: 'none',
        filter: 'none'
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

      <button
        onClick={handleShare}
        disabled={filledCount === 0 || isSharing}
        style={{
          width: '100%',
          padding: '1.2rem',
          borderRadius: '20px',
          background: filledCount > 0 ? '#FF0000' : '#444',
          color: '#fff',
          fontSize: '1.25rem',
          fontWeight: 900,
          border: 'none',
          cursor: filledCount > 0 ? 'pointer' : 'not-allowed',
          boxShadow: 'none',
          filter: 'none',
          transition: 'all 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
          transform: isSharing ? 'scale(0.98)' : 'scale(1)'
        }}
      >
        {isSharing ? 'リストを作成中...' : '保存してシェア画像を作成'}
      </button>

      {/* URL入力モーダル */}
      {selectedSlotIndex !== null && (
        <YtSearchModal
          index={selectedSlotIndex}
          onClose={() => setSelectedSlotIndex(null)}
          onSelect={handleSetVideo}
        />
      )}

      {/* フッター的な隙間 */}
      <div style={{ height: '4rem' }} />
    </div>
  );
}
