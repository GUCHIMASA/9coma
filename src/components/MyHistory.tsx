'use client';

import React, { useState, useEffect } from 'react';
import { THEME_GRADIENTS } from '@/lib/themes';

interface HistoryItem {
  id: string;
  theme?: string;
  date: number;
}

interface MyHistoryProps {
  storageKey: string;
  basePath: string;
  title?: string;
}

/**
 * ユーザーの作成履歴を表示する共通コンポーネント
 */
export default function MyHistory({ storageKey, basePath, title = '🕒 最近あなたが作ったリスト' }: MyHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(storageKey);
    console.log(`[MyHistory] Reading storage key: ${storageKey}`);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log(`[MyHistory] Parsed history items:`, parsed);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } catch (e) {
        console.error(`[MyHistory] Parsing failed for ${storageKey}:`, e);
      }
    } else {
      console.log(`[MyHistory] No history found for ${storageKey}`);
    }
  }, [storageKey]);

  // ハイドレーションエラー防止
  if (!isMounted) return null;
  if (history.length === 0) {
    // 開発中の確認用に、非表示にするだけでなく、空の状態ならコメントアウトとして DOM に残るようにしてもいいが
    // ここではデータがないなら完全に非表示にする。
    return null;
  }

  return (
    <div 
      className="my-history-section"
      style={{
        marginTop: '2rem',
        padding: '1.2rem',
        background: 'var(--color-surface)',
        borderRadius: '16px',
        border: '2px dashed var(--color-border)',
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      <h3 style={{
        fontSize: '0.9rem',
        fontWeight: 800,
        color: 'var(--color-text-secondary)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <span>{title}</span>
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {history.map((item) => {
          // テーマグラデーションの取得。キーが一致しない（または undefined/空）場合はフォールバック
          const themeKey = item.theme || '';
          const gradient = THEME_GRADIENTS[themeKey] || 'rgba(0,0,0,0.1)';
          const isThemed = !!THEME_GRADIENTS[themeKey];
          
          return (
            <a
              key={item.id}
              href={`${basePath}${item.id}`}
              style={{
                padding: '0.6rem 1rem',
                background: gradient,
                color: isThemed ? '#fff' : 'var(--color-text)',
                borderRadius: '99px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: isThemed ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                display: 'inline-flex',
                alignItems: 'center',
                border: isThemed ? 'none' : '1px solid var(--color-border)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                if (isThemed) e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                if (isThemed) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }}
            >
              {item.theme ? `#${item.theme}` : '（テーマなし）'}
            </a>
          );
        })}
      </div>
    </div>
  );
}
