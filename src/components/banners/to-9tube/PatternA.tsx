'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PatternA: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const expiry = localStorage.getItem('9tube_banner_expiry');
    if (!expiry || Date.now() > Number(expiry)) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    // 10分後のタイムスタンプを保存
    const tenMinutes = 10 * 60 * 1000;
    localStorage.setItem('9tube_banner_expiry', (Date.now() + tenMinutes).toString());
  };

  const handleNavigate = () => {
    router.push('/9tube');
  };

  if (!isVisible) return null;

  return (
    <div 
      onClick={handleNavigate}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        width: '100%',
        background: 'linear-gradient(90deg, #FF0000 0%, #D50000 100%)',
        color: '#FFFFFF',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        animation: 'slideDown 0.4s ease-out',
        userSelect: 'none',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        }
        @keyframes pulseBadge {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}} />
      
      <span style={{
        backgroundColor: '#FFFFFF',
        color: '#FF0000',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 900,
        letterSpacing: '0.05em',
        animation: 'pulseBadge 2s infinite',
        flexShrink: 0,
      }}>
        NEW
      </span>

      <p style={{
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: 1.4,
        flex: 1,
      }}>
        私を構成する9つのYouTube「9TUBE」登場！ 📺
      </p>

      <button 
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          color: '#FFFFFF',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 1)';
          e.currentTarget.style.color = '#FF0000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.color = '#FFFFFF';
        }}
      >
        使ってみる
      </button>

      <button 
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
        title="閉じる"
      >
        ×
      </button>

      <style jsx>{`
        @media (max-width: 480px) {
          p {
            font-size: 0.8rem !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PatternA;
