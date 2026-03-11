'use client';

import React, { useEffect } from 'react';

interface AdUnitProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  minHeight?: string;
  maxHeight?: string;
}

const AdUnit: React.FC<AdUnitProps> = ({ 
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
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense integration error:', e);
    }
  }, []);

  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  if (!pubId) return null;

  return (
    <div 
      className="adsense-container"
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

export default AdUnit;
