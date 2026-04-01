'use client';

import React, { useState, useEffect } from 'react';

interface YtShareButtonsProps {
  id: string;
  authorName: string;
  theme?: string;
}

export default function YtShareButtons({ authorName, theme }: YtShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = theme 
    ? `${theme} - ${authorName}を構成する9つのYouTube` 
    : `${authorName}を構成する9つのYouTube`;
  
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=9coma,YouTube,私を構成する9つのYouTube`;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      justifyContent: 'center', 
      marginTop: '2rem',
      flexWrap: 'wrap'
    }}>
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: '#000000',
          color: 'white',
          borderRadius: '99px',
          textDecoration: 'none',
          fontWeight: 700,
          transition: 'opacity 0.2s ease',
          fontSize: '14px'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X でシェア
      </a>
      <button
        onClick={handleCopy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: '99px',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '14px'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 13v-1a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copied ? 'コピーしました！' : 'URLをコピー'}
      </button>
    </div>
  );
}
