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

  // プレビューモーダル用の状態
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
    setShowPreview(true);

    try {
      const response = await fetch(`/9tube/list/${id}/share-image`);
      if (!response.ok) throw new Error('Failed to generate image');

      const blob = await response.blob();
      const file = new File([blob], '9tube-share.png', { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      setShareFile(file);
    } catch (err) {
      console.error('Generation failed:', err);
      setError('画像の生成に失敗しました。');
    } finally {
      setIsSharing(false);
    }
  };

  const executeShare = async () => {
    if (!shareFile) return;

    try {
      const themeText = theme ? `：${theme}` : '';
      const shareText = `${authorName}を構成する9つのYouTube${themeText}\n${currentUrl}\n#9TUBE #9コマ #9coma #9koma #私を構成する9つのYouTube`;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [shareFile] })) {
        await navigator.share({
          files: [shareFile],
          title: '9TUBE - 私を構成する9つのYouTube',
          text: shareText,
          url: currentUrl,
        });
      } else {
        // フォールバック: ダウンロード
        const a = document.createElement('a');
        a.href = previewUrl!;
        a.download = `9tube-${id}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setShareFile(null);
    setError(null);
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
          <span>📸 画像でシェア (スマホ推奨)</span>
        </button>
        <p style={{ fontSize: '0.75rem', opacity: 0.7, textAlign: 'center', margin: 0 }}>
          「縦長 3×3」の画像を生成し、他のアプリへ受け渡します
        </p>
      </div>
      
      {/* マンガ版への誘導リンク */}
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

      {/* プレビューモーダル */}
      {showPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <button
              onClick={closePreview}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '36px',
                height: '36px',
                borderRadius: '18px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ✕
            </button>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>シェア画像のプレビュー</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>この内容でSNSへ共有します</p>
              </div>

              <div style={{ 
                width: '100%', 
                minHeight: '300px', 
                backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {isSharing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="spinner" style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid rgba(255, 255, 255, 0.1)',
                      borderTop: '4px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>9TUBEが画像を作成しています...</p>
                  </div>
                ) : error ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ color: '#ff4b4b', fontWeight: 600 }}>{error}</p>
                    <button onClick={handleImageShare} style={{ 
                      marginTop: '12px', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      border: 'none'
                    }}>再試行</button>
                  </div>
                ) : previewUrl ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Share Preview" 
                      style={{ width: '100%', height: 'auto', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                    />
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', margin: 0 }}>
                      ※iOSで共有が反応しない場合は、画像を長押しして保存してください
                    </p>
                  </div>
                ) : null}
              </div>

              {!isSharing && previewUrl && (
                <button
                  onClick={executeShare}
                  style={{
                    width: '100%',
                    marginTop: '24px',
                    padding: '1.2rem',
                    borderRadius: '16px',
                    backgroundColor: '#FF0000',
                    color: 'white',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(255, 0, 0, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  🚀 SNSで共有する
                </button>
              )}
            </div>
          </div>
          
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleUp {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
