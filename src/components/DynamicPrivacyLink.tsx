'use client';

import { usePathname } from 'next/navigation';

export default function DynamicPrivacyLink() {
  const pathname = usePathname();
  
  // パスが /9tube で始まる場合はYouTube版の規約へ、それ以外はマンガ版へ
  const href = pathname?.startsWith('/9tube') ? '/9tube/privacy' : '/privacy';

  return (
    <a href={href} style={{ color: 'var(--color-text-secondary)', textDecoration: 'underline' }}>
      プライバシーポリシー
    </a>
  );
}
