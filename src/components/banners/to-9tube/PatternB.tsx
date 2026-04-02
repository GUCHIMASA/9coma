'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PatternB: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const expiry = localStorage.getItem('9tube_banner_expiry_b');
    if (!expiry || Date.now() > Number(expiry)) {
      const timer = setTimeout(() => setIsVisible(true), 1500); // 少し遅れて表示
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    // 10分後のタイムスタンプを保存
    const tenMinutes = 10 * 60 * 1000;
    localStorage.setItem('9tube_banner_expiry_b', (Date.now() + tenMinutes).toString());
  };

  const handleNavigate = () => {
    router.push('/9tube');
  };

  if (!isVisible) return null;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNavigate}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1200,
        backgroundColor: '#FF0000',
        color: '#FFFFFF',
        padding: isHovered ? '12px 24px' : '10px 18px',
        borderRadius: '50px',
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(255, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isHovered ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
        maxWidth: '300px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounceIn {
          0% { transform: scale(0) translateY(100px); opacity: 0; }
          70% { transform: scale(1.1) translateY(-10px); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}} />
      
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#FFFFFF',
        animation: 'pulseDot 2s infinite',
        flexShrink: 0,
      }} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 900,
          opacity: 0.9,
          letterSpacing: '0.05em',
        }}>
          9TUBE RELEASE
        </span>
        {isHovered && (
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            animation: 'fadeIn 0.3s ease-out',
            whiteSpace: 'nowrap',
          }}>
            YouTube版を使ってみる 📺
          </span>
        )}
      </div>

      {!isHovered && (
         <span style={{ fontSize: '1.2rem' }}>📺</span>
      )}

      <button 
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#1A1A1A',
          color: '#FFFFFF',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          cursor: 'pointer',
          border: '2px solid #FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        ×
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        div {
          animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default PatternB;
