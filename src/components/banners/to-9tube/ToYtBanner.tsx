'use client';

import React from 'react';
import PatternA from './PatternA';
import PatternB from './PatternB';
import PatternC from './PatternC';

/**
 * 9TUBE 誘導バナーのエントリポイント
 * テストしたいパターンのコメントを外して使用してください。
 */
const YtPortalBanner: React.FC = () => {
  // テストしたいパターンのコメントを外して active に代入してください。
  const active: string = 'A'; // 'A' | 'B' | 'C'

  if (active === 'B') return <PatternB />;
  if (active === 'C') return <PatternC />;
  
  // デフォルトは A
  return <PatternA />;
};

export default YtPortalBanner;
