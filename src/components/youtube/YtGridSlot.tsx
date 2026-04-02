'use client';

import React from 'react';
import Image from 'next/image';
import { YouTubeSlot } from '@/types/youtube';

interface YtGridSlotProps {
  slot: YouTubeSlot | null;
  index: number;
  onClick?: () => void;
  onRemove?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  isReadOnly?: boolean;
}

/**
 * 9TUBE スロットコンポーネント
 * 負荷を最小化し、絶対的な正方形を維持する堅牢な実装
 */
export default function YtGridSlot({
  slot,
  index,
  onClick,
  onRemove,
  isDragging,
  isDragOver,
  isReadOnly = false,
}: YtGridSlotProps) {
  
  // 共通のベーススタイル（正方形維持のためのラッパー）
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingTop: '100%', // 1:1 を確実に維持するハック
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: slot ? '#000' : 'rgba(255,255,255,0.03)',
    cursor: isReadOnly ? 'default' : (slot ? 'grab' : 'pointer'),
    border: !isReadOnly && isDragOver ? '3px solid #FF0000' : (slot ? 'none' : '2px dashed rgba(255,255,255,0.1)'),
    transition: 'all 0.2s ease',
    opacity: isDragging ? 0.5 : 1,
  };

  // --- A. 空のスロット ---
  if (!slot) {
    return (
      <div onClick={onClick} style={baseStyle}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FF0000', opacity: 0.1 }}>
            {index + 1}
          </span>
        </div>
      </div>
    );
  }

  // --- B. コンテンツがあるスロット ---
  const { imageUrl, title, type, url } = slot;

  // 閲覧モードの場合は <a> タグ、作成モードの場合は <div> タグとして振る舞う
  const Tag = (isReadOnly && url) ? 'a' : 'div';
  const tagProps = (isReadOnly && url) ? {
    href: url,
    target: '_blank',
    rel: 'noopener noreferrer',
    title: `${title} をYouTubeで開く`
  } : {
    onClick: onClick
  };

  return (
    <Tag 
      {...tagProps}
      style={{
        ...baseStyle,
        display: 'block',
        textDecoration: 'none'
      }}
      className={isReadOnly ? 'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]' : 'hover:scale-[1.01]'}
    >
      {/* 1. 背景 (はみ出し) */}
      <div style={{
        position: 'absolute',
        top: '-39%', left: '-39%', width: '178%', height: '178%',
        zIndex: 0, pointerEvents: 'none'
      }}>
        <Image
          src={imageUrl}
          alt=""
          fill
          unoptimized
          priority
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* 2. 遮光 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1
      }} />

      {/* 3. 前面画像 (contain) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2
      }}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          unoptimized
          style={{ objectFit: isReadOnly ? 'cover' : 'contain' }}
        />
      </div>

      {/* 4. タイトル */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '20px 8px 8px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
        zIndex: 3,
        textAlign: 'center'
      }}>
        <span style={{
          color: '#fff', fontSize: '12px', fontWeight: 700,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: '1.2', overflow: 'hidden'
        }}>
          {title}
        </span>
      </div>

      {/* CHバッジ */}
      {type === 'channel' && (
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '4px', color: '#000', fontSize: '9px', fontWeight: 900,
          zIndex: 4
        }}>
          CH
        </div>
      )}

      {/* 削除ボタン */}
      {!isReadOnly && onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(e); }}
          style={{
            position: 'absolute', top: '6px', right: '6px',
            width: '24px', height: '24px', borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)', fontSize: '14px',
            fontWeight: 'bold', cursor: 'pointer', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ×
        </button>
      )}
    </Tag>
  );
}
