'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface YtShareButtonsProps {
  id: string;
  authorName: string;
  theme?: string;
}

export default function YtShareButtons({ id, authorName, theme }: YtShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const shareOnX = () => {
    if (!currentUrl) return;
    const themeText = theme ? `：${theme}` : '';
    const text = `${authorName}を構成する9つのYouTube${themeText}\n#9TUBE #9コマ #9coma #9koma\n`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  const handleImageShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const response = await fetch(`/9tube/list/${id}/share-image`);
      if (!response.ok) throw new Error('Failed to generate image');

      const blob = await response.blob();
      const file = new File([blob], '9tube-share.png', { type: 'image/png' });

      // Web Share API 対応確認
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        const themeText = theme ? `：${theme}` : '';
        const shareText = `${authorName}を構成する9つのYouTube${themeText}\n${currentUrl}\n#9TUBE #9コマ #9coma #9koma #私を構成する9つのYouTube`;

        await navigator.share({
          files: [file],
          title: '9TUBE - 私を構成する9つのYouTube',
          text: shareText,
          url: currentUrl,
        });
      } else {
        // フォールバック: ダウンロード
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `9tube-${id}.png`;
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
    <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Xでシェアボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={shareOnX}
          style={{
            width: '100%',
            padding: '1.2rem',
            borderRadius: '12px',
            background: '#000',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: '3px solid #000',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>𝕏 でシェア</span>
        </button>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', margin: 0 }}>
          XやInstagramで「横長サムネイル」として表示されます
        </p>
      </div>

      {/* 画像でシェアボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleImageShare}
          disabled={isSharing}
          style={{
            width: '100%',
            padding: '1.2rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4b5563, #1f2937)',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            opacity: isSharing ? 0.7 : 1,
            cursor: isSharing ? 'wait' : 'pointer'
          }}
        >
          <span>{isSharing ? '画像を作成中です...' : '📸 画像でシェア (スマホ推奨)'}</span>
        </button>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', margin: 0 }}>
          「縦長 3×3」の画像を生成し、他のアプリへ受け渡します
        </p>
      </div>
      
      {/* マンガ版への誘導リンク（9TUBE専用に修正） */}
      <a
        href="/"
        style={{
          width: '100%',
          padding: '1.2rem',
          borderRadius: '12px',
          background: '#FFD600',
          color: '#000',
          fontWeight: 900,
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(255,214,0,0.2)',
          transition: 'all 0.2s ease',
          textDecoration: 'none',
        }}
      >
        <span>次は &quot;マンガ版&quot;で作ってみる ➔</span>
      </a>

      <div style={{ display: 'flex', gap: '12px' }}>
        {/* 左側：「戻る（作り直す）」ボタン */}
        <Link
          href="/9tube"
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            color: 'inherit',
            fontWeight: 700,
            fontSize: '1rem',
            border: '2px solid currentColor',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
          }}
        >
          戻る
        </Link>

        {/* 右側：他人のリストをクローンする機能 */}
        <Link
          href={`/9tube?clone=${id}`}
          style={{
            flex: 1,
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.05)',
            color: 'inherit',
            fontWeight: 700,
            fontSize: '1rem',
            border: '2px solid currentColor',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>✨ コピーして編集</span>
        </Link>
      </div>
    </div>
  );
}
