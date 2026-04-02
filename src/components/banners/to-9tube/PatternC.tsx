'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PatternC: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const expiry = localStorage.getItem('9tube_banner_expiry_c');
    if (!expiry || Date.now() > Number(expiry)) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    // 10分後のタイムスタンプを保存
    const tenMinutes = 10 * 60 * 1000;
    localStorage.setItem('9tube_banner_expiry_c', (Date.now() + tenMinutes).toString());
  };

  const handleNavigate = () => {
    router.push('/9tube');
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        animation: 'fadeInSlow 1s ease-out',
        position: 'relative',
        zIndex: 1050,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInSlow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes subtleFlash {
          0%, 100% { color: #FF0000; }
          50% { color: #D50000; }
        }
      `}} />

      <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s',
      }}
      onClick={handleNavigate}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 900,
          color: '#FF0000',
          border: '1px solid #FF0000',
          padding: '1px 4px',
          borderRadius: '2px',
          letterSpacing: '0.05em',
        }}>
          NEW
        </span>

        <p style={{
          margin: 0,
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#495057',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{ animation: 'subtleFlash 2s infinite' }}>📺</span>
          <span>YouTubeで「私を構成する9つ」を作れるようになりました！</span>
          <span style={{
            color: '#FF0000',
            textDecoration: 'underline',
            fontSize: '0.8rem',
            marginLeft: '4px',
          }}>
            今すぐ試す →
          </span>
        </p>
      </div>

      <button 
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#adb5bd',
          fontSize: '1rem',
          cursor: 'pointer',
          marginLeft: '12px',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#495057'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#adb5bd'}
        title="非表示にする"
      >
        ×
      </button>

      <style jsx>{`
        @media (max-width: 640px) {
          p span:nth-child(2) {
             display: none;
          }
          p::after {
             content: "YouTube版が登場！";
          }
        }
      `}</style>
    </div>
  );
};

export default PatternC;
