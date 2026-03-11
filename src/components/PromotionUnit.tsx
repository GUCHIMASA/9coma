'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

interface PromotionUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  minHeight?: string;
  maxHeight?: string;
}

const PromotionUnit: React.FC<PromotionUnitProps> = ({ 
  slotId, 
  format = 'auto', 
  responsive = 'true', 
  style,
  minHeight,
  maxHeight
}) => {
  useEffect(() => {
    // localhost では実際に広告を読み込まない（エラー回避のため）
    if (window.location.hostname === 'localhost') return;

    try {
      const adsbygoogle = window.adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense integration error:', e);
    }
  }, []);

  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  if (!pubId) return null;

  return (
    <div 
      className="promotion-container"
      style={{ 
        textAlign: 'center', 
        margin: '2rem 0', 
        ...style 
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          minHeight: minHeight || 'auto',
          maxHeight: maxHeight || 'auto',
          overflow: 'hidden'
        }}
        data-ad-client={`ca-${pubId}`}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default PromotionUnit;
