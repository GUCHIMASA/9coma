'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const PatternA: React.FC = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const expiry = localStorage.getItem('to_manga_banner_expiry_a');
    if (!expiry || Date.now() > Number(expiry)) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    // 10分後のタイムスタンプを保存
    const tenMinutes = 10 * 60 * 1000;
    localStorage.setItem('to_manga_banner_expiry_a', (Date.now() + tenMinutes).toString());
  };

  const handleNavigate = () => {
    // マンガ版への遷移（ルートパス）
    router.push('/');
  };

  if (!isVisible) return null;

  return (
    <div 
      onClick={handleNavigate}
      style={{
        width: '100%',
        backgroundColor: '#FFD600', // 9comaカラー（イエロー）
        color: '#1A1A1A',
        padding: '0.6rem 1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        borderBottom: '2px solid #1A1A1A',
        zIndex: 1100,
        animation: 'slideDown 0.4s ease-out',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />

      <span style={{
        backgroundColor: '#1A1A1A',
        color: '#FFFFFF',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 900,
      }}>
        MANGA
      </span>

      <p style={{
        margin: 0,
        fontSize: '0.9rem',
        fontWeight: 800,
      }}>
        マンガ版で「私を構成する9つのマンガ」を作りませんか？ 📚
      </p>

      <button 
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#1A1A1A',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '4px',
          opacity: 0.6,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default PatternA;
