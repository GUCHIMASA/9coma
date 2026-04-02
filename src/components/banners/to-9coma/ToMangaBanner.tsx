'use client';

import React from 'react';
import PatternA from './PatternA';

/**
 * マンガ版（9coma）への誘導バナー
 * 9TUBE 側のページ最上部に設置することを想定しています。
 */
const ToMangaBanner: React.FC = () => {
  const active: string = 'A'; // 今後パターン B, C を追加予定

  switch (active) {
    case 'A':
      return <PatternA />;
    default:
      return <PatternA />;
  }
};

export default ToMangaBanner;
