'use client';

import React from 'react';

interface AuthorShareButtonsProps {
  xShareUrl: string;
}

export default function AuthorShareButtons({ xShareUrl }: AuthorShareButtonsProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
      <a
        href={xShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '0.8rem 1.5rem',
          background: '#000',
          color: 'white',
          borderRadius: '2rem',
          fontWeight: 800,
          fontSize: '1rem',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-md)',
          transition: 'var(--transition-fast)'
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => e.currentTarget.style.transform = 'scale(1)'}
      >
        𝕏 でシェア
      </a>
    </div>
  );
}
