'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { MangaItem } from '@/types';
import PromotionUnit from '@/components/PromotionUnit';

interface ListViewClientProps {
  data: {
    slots: (MangaItem | null)[];
    authorName: string;
    theme?: string;
  };
}

export default function ListViewClient({ data }: ListViewClientProps) {
  const params = useParams();
  const id = params.id as string;
  const [isSharing, setIsSharing] = useState(false);

  const copyUrl = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    alert('URLをコピーしました！');
  };

  const shareOnX = () => {
    if (typeof window === 'undefined') return;
    const themeText = data.theme ? `：${data.theme}` : '';
    const text = `${data.authorName}を構成する9つのマンガ${themeText}\n#9コマ #9coma #9koma #My9manga\n`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleImageShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const response = await fetch(`/list/${id}/share-image`);
      if (!response.ok) throw new Error('Failed to generate image');

      const blob = await response.blob();
      const file = new File([blob], '9coma-share.png', { type: 'image/png' });

      // Check if navigator.share is available and supports files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        const themeText = data.theme ? `：${data.theme}` : '';
        const shareUrl = window.location.href;
        const shareText = `${data.authorName}を構成する9つのマンガ${themeText}\n${shareUrl}\n#9コマ #9coma #9koma #My9manga #私を構成する9つのマンガ`;

        await navigator.share({
          files: [file],
          title: '9コマ - 私を構成する9つのマンガ',
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback for PC or unsupported browsers: Download or Open
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `9coma-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('画像の共有に失敗しました。');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* 9つのマンガを並べるグリッドレイアウト（背景が少し暗い領域） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: 'var(--color-border)', padding: '12px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)' }}>
        {data.slots.map((manga, idx) => (
          <div
            key={idx}
            style={{
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              aspectRatio: '1 / 1.4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-border)'
            }}
          >
            {manga ? (
              <a href={manga.affiliateUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'block', position: 'relative' }}>
                {/* 1. マンガの表紙画像エリア */}
                <img src={manga.imageUrl} alt={manga.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: '3px 3px',
                  background: 'rgba(26, 26, 26, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* タイトルのテキスト要素（最大2行で省略する設定） */}
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.2'
                  }}>
                    {manga.title}
                  </span>
                </span>
              </a>
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'var(--color-surface-2)' }} />
            )}
          </div>
        ))}
      </div>

      {/* シェア＆コピー＆クローン用のボタン領域群（グリッド枠の下の固まり全体） */}
      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {/* Xでシェアボタン（一番目立つ黒背景ボタン） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={shareOnX}
            style={{
              width: '100%',
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              background: '#000',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: '3px solid #000',
              boxShadow: 'var(--shadow-md)',
              transition: 'var(--transition-base)'
            }}
          >
            <span>𝕏 でシェア</span>
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', margin: 0 }}>
            XやInstagramで「横長サムネイル」として表示されます
          </p>
        </div>

        {/* 画像でシェアボタン (スマホ推奨) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleImageShare}
            disabled={isSharing}
            style={{
              width: '100%',
              padding: '1.2rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #4b5563, #1f2937)',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: 'none',
              boxShadow: 'var(--shadow-md)',
              transition: 'var(--transition-base)',
              opacity: isSharing ? 0.7 : 1,
              cursor: isSharing ? 'wait' : 'pointer'
            }}
          >
            <span>{isSharing ? '画像を作成中です...' : '📸 画像でシェア (スマホ推奨)'}</span>
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center', margin: 0 }}>
            「縦長 3×3」の画像を生成し、他のアプリへ受け渡します
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* 左側：「URLをコピー」ボタン */}
          <button
            onClick={copyUrl}
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: 700,
              fontSize: '1rem',
              border: '3px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'var(--transition-base)'
            }}
          >
            URLをコピー
          </button>

          {/* 右側：「戻る（編集し直す）」ボタン */}
          <a
            href="/"
            style={{
              flex: 1,
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontWeight: 700,
              fontSize: '1rem',
              border: '3px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              textAlign: 'center',
              transition: 'var(--transition-base)',
              textDecoration: 'none',
            }}
          >
            戻る
          </a>
        </div>

        {/* コピーして編集ボタン（他人のリストをクローンする機能） */}
        <a
          href={`/?clone=${id}`}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface)',
            color: 'var(--color-primary)',
            fontWeight: 800,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '2px solid var(--color-primary)',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition-base)',
            textDecoration: 'none',
          }}
        >
          <span>✨ コピーして編集</span>
        </a>
      </div>

      {/* リスト形式の販売リンク集（罫線区切り版） */}
      <section style={{ marginTop: '4rem', padding: '1.2rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>🛒 気になった作品をチェック</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {data.slots.map((manga, idx) => {
            if (!manga) return null;

            // Amazon トラッキング ID を設定
            const AMAZON_ASSOCIATE_ID = '9coma-22';
            const displayTitle = manga.title;
            const linkKeyword = manga.title;
            const amazonUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(linkKeyword)}&i=stripbooks${AMAZON_ASSOCIATE_ID ? `&tag=${AMAZON_ASSOCIATE_ID}` : ''}`;

            // 楽天ブックス 検索URL
            const rakutenUrl = manga.affiliateUrl || `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(manga.title)}/`;

            const isLast = idx === data.slots.reduce((last, m, i) => m ? i : last, -1);

            return (
              <div
                key={idx}
                style={{
                  padding: '1rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  borderBottom: isLast ? 'none' : '1px dashed var(--color-border)',
                }}
              >
                {/* 左側: タイトル */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    <span style={{ color: 'var(--color-primary)', marginRight: '6px' }}>#{idx + 1}</span>
                    {displayTitle}
                  </p>
                  {manga.author && (
                    <div style={{ marginTop: '2px' }}>
                      <Link
                        href={`/author/${encodeURIComponent(manga.author)}`}
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {manga.author}
                      </Link>
                    </div>
                  )}
                </div>

                {/* 右側: ボタン群 */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <a
                    href={rakutenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 0.9rem',
                      background: '#bf0000', // 楽天
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      transition: 'var(--transition-fast)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    楽天
                  </a>
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 0.9rem',
                      background: '#FF9900', // Amazon
                      color: '#111',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      transition: 'var(--transition-fast)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Amazon
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: '1.2rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          ※在庫状況や価格はリンク先でご確認ください
        </p>
      </section>

      {/* 詳細ページ最下部広告 */}
      <PromotionUnit slotId="list-bottom" maxHeight="280px" />
    </div>
  );
}
